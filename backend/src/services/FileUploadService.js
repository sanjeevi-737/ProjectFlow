import { v2 as cloudinary } from 'cloudinary';
import config from '../config/index.js';
import logger from '../utils/logger.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

class FileUploadService {
  async uploadFile(buffer, options = {}) {
    const { folder = 'projflow', publicId, resourceType = 'auto' } = options;

    return new Promise((resolve, reject) => {
      const uploadOptions = { folder, resource_type: resourceType };
      if (publicId) uploadOptions.public_id = publicId;

      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(new Error('File upload failed'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            mimetype: result.resource_type === 'raw' ? 'application/octet-stream' : result.format,
          });
        }
      });

      stream.end(buffer);
    });
  }

  async deleteFile(publicId) {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
    }
  }

  async uploadAvatar(buffer, oldPublicId) {
    if (oldPublicId) await this.deleteFile(oldPublicId);
    return this.uploadFile(buffer, { folder: 'projflow/avatars', resourceType: 'image' });
  }

  async uploadAttachment(buffer) {
    return this.uploadFile(buffer, { folder: 'projflow/attachments' });
  }
}

export default new FileUploadService();
