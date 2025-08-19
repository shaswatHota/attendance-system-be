const express = require('express');
const router = express.Router();
const { createStudent } = require('../controllers/studentController');
const auth = require('../middleware/auth');

// @route   POST api/students
// @desc    Create a new student

router.post('/', auth, createStudent);


module.exports = router;