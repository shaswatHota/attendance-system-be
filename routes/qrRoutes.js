const express = require('express');
const router = express.Router();
const {
    generateQRToken,
    validateQRToken,
    markAttendanceViaQR,
} = require('../controllers/qrController');
const authenticateJwt = require('../middleware/auth');

// Generate QR token (protected - faculty only)
router.post('/generate', authenticateJwt, generateQRToken);

// Validate QR token (public - for student app)
router.post('/validate', validateQRToken);

// Mark attendance via QR (public - for student app)
router.post('/mark-attendance', markAttendanceViaQR);

module.exports = router;

