const express = require('express');
const router = express.Router();
const { getAllSections, getStudentsBySection, createSection } = require('../controllers/sectionController');
const auth = require('../middleware/auth');

// @route   POST api/sections
// @desc    Create a new section

router.post('/', auth, createSection);

// @route   GET api/sections
// @desc    Get all available sections

router.get('/', auth, getAllSections);

// @route   GET api/sections/:id/students
// @desc    Get all students for a selected section

router.get('/:id/students', auth, getStudentsBySection);


module.exports = router;