const express = require('express');
const router = express.Router();
const {
    requestOTP,
    verifyOTP,
} = require('../controllers/otpController');

// Request OTP (public)
router.post('/request', requestOTP);

// Verify OTP (public)
router.post('/verify', verifyOTP);

module.exports = router;

