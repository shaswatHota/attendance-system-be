const Student = require('../models/Student');
const Section = require('../models/Section');

// @desc    Create a new student and add them to a section
// @route   POST /api/students
// @access  Private (assuming only admins/staff can add students)
exports.createStudent = async (req, res) => {
  const { studentId, name, year, branch, sectionId } = req.body;

  try {
    // 1. Check if student already exists
    let student = await Student.findOne({ studentId });
    if (student) {
      return res.status(400).json({ msg: 'Student with this ID already exists' });
    }

    // 2. Find the section to add the student to
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ msg: 'Section not found' });
    }
    
    // Optional: Validate if the section's year/branch match the student's
    if (section.year !== year || section.branch !== branch) {
        return res.status(400).json({ msg: 'Student year/branch does not match the selected section' });
    }

    // 3. Create and save the new student
    student = new Student({
      studentId,
      name,
      year,
      branch,
      section: sectionId,
    });
    await student.save();

    // 4. Add the new student's ID to the section's student list
    section.students.push(student._id);
    await section.save();

    res.status(201).json({ msg: 'Student created successfully', student });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};