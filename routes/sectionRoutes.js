const express = require('express');
const router = express.Router();
const { getAllSections, getStudentsBySection, createSection } = require('../controllers/sectionController');
const authenticateJwt = require('../middleware/auth');


router.use(authenticateJwt);
// @route   POST api/sections
// @desc    Create a new section

router.post('/', createSection);

// @route   GET api/sections
// @desc    Get all available sections

router.get('/', getAllSections);

// @route   GET api/sections/:id/students
// @desc    Get all students for a selected section

router.get('/:id/students', getStudentsBySection);


module.exports = router;