const QRToken = require('../models/QRToken');
const Subject = require('../models/Subject');

// Generate a random token in format: XXX-XXX-XXX
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [];
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 3; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
}

// @desc    Generate QR token for subject
// @route   POST /api/qr/generate
exports.generateQRToken = async (req, res) => {
  try {
    const { subjectCode, facultyId } = req.body;

    if (!subjectCode || !facultyId) {
      return res.status(400).json({ msg: 'Subject code and faculty ID are required' });
    }

    // Verify subject exists and faculty is authorized
    const subject = await Subject.findOne({ subjectCode, faculty: facultyId }).populate('section');
    
    if (!subject) {
      return res.status(404).json({ msg: 'Subject not found or faculty not authorized' });
    }

    // Invalidate any existing active tokens for this subject
    await QRToken.updateMany(
      { subjectCode, isValid: true },
      { isValid: false }
    );

    // Generate new token
    let token;
    let isUnique = false;
    while (!isUnique) {
      token = generateToken();
      const exists = await QRToken.findOne({ token, isValid: true });
      if (!exists) {
        isUnique = true;
      }
    }

    const qrToken = new QRToken({
      token,
      subjectCode,
      facultyId,
      sectionId: subject.section._id,
      createdAt: new Date(),
      isValid: true,
    });

    await qrToken.save();

    res.json({
      token,
      expiresIn: 31, // seconds
      sectionId: subject.section._id,
      sectionName: subject.section.name,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Validate QR token (for student scanning)
// @route   POST /api/qr/validate
exports.validateQRToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ msg: 'Token is required' });
    }

    const qrToken = await QRToken.findOne({ token, isValid: true })
      .populate('sectionId', 'name branch year')
      .populate('facultyId', 'username');

    if (!qrToken) {
      return res.status(404).json({ msg: 'Invalid or expired token' });
    }

    // Check if token is still valid (within 31 seconds of creation)
    const now = new Date();
    const tokenAge = (now - qrToken.createdAt) / 1000; // in seconds

    if (tokenAge > 31) {
      // Mark as invalid
      qrToken.isValid = false;
      await qrToken.save();
      return res.status(400).json({ msg: 'Token has expired' });
    }

    res.json({
      valid: true,
      subjectCode: qrToken.subjectCode,
      sectionId: qrToken.sectionId._id,
      sectionName: qrToken.sectionId.name,
      facultyName: qrToken.facultyId.username,
      timeRemaining: Math.max(0, 31 - Math.floor(tokenAge)),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Mark attendance via QR token
// @route   POST /api/qr/mark-attendance
exports.markAttendanceViaQR = async (req, res) => {
  try {
    const { token, studentId } = req.body;

    if (!token || !studentId) {
      return res.status(400).json({ msg: 'Token and student ID are required' });
    }

    const qrToken = await QRToken.findOne({ token, isValid: true })
      .populate('sectionId');

    if (!qrToken) {
      return res.status(404).json({ msg: 'Invalid or expired token' });
    }

    // Check if token is still valid
    const now = new Date();
    const tokenAge = (now - qrToken.createdAt) / 1000;

    if (tokenAge > 31) {
      qrToken.isValid = false;
      await qrToken.save();
      return res.status(400).json({ msg: 'Token has expired' });
    }

    // Mark student as present (attendance will be created/updated in attendanceController)
    // This endpoint just validates and returns the section info
    res.json({
      success: true,
      sectionId: qrToken.sectionId._id,
      subjectCode: qrToken.subjectCode,
      timeRemaining: Math.max(0, 31 - Math.floor(tokenAge)),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

