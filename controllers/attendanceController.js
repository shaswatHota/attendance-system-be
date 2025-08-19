const Attendance = require('../models/Attendance');
const Section = require('../models/Section');

// @desc    Mark initial attendance (swipe right/left)
// @route   POST /api/attendance/mark
exports.markAttendance = async (req, res) => {
    const { sectionId, date, records, markedBy } = req.body;

    try {
        // Check if attendance for this section and date already exists
        let attendance = await Attendance.findOne({ section: sectionId, date: new Date(date).setHours(0,0,0,0) });

        if (attendance) {
            return res.status(400).json({ msg: 'Attendance already marked for this section on this date' });
        }
        
        attendance = new Attendance({
            section: sectionId,
            date: new Date(date), //.setHours(0,0,0,0),
            records,
            markedBy,
            isSubmitted: false // Initially not submitted
        });

        await attendance.save();

        res.status(201).json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get attendance data for review
// @route   GET /api/attendance/review/:sectionId/:date
exports.getAttendanceForReview = async (req, res) => {
    try {
        const { sectionId, date } = req.params;
        const attendance = await Attendance.findOne({
            section: sectionId,
            date: new Date(date).setHours(0,0,0,0)
        }).populate('records.student', 'name studentId'); // Populate student details

        if (!attendance) {
            return res.status(404).json({ msg: 'Attendance record not found for review' });
        }

        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Update/Correct attendance (only Absent -> Present)
// @route   PUT /api/attendance/correct/:recordId
exports.correctAttendance = async (req, res) => {
    const { studentId, newStatus } = req.body;

    // Rule: Only allow changing from 'Absent' to 'Present'.
    if (newStatus !== 'Present') {
        return res.status(400).json({ msg: 'Correction invalid: can only change status to "Present"' });
    }

    try {
        const attendanceRecord = await Attendance.findById(req.params.recordId);

        if (!attendanceRecord) {
            return res.status(404).json({ msg: 'Attendance record not found' });
        }

        // Rule: Cannot edit a submitted record
        if (attendanceRecord.isSubmitted) {
            return res.status(400).json({ msg: 'Cannot correct attendance after it has been submitted' });
        }

        const studentToUpdate = attendanceRecord.records.find(
            (rec) => rec.student.toString() === studentId
        );

        if (!studentToUpdate) {
            return res.status(404).json({ msg: 'Student not found in this attendance record' });
        }

        // Rule: Only Absent -> Present is allowed.
        if (studentToUpdate.status !== 'Absent') {
            return res.status(400).json({ msg: 'Correction invalid: can only change "Absent" students to "Present"' });
        }
        
        studentToUpdate.status = 'Present';
        await attendanceRecord.save();

        res.json(attendanceRecord);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Submit final attendance (locks the record)
// @route   POST /api/attendance/submit/:recordId
exports.submitAttendance = async (req, res) => {
    try {
        const attendanceRecord = await Attendance.findById(req.params.recordId);

        if (!attendanceRecord) {
            return res.status(404).json({ msg: 'Attendance record not found' });
        }

        if (attendanceRecord.isSubmitted) {
            return res.status(400).json({ msg: 'This attendance has already been submitted' });
        }

        attendanceRecord.isSubmitted = true;
        await attendanceRecord.save();

        res.json({ msg: 'Attendance submitted successfully', attendance: attendanceRecord });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};