const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  markedBy: { 
    type: String,
    required: true,
  },
  records: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
      },
      status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true,
      },
    },
  ],
  isSubmitted: {
    type: Boolean,
    default: false, 
  },
});


AttendanceSchema.index({ section: 1, date: 1 }, { unique: true });


module.exports = mongoose.model('Attendance', AttendanceSchema);