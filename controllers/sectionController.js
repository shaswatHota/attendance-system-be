const Section = require('../models/Section');

// @desc    Create a new section
// @route   POST /api/sections

exports.createSection = async (req, res) => {
    const { name, branch, year } = req.body;

    try {
        // The unique index in the model will handle duplicate checks,
        // but a manual check provides a friendlier error message.
        let section = await Section.findOne({ name, branch, year });
        if (section) {
            return res.status(400).json({ msg: 'This section already exists' });
        }
        
        section = new Section({
            name,
            branch,
            year,
            students: [] // Initially empty
        });

        await section.save();
        res.status(201).json({ msg: 'Section created successfully', section });

    } catch (err) {
        // This will catch the duplicate key error from MongoDB if the index is violated
        if (err.code === 11000) {
             return res.status(400).json({ msg: 'This section already exists' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all sections (e.g., to populate a dropdown)
// @route   GET /api/sections
exports.getAllSections = async (req, res) => {
    try {
        const sections = await Section.find().sort({ year: 1, branch: 1, name: 1 });
        res.json(sections);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all students for a specific section
// @route   GET /api/sections/:id/students
exports.getStudentsBySection = async (req, res) => {
    try {
        // using .populate to replace the student IDs with actual student documents
        const section = await Section.findById(req.params.id).populate('students', 'name studentId');
        if (!section) {
            return res.status(404).json({ msg: 'Section not found' });
        }
        res.json(section.students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};