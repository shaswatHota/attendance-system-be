const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

SubjectSchema.index({ subjectCode: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);

