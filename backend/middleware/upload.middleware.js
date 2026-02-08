const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Memory storage for processing files before uploading to cloud
const memoryStorage = multer.memoryStorage();

// Disk storage for temporary files
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed mime types
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    video: ['video/mp4', 'video/webm', 'video/ogg']
  };

  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    audio: 25 * 1024 * 1024, // 25MB
    document: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024 // 100MB
  };

  // Determine file category
  let category = 'document'; // default
  for (const [cat, types] of Object.entries(allowedTypes)) {
    if (types.includes(file.mimetype)) {
      category = cat;
      break;
    }
  }

  // Check if file type is allowed
  const allAllowedTypes = Object.values(allowedTypes).flat();
  if (!allAllowedTypes.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allAllowedTypes.join(', ')}`), false);
  }

  // Check file size
  if (file.size > maxSizes[category]) {
    return cb(new Error(`File size exceeds ${maxSizes[category] / (1024 * 1024)}MB limit for ${category} files`), false);
  }

  // Add category to file object for later use
  file.category = category;
  cb(null, true);
};

// Upload configurations
const uploadConfigs = {
  // Single file uploads
  single: (fieldName) => multer({
    storage: memoryStorage,
    fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB
    }
  }).single(fieldName),

  // Multiple files upload
  array: (fieldName, maxCount = 10) => multer({
    storage: memoryStorage,
    fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB per file
      files: maxCount
    }
  }).array(fieldName, maxCount),

  // Mixed file upload (different fields)
  fields: (fields) => multer({
    storage: memoryStorage,
    fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB
    }
  }).fields(fields)
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
      error: error.code
    });
  }

  if (error.message.includes('not allowed') || error.message.includes('exceeds')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Validation middleware for uploaded files
const validateUploads = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files || (req.file ? [req.file] : []);

  // Add metadata to each file
  files.forEach(file => {
    file.id = uuidv4();
    file.uploadedAt = new Date();
    file.sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  });

  next();
};

module.exports = {
  uploadConfigs,
  handleMulterError,
  validateUploads
};