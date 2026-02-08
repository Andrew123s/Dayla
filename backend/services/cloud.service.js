const cloudinary = require('cloudinary').v2;
const config = require('../config/env.config');
const logger = require('../utils/logger');

// Configure Cloudinary
// Use CLOUDINARY_URL if available, otherwise use individual credentials
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

// Upload file to Cloudinary
const uploadFile = async (fileBuffer, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'dayla',
      resource_type: 'auto',
      // Don't set format or quality in upload options, only in transformations
    };

    const uploadOptions = { ...defaultOptions, ...options };

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream
      const bufferStream = require('stream').Readable.from(fileBuffer);
      bufferStream.pipe(stream);
    });

    logger.info(`File uploaded to Cloudinary: ${result.public_id}`);

    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration, // for videos/audio
      metadata: {
        original_filename: result.original_filename,
        resource_type: result.resource_type,
        created_at: result.created_at
      }
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      logger.info(`File deleted from Cloudinary: ${publicId}`);
      return { success: true };
    } else {
      throw new Error(`Failed to delete file: ${result.result}`);
    }
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    format: 'auto',
    width: 800,
    height: 600,
    crop: 'fill',
  };

  const transformOptions = { ...defaultOptions, ...options };
  return cloudinary.url(publicId, transformOptions);
};

// Generate thumbnail URL
const getThumbnailUrl = (publicId, size = 150) => {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'thumb',
    quality: 'auto',
    format: 'auto'
  });
};

// Upload multiple files
const uploadMultipleFiles = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadFile(file.buffer, {
      ...options,
      public_id: file.publicId || undefined,
      folder: options.folder || 'dayla'
    }));

    const results = await Promise.allSettled(uploadPromises);

    const successful = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason);

    return {
      successful,
      failed,
      totalUploaded: successful.length,
      totalFailed: failed.length
    };
  } catch (error) {
    logger.error('Multiple upload error:', error);
    throw new Error(`Multiple file upload failed: ${error.message}`);
  }
};

// Create folder in Cloudinary
const createFolder = async (folderName) => {
  try {
    // Cloudinary folders are created automatically when uploading
    // This is just a placeholder for any folder-specific setup
    logger.info(`Folder created/verified: ${folderName}`);
    return { success: true, folder: folderName };
  } catch (error) {
    logger.error('Create folder error:', error);
    throw new Error(`Folder creation failed: ${error.message}`);
  }
};

// Get file info
const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      success: true,
      info: {
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        createdAt: result.created_at,
        url: result.secure_url,
        resourceType: result.resource_type
      }
    };
  } catch (error) {
    logger.error('Get file info error:', error);
    throw new Error(`Failed to get file info: ${error.message}`);
  }
};

// Batch delete files
const deleteMultipleFiles = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteFile(publicId));
    const results = await Promise.allSettled(deletePromises);

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      success: true,
      successful,
      failed,
      totalProcessed: publicIds.length
    };
  } catch (error) {
    logger.error('Batch delete error:', error);
    throw new Error(`Batch deletion failed: ${error.message}`);
  }
};

// Validate file before upload
const validateFile = (file, allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
  }

  // Check file type if specified
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  uploadFile,
  deleteFile,
  getOptimizedImageUrl,
  getThumbnailUrl,
  uploadMultipleFiles,
  createFolder,
  getFileInfo,
  deleteMultipleFiles,
  validateFile
};