const { uploadFile, deleteFile, getOptimizedImageUrl, validateFile } = require('../services/cloud.service');
const logger = require('../utils/logger');

// @desc    Upload image
// @route   POST /api/upload/images
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const file = req.file;

    // Validate file
    const validation = validateFile(file, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'], 10 * 1024 * 1024);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(', ')
      });
    }

    // Upload to cloud storage
    const uploadResult = await uploadFile(file.buffer, {
      folder: 'dayla/images',
      public_id: `user_${req.user._id}_${Date.now()}`,
      resource_type: 'image'
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }

    // Generate optimized URLs
    const optimizedUrl = getOptimizedImageUrl(uploadResult.publicId, {
      width: 800,
      height: 600,
      crop: 'fill'
    });

    const thumbnailUrl = getOptimizedImageUrl(uploadResult.publicId, {
      width: 300,
      height: 300,
      crop: 'thumb'
    });

    const uploadData = {
      id: uploadResult.publicId,
      userId: req.user._id,
      filename: file.originalname,
      type: 'image',
      url: uploadResult.url,
      optimizedUrl,
      thumbnailUrl,
      size: uploadResult.size,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      uploadedAt: new Date(),
      metadata: req.body
    };

    logger.info(`Image uploaded by ${req.user.email}: ${uploadResult.publicId}`);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: uploadData
    });
  } catch (error) {
    logger.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// @desc    Upload document
// @route   POST /api/upload/documents
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
      });
    }

    const file = req.file;

    // Validate file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    const validation = validateFile(file, allowedTypes, 10 * 1024 * 1024);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(', ')
      });
    }

    // Upload to cloud storage
    const uploadResult = await uploadFile(file.buffer, {
      folder: 'dayla/documents',
      public_id: `user_${req.user._id}_${Date.now()}`,
      resource_type: 'raw'
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload document'
      });
    }

    const uploadData = {
      id: uploadResult.publicId,
      userId: req.user._id,
      filename: file.originalname,
      type: 'document',
      url: uploadResult.url,
      size: uploadResult.size,
      format: uploadResult.format,
      uploadedAt: new Date(),
      metadata: req.body
    };

    logger.info(`Document uploaded by ${req.user.email}: ${uploadResult.publicId}`);

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: uploadData
    });
  } catch (error) {
    logger.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// @desc    Upload audio
// @route   POST /api/upload/audio
// @access  Private
const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const file = req.file;

    // Validate file
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg'
    ];

    const validation = validateFile(file, allowedTypes, 25 * 1024 * 1024);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(', ')
      });
    }

    // Upload to cloud storage
    const uploadResult = await uploadFile(file.buffer, {
      folder: 'dayla/audio',
      public_id: `user_${req.user._id}_${Date.now()}`,
      resource_type: 'video' // Cloudinary treats audio as video
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload audio'
      });
    }

    const uploadData = {
      id: uploadResult.publicId,
      userId: req.user._id,
      filename: file.originalname,
      type: 'audio',
      url: uploadResult.url,
      size: uploadResult.size,
      format: uploadResult.format,
      duration: uploadResult.duration,
      uploadedAt: new Date(),
      metadata: req.body
    };

    logger.info(`Audio uploaded by ${req.user.email}: ${uploadResult.publicId}`);

    res.status(200).json({
      success: true,
      message: 'Audio uploaded successfully',
      data: uploadData
    });
  } catch (error) {
    logger.error('Audio upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload audio',
      error: error.message
    });
  }
};

// @desc    Upload video
// @route   POST /api/upload/videos
// @access  Private
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const file = req.file;

    // Validate file
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    const validation = validateFile(file, allowedTypes, 100 * 1024 * 1024);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(', ')
      });
    }

    // Upload to cloud storage
    const uploadResult = await uploadFile(file.buffer, {
      folder: 'dayla/videos',
      public_id: `user_${req.user._id}_${Date.now()}`,
      resource_type: 'video'
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload video'
      });
    }

    const uploadData = {
      id: uploadResult.publicId,
      userId: req.user._id,
      filename: file.originalname,
      type: 'video',
      url: uploadResult.url,
      size: uploadResult.size,
      format: uploadResult.format,
      duration: uploadResult.duration,
      width: uploadResult.width,
      height: uploadResult.height,
      uploadedAt: new Date(),
      metadata: req.body
    };

    logger.info(`Video uploaded by ${req.user.email}: ${uploadResult.publicId}`);

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: uploadData
    });
  } catch (error) {
    logger.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
};

// @desc    Get upload history
// @route   GET /api/upload/history
// @access  Private
const getUploadHistory = async (req, res) => {
  try {
    // In a real implementation, you'd have an Upload model
    // For now, return a placeholder response
    const uploads = [
      // This would come from database
    ];

    res.status(200).json({
      success: true,
      data: {
        uploads,
        count: uploads.length
      }
    });
  } catch (error) {
    logger.error('Get upload history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload history',
      error: error.message
    });
  }
};

// @desc    Delete upload
// @route   DELETE /api/upload/:uploadId
// @access  Private
const deleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;

    // Delete from cloud storage
    const deleteResult = await deleteFile(uploadId);

    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file from storage'
      });
    }

    // In a real implementation, you'd also remove from database
    // await Upload.findOneAndDelete({ publicId: uploadId, userId: req.user._id });

    logger.info(`Upload deleted by ${req.user.email}: ${uploadId}`);

    res.status(200).json({
      success: true,
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    logger.error('Delete upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete upload',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  uploadDocument,
  uploadAudio,
  uploadVideo,
  getUploadHistory,
  deleteUpload
};