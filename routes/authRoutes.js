const express = require('express');
const { signUp, signIn, verifyFaculty } = require('../controllers/authController');

const router = express.Router();
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/verify-faculty', verifyFaculty);

module.exports = router;