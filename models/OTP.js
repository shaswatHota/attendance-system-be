const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 300, // 5 minutes TTL
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('OTP', OTPSchema);

