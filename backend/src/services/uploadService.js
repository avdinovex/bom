import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../config/logger.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

// Upload to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: options.folder || 'ride-booking',
          // Remove automatic transformations to preserve original image
          transformation: options.transformation || [],
          // Preserve original format and quality
          quality: options.quality || 'auto',
          fetch_format: options.fetch_format || 'auto',
          // Ensure no cropping occurs
          crop: options.crop || 'limit',
          // Preserve aspect ratio
          flags: options.flags || 'preserve_transparency',
          ...options
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(new ApiError(500, 'File upload failed'));
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    logger.error('Upload service error:', error);
    throw new ApiError(500, 'File upload failed');
  }
};

// Upload remote URL to Cloudinary
export const uploadRemoteToCloudinary = async (url, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      resource_type: 'image',
      folder: options.folder || 'ride-booking',
      quality: options.quality || 'auto',
      fetch_format: options.fetch_format || 'auto',
      crop: options.crop || 'limit',
      flags: options.flags || 'preserve_transparency',
      ...options
    });
    return result;
  } catch (error) {
    logger.error('Cloudinary remote upload error:', error);
    throw new ApiError(500, 'Remote file upload failed');
  }
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicIdOrUrl) => {
  try {
    // Extract public ID from URL if a full URL is provided
    let publicId = publicIdOrUrl;
    
    if (publicIdOrUrl && publicIdOrUrl.includes('cloudinary.com')) {
      // Extract public ID from Cloudinary URL
      // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
      const urlParts = publicIdOrUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
        // Get everything after 'upload' and the version (v123456)
        const afterUpload = urlParts.slice(uploadIndex + 1);
        // Remove version if present (starts with 'v' followed by numbers)
        const withoutVersion = afterUpload[0].startsWith('v') && !isNaN(afterUpload[0].substring(1))
          ? afterUpload.slice(1)
          : afterUpload;
        
        // Join the parts and remove file extension
        publicId = withoutVersion.join('/').replace(/\.[^/.]+$/, '');
      }
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info('File deleted from Cloudinary:', publicId);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw new ApiError(500, 'File deletion failed');
  }
};

// Upload middleware
export const uploadSingle = (fieldName) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (req.file) {
          const result = await uploadToCloudinary(req.file.buffer, {
            folder: `ride-booking/${fieldName}`,
            // Preserve original image without any cropping
            crop: 'limit',
            quality: 'auto',
            flags: 'preserve_transparency'
          });
          req.file.cloudinaryUrl = result.secure_url;
          req.file.cloudinaryPublicId = result.public_id;
          req.uploadedFile = {
            url: result.secure_url,
            publicId: result.public_id
          };
        }
        next();
      } catch (error) {
        next(error);
      }
    }
  ];
};

// Upload multiple files
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        if (req.files && req.files.length > 0) {
          const uploadPromises = req.files.map(file => 
            uploadToCloudinary(file.buffer, {
              folder: `ride-booking/${fieldName}`,
              // Preserve original image without any cropping
              crop: 'limit',
              quality: 'auto',
              flags: 'preserve_transparency'
            })
          );
          
          const results = await Promise.all(uploadPromises);
          req.uploadedFiles = results.map(result => ({
            url: result.secure_url,
            publicId: result.public_id
          }));
        }
        next();
      } catch (error) {
        next(error);
      }
    }
  ];
};

// Upload multiple fields in one pass (e.g., single cover + multiple gallery)
export const uploadFields = (fields) => {
  return [
    upload.fields(fields),
    async (req, res, next) => {
      try {
        req.uploadedFilesByField = {};
        const fieldNames = fields.map(f => f.name);

        const uploadsByField = await Promise.all(fieldNames.map(async (name) => {
          const files = (req.files && req.files[name]) ? req.files[name] : [];
          if (!files || files.length === 0) return { name, results: [] };
          const results = await Promise.all(files.map(file => 
            uploadToCloudinary(file.buffer, {
              folder: `ride-booking/${name}`,
              crop: 'limit',
              quality: 'auto',
              flags: 'preserve_transparency'
            }).then(result => ({ url: result.secure_url, publicId: result.public_id }))
          ));
          return { name, results };
        }));

        uploadsByField.forEach(({ name, results }) => {
          req.uploadedFilesByField[name] = results;
        });

        // Backward compatibility helpers
        if (req.uploadedFilesByField.coverImage && req.uploadedFilesByField.coverImage[0]) {
          req.uploadedFile = req.uploadedFilesByField.coverImage[0];
        }
        if (req.uploadedFilesByField.gallery && req.uploadedFilesByField.gallery.length > 0) {
          req.uploadedFiles = req.uploadedFilesByField.gallery;
        }

        next();
      } catch (error) {
        next(error);
      }
    }
  ];
};