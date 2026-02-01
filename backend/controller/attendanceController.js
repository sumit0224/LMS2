const Attendance = require("../models/attendanceSchema");
const Enrollment = require("../models/enrollmentSchema");
const Teacher = require("../models/teacherSchema");
const Course = require("../models/courseSchema");

// Mark attendance (Teacher only)
const markAttendance = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { courseId, date, records, notes } = req.body;

        // Verify teacher is assigned to this course
        const teacher = await Teacher.findById(teacherId);
        if (!teacher || !teacher.assignedCourses.includes(courseId)) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this course"
            });
        }

        // Normalize date to start of day
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Check if attendance already exists for this date
        const existing = await Attendance.findOne({
            course: courseId,
            date: attendanceDate
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Attendance already marked for this date"
            });
        }

        const attendance = new Attendance({
            course: courseId,
            date: attendanceDate,
            records,
            markedBy: teacherId,
            notes
        });

        await attendance.save();

        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Attendance already marked for this date"
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update attendance (Teacher only)
const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;
        const { records, notes } = req.body;

        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" });
        }

        // Verify ownership
        if (attendance.markedBy.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: "You can only update attendance you marked"
            });
        }

        attendance.records = records;
        if (notes !== undefined) attendance.notes = notes;
        await attendance.save();

        res.json({
            success: true,
            message: "Attendance updated successfully",
            attendance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get attendance by course (Teacher)
const getAttendanceByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { startDate, endDate } = req.query;

        let query = { course: courseId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate("records.student", "name email")
            .populate("markedBy", "name")
            .sort({ date: -1 });

        res.json({
            success: true,
            attendance,
            totalDays: attendance.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get student's attendance
const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;

        // If accessing another student's attendance, ensure it's the same user
        if (req.params.studentId && req.params.studentId !== req.user.id && req.user.role === "user") {
            return res.status(403).json({
                success: false,
                message: "You can only view your own attendance"
            });
        }

        // Get all attendance records containing this student
        const attendanceRecords = await Attendance.find({
            "records.student": studentId
        }).populate("course", "title");

        // Calculate attendance per course
        const courseAttendance = {};

        attendanceRecords.forEach(record => {
            const courseId = record.course._id.toString();
            const courseTitle = record.course.title;

            if (!courseAttendance[courseId]) {
                courseAttendance[courseId] = {
                    courseId,
                    courseTitle,
                    totalDays: 0,
                    presentDays: 0,
                    absentDays: 0,
                    percentage: 0
                };
            }

            courseAttendance[courseId].totalDays++;

            const studentRecord = record.records.find(
                r => r.student.toString() === studentId
            );

            if (studentRecord && studentRecord.status === "Present") {
                courseAttendance[courseId].presentDays++;
            } else {
                courseAttendance[courseId].absentDays++;
            }
        });

        // Calculate percentages
        Object.values(courseAttendance).forEach(course => {
            course.percentage = course.totalDays > 0
                ? Math.round((course.presentDays / course.totalDays) * 100)
                : 0;
        });

        res.json({
            success: true,
            attendance: Object.values(courseAttendance),
            overallStats: {
                totalDays: attendanceRecords.length,
                presentDays: Object.values(courseAttendance).reduce((sum, c) => sum + c.presentDays, 0),
                overallPercentage: attendanceRecords.length > 0
                    ? Math.round((Object.values(courseAttendance).reduce((sum, c) => sum + c.presentDays, 0) / attendanceRecords.length) * 100)
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single attendance record
const getAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await Attendance.findById(id)
            .populate("records.student", "name email")
            .populate("course", "title")
            .populate("markedBy", "name");

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" });
        }

        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check if attendance exists for a date
const checkAttendance = async (req, res) => {
    try {
        const { courseId, date } = req.query;

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({
            course: courseId,
            date: attendanceDate
        });

        res.json({
            success: true,
            exists: !!existing,
            attendance: existing
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    markAttendance,
    updateAttendance,
    getAttendanceByCourse,
    getStudentAttendance,
    getAttendance,
    checkAttendance
};
