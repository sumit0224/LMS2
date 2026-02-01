const Teacher = require("../models/teacherSchema");
const Attendance = require("../models/attendanceSchema");
const User = require("../models/userSchema"); // User model required for population if needed
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(teacher._id, teacher.role);

        res.status(200).json({
            message: "Login successful",
            token,
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                phone: teacher.phone,
                subject: teacher.subject,
                role: teacher.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const profileTeacher = async (req, res) => {
    try {
        const teacher = req.user;

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json(teacher);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get teacher's assigned courses
const getAssignedCourses = async (req, res) => {
    try {
        const teacherId = req.user._id;

        const Teacher = require("../models/teacherSchema");
        const teacher = await Teacher.findById(teacherId)
            .populate({
                path: "assignedCourses",
                select: "title description status enrollmentCount duration level thumbnail"
            });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json(teacher.assignedCourses || []);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get enrollments for a specific course (read-only for teacher)
const getCourseEnrollments = async (req, res) => {
    try {
        const { courseId } = req.params;
        const teacherId = req.user._id;

        const Course = require("../models/courseSchema");
        const Enrollment = require("../models/enrollmentSchema");

        // Verify teacher is assigned to this course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "Not authorized to view this course's enrollments" });
        }

        const enrollments = await Enrollment.find({ course: courseId })
            .populate("student", "name email phone")
            .sort({ enrolledAt: -1 });

        res.status(200).json(enrollments);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update course syllabus (Teacher)
const updateCourseSyllabus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const teacherId = req.user._id;
        const updates = req.body;

        const Course = require("../models/courseSchema");
        const Syllabus = require("../models/syllabusSchema");

        // Verify teacher is assigned to this course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "Not authorized to update this course's syllabus" });
        }

        const syllabus = await Syllabus.findOneAndUpdate(
            { course: courseId },
            updates,
            { new: true }
        );

        if (!syllabus) {
            return res.status(404).json({ message: "Syllabus not found for this course" });
        }

        res.status(200).json({ message: "Syllabus updated successfully", syllabus });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get teacher's course details including syllabus
const getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const teacherId = req.user._id;

        const Course = require("../models/courseSchema");
        const Syllabus = require("../models/syllabusSchema");

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "Not authorized to view this course" });
        }

        const syllabus = await Syllabus.findOne({ course: courseId });

        res.status(200).json({ course, syllabus });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get students for attendance (filtered by course and optional batch)
const getStudentsForAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { batchId } = req.query;

        const Enrollment = require("../models/enrollmentSchema");
        const Batch = require("../models/batchSchema");

        let query = { course: courseId };

        // Find enrollments for this course
        let enrollments = await Enrollment.find(query).populate("student", "name email batch");

        // Filter by batch if provided
        if (batchId) {
            enrollments = enrollments.filter(e => e.student.batch?.toString() === batchId);
        }

        // Extract students
        const students = enrollments.map(e => e.student);

        res.status(200).json(students);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark Attendance
const markAttendance = async (req, res) => {
    try {
        const { courseId, date, records, batchId, notes } = req.body;
        const teacherId = req.user._id;

        if (!courseId || !date || !records) {
            return res.status(400).json({ message: "Course, Date, and Records are required" });
        }

        // Check if attendance already exists for this course/date/batch combination
        // Note: The schema has a unique index on course+date.
        // We might need to handle updates if it already exists.

        const existingAttendance = await Attendance.findOne({ course: courseId, date: new Date(date) });

        if (existingAttendance) {
            // Update existing
            existingAttendance.records = records;
            existingAttendance.notes = notes;
            if (batchId) existingAttendance.batch = batchId;
            await existingAttendance.save();
            return res.status(200).json({ message: "Attendance updated", attendance: existingAttendance });
        }

        const newAttendance = new Attendance({
            course: courseId,
            date,
            records,
            batch: batchId || null,
            markedBy: teacherId,
            notes
        });

        await newAttendance.save();
        res.status(201).json({ message: "Attendance marked successfully", attendance: newAttendance });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    loginTeacher,
    profileTeacher,
    getAssignedCourses,
    getCourseEnrollments,
    updateCourseSyllabus,
    getCourseDetails,
    getStudentsForAttendance,
    markAttendance
};
