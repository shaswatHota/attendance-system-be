const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Staff = require('../models/staff');

const JWT_SECRET = process.env.JWT_SECRET;

exports.signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }
    const existing = await Staff.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email is already in use' });

    const hashed = await bcryptjs.hash(password, 10);
    const user = await Staff.create({ username, email, password: hashed });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Signed up', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

    const user = await Staff.findOne({ email });
    if (!user) return res.status(403).json({ message: 'Invalid credentials' });

    const ok = await bcryptjs.compare(password, user.password);
    if (!ok) return res.status(403).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify faculty by name and phone number
// @route   POST /api/auth/verify-faculty
exports.verifyFaculty = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }

    // Find faculty by name and phone number
    const faculty = await Staff.findOne({
      username: { $regex: new RegExp(name, 'i') }, // Case-insensitive search
      mobileNumber: phoneNumber,
    }).select('username mobileNumber email _id');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found. Please check your name and phone number.' });
    }

    res.json({
      message: 'Faculty verified successfully',
      faculty: {
        id: faculty._id,
        name: faculty.username,
        email: faculty.email,
        mobileNumber: faculty.mobileNumber,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
