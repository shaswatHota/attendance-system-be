const express = require('express');
const router = express.Router();
const { createStudent } = require('../controllers/studentController');
const authenticateJwt = require('../middleware/auth');

// @route   POST api/students
// @desc    Create a new student

router.post('/', authenticateJwt, createStudent);


module.exports = router;