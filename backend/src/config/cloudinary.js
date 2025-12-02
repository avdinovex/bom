import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Check if Cloudinary credentials are available
const hasCloudinaryCredentials = !!
  (process.env.CLOUDINARY_CLOUD_NAME && 
   process.env.CLOUDINARY_API_KEY && 
   process.env.CLOUDINARY_API_SECRET);

if (hasCloudinaryCredentials) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️ Cloudinary credentials not found in environment variables');
}

export { hasCloudinaryCredentials };
export default cloudinary;