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
    fileSize: 5 * 1024 * 1024 // 5MB limit
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
          transformation: options.transformation || [
            { quality: 'auto:good' },
            { format: 'auto' }
          ],
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

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
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
            folder: `ride-booking/${fieldName}`
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
              folder: `ride-booking/${fieldName}`
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