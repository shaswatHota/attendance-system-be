const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  name: { 
    type: String,
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
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
});

SectionSchema.index({ name: 1, branch: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Section', SectionSchema);