const mongoose = require('mongoose');
const { Schema } = mongoose;

const StaffSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true, trim: true, unique: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', StaffSchema);