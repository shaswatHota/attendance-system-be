/**
 * Database Seeding Script
 * 
 * Run this script to populate your database with test data:
 * node seed-database.js
 * 
 * Make sure your .env file has MONGO_URI set
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Staff = require('./models/staff');
const Section = require('./models/Section');
const Student = require('./models/Student');
const Subject = require('./models/Subject');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

async function seedDatabase() {
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Staff.deleteMany({});
    // await Section.deleteMany({});
    // await Student.deleteMany({});
    // await Subject.deleteMany({});
    // console.log('Cleared existing data');

    // 1. Create Faculty Member
    console.log('\n1. Creating Faculty Member...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    let faculty = await Staff.findOne({ email: 'john.doe@university.edu' });
    if (!faculty) {
      faculty = await Staff.create({
        username: 'Dr. John Doe',
        email: 'john.doe@university.edu',
        password: hashedPassword,
        mobileNumber: '+1234567890' // Replace with your actual mobile number for testing
      });
      console.log('✓ Faculty created:', faculty.username);
    } else {
      // Update mobile number if not set
      if (!faculty.mobileNumber) {
        faculty.mobileNumber = '+1234567890';
        await faculty.save();
      }
      console.log('✓ Faculty already exists:', faculty.username);
    }

    // 2. Create Section
    console.log('\n2. Creating Section...');
    let section = await Section.findOne({ name: 'A', branch: 'CSE', year: 3 });
    if (!section) {
      section = await Section.create({
        name: 'A',
        branch: 'CSE',
        year: 3,
        students: []
      });
      console.log('✓ Section created:', `${section.name} (${section.branch} ${section.year})`);
    } else {
      console.log('✓ Section already exists:', `${section.name} (${section.branch} ${section.year})`);
    }

    // 3. Create Students
    console.log('\n3. Creating Students...');
    const studentData = [
      { studentId: 'CSE2024001', name: 'Alice Smith', year: 3, branch: 'CSE', section: section._id },
      { studentId: 'CSE2024002', name: 'Bob Johnson', year: 3, branch: 'CSE', section: section._id },
      { studentId: 'CSE2024003', name: 'Charlie Brown', year: 3, branch: 'CSE', section: section._id },
      { studentId: 'CSE2024004', name: 'Diana Prince', year: 3, branch: 'CSE', section: section._id },
      { studentId: 'CSE2024005', name: 'Eve Wilson', year: 3, branch: 'CSE', section: section._id },
    ];

    const createdStudents = [];
    for (const studentInfo of studentData) {
      let student = await Student.findOne({ studentId: studentInfo.studentId });
      if (!student) {
        student = await Student.create(studentInfo);
        createdStudents.push(student);
      } else {
        createdStudents.push(student);
      }
    }

    // Update section with students
    section.students = createdStudents.map(s => s._id);
    await section.save();
    console.log(`✓ ${createdStudents.length} students created/updated`);

    // 4. Create Subject (CRITICAL - This is what you'll use to login!)
    console.log('\n4. Creating Subject...');
    let subject = await Subject.findOne({ subjectCode: 'CS301' });
    if (!subject) {
      subject = await Subject.create({
        subjectCode: 'CS301', // THIS IS YOUR LOGIN CODE
        subjectName: 'Database Management Systems',
        faculty: faculty._id,
        section: section._id,
        branch: 'CSE',
        year: 3
      });
      console.log('✓ Subject created:', subject.subjectCode, '-', subject.subjectName);
    } else {
      console.log('✓ Subject already exists:', subject.subjectCode, '-', subject.subjectName);
    }

    // Update faculty subjects array
    if (!faculty.subjects.includes(subject._id)) {
      faculty.subjects.push(subject._id);
      await faculty.save();
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('DATABASE SEEDING COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📝 Login Credentials:');
    console.log('   Subject Code: CS301');
    console.log('   Email: john.doe@university.edu');
    console.log('   Password: password123');
    console.log('   Mobile: +1234567890');
    console.log('\n📱 To Test:');
    console.log('   1. Open frontend: http://localhost:5173');
    console.log('   2. Enter subject code: CS301');
    console.log('   3. Check backend console for OTP');
    console.log('   4. Enter OTP to login');
    console.log('   5. QR code will be displayed');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();

