const express = require('express');
const {
  uploadImage,
  uploadDocument,
  uploadAudio,
  uploadVideo,
  getUploadHistory,
  deleteUpload
} = require('../controllers/storage.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadConfigs, handleMulterError, validateUploads } = require('../middleware/upload.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Image upload
router.post('/images',
  uploadConfigs.single('image'),
  handleMulterError,
  validateUploads,
  uploadImage
);

// Multiple images upload
router.post('/images/bulk',
  uploadConfigs.array('images', 10),
  handleMulterError,
  validateUploads,
  uploadImage
);

// Document upload
router.post('/documents',
  uploadConfigs.single('document'),
  handleMulterError,
  validateUploads,
  uploadDocument
);

// Audio upload
router.post('/audio',
  uploadConfigs.single('audio'),
  handleMulterError,
  validateUploads,
  uploadAudio
);

// Video upload
router.post('/videos',
  uploadConfigs.single('video'),
  handleMulterError,
  validateUploads,
  uploadVideo
);

// Mixed file upload
router.post('/mixed',
  uploadConfigs.fields([
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 3 },
    { name: 'audio', maxCount: 2 }
  ]),
  handleMulterError,
  validateUploads,
  async (req, res) => {
    // Handle mixed uploads - this would be implemented in the controller
    res.status(200).json({
      success: true,
      message: 'Mixed upload completed',
      data: {
        uploaded: req.files
      }
    });
  }
);

// Get upload history
router.get('/history', getUploadHistory);

// Delete upload
router.delete('/:uploadId', deleteUpload);

module.exports = router;