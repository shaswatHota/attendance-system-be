const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Connect to Database
connectDB();

// --- Express App Initialization ---
const app = express();

// --- Middlewares ---
app.use(cors()); 
app.use(express.json({ extended: false }));

app.use('/api/auth', require('./routes/authRoutes'));

app.get('/', (req, res) => res.send('Attendance API Running'));

// --- Define API Routes ---
app.use('/api/sections', require('./routes/sectionRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
// Add the new student routes
app.use('/api/students', require('./routes/studentRoutes'));


// --- Server Listener ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));