const express = require('express');
const { getWeather } = require('../controllers/weather.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protected route — user must be logged in
router.use(protect);

// GET /api/weather?location=Accra&days=5
router.get('/', getWeather);

module.exports = router;
