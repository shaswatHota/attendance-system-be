const OTP = require('../models/OTP');
const Subject = require('../models/Subject');
const Staff = require('../models/staff');

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// @desc    Request OTP for faculty login
// @route   POST /api/otp/request
exports.requestOTP = async (req, res) => {
  try {
    const { subjectCode } = req.body;

    if (!subjectCode) {
      return res.status(400).json({ msg: 'Subject code is required' });
    }

    // Find subject and get faculty details
    const subject = await Subject.findOne({ subjectCode }).populate('faculty');

    if (!subject) {
      return res.status(404).json({ msg: 'Subject not found' });
    }

    if (!subject.faculty.mobileNumber) {
      return res.status(400).json({ msg: 'Faculty mobile number not registered' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Invalidate previous OTPs for this mobile number and subject
    await OTP.updateMany(
      { mobileNumber: subject.faculty.mobileNumber, subjectCode, isUsed: false },
      { isUsed: true }
    );

    // Create new OTP record
    const otpRecord = new OTP({
      mobileNumber: subject.faculty.mobileNumber,
      otp,
      subjectCode,
      createdAt: new Date(),
      isUsed: false,
    });

    await otpRecord.save();

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, return OTP in response (REMOVE IN PRODUCTION - use SMS service)
    console.log(`OTP for ${subject.faculty.mobileNumber}: ${otp}`);
    
    // In production, send SMS here
    // await sendSMS(subject.faculty.mobileNumber, `Your OTP for ${subjectCode} is ${otp}`);

    res.json({
      msg: 'OTP sent successfully',
      mobileNumber: subject.faculty.mobileNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$2'), // Masked
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Verify OTP and generate JWT token
// @route   POST /api/otp/verify
exports.verifyOTP = async (req, res) => {
  try {
    const { subjectCode, otp } = req.body;

    if (!subjectCode || !otp) {
      return res.status(400).json({ msg: 'Subject code and OTP are required' });
    }

    // Find subject and get faculty
    const subject = await Subject.findOne({ subjectCode }).populate('faculty');

    if (!subject) {
      return res.status(404).json({ msg: 'Subject not found' });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      mobileNumber: subject.faculty.mobileNumber,
      subjectCode,
      otp,
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // Check if OTP is expired (5 minutes)
    const now = new Date();
    const otpAge = (now - otpRecord.createdAt) / 1000 / 60; // in minutes

    if (otpAge > 5) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;
    
    const token = jwt.sign(
      { 
        id: subject.faculty._id, 
        email: subject.faculty.email,
        subjectCode: subjectCode,
        sectionId: subject.section.toString(),
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token valid for 1 hour
    );

    res.json({
      msg: 'OTP verified successfully',
      token,
      faculty: {
        id: subject.faculty._id,
        name: subject.faculty.username,
        email: subject.faculty.email,
      },
      subject: {
        code: subject.subjectCode,
        name: subject.subjectName,
        sectionId: subject.section.toString(),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

