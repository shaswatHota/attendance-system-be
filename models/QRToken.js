const mongoose = require('mongoose');

const QRTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 32, // 32 seconds TTL (31s validity + 1s buffer)
  },
  isValid: {
    type: Boolean,
    default: true,
  },
});

QRTokenSchema.index({ token: 1 }, { unique: true });
QRTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 32 });

module.exports = mongoose.model('QRToken', QRTokenSchema);

