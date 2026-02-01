const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    // 🔒 Only allow student login through this endpoint
    const user = await User.findOne({ email, role: "student" });
    if (!user) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            courseName: user.courseName,
            role: user.role
        }
    });
});

const profileUser = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json(user);
});

const registerUser = async (req, res) => {
    try {
        const { name, email, password, courseName } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            courseName
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get student's enrolled courses with progress
const getEnrolledCourses = async (req, res) => {
    try {
        const studentId = req.user._id;
        const Enrollment = require("../models/enrollmentSchema");

        const enrollments = await Enrollment.find({ student: studentId, status: { $ne: "Cancelled" } })
            .populate({
                path: "course",
                select: "title description thumbnail level duration instructor",
                populate: { path: "instructor", select: "name" }
            })
            .sort({ enrolledAt: -1 });

        res.status(200).json(enrollments);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get syllabus for enrolled course
const getCourseSyllabus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user._id;

        const Enrollment = require("../models/enrollmentSchema");
        const Syllabus = require("../models/syllabusSchema");

        // Verify student is enrolled in this course
        const enrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId,
            status: { $ne: "Cancelled" }
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        const syllabus = await Syllabus.findOne({ course: courseId });

        if (!syllabus) {
            return res.status(404).json({ message: "Syllabus not found for this course" });
        }

        res.status(200).json({ syllabus, enrollment });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update lesson progress
const updateLessonProgress = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { lectureId, isCompleted } = req.body;
        const studentId = req.user._id;

        const Enrollment = require("../models/enrollmentSchema");
        const Syllabus = require("../models/syllabusSchema");

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        if (enrollment.student.toString() !== studentId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (isCompleted && !enrollment.completedLectures.includes(lectureId)) {
            enrollment.completedLectures.push(lectureId);
        } else if (!isCompleted) {
            enrollment.completedLectures = enrollment.completedLectures.filter(id => id !== lectureId);
        }

        // Calculate progress based on completed lectures
        const syllabus = await Syllabus.findOne({ course: enrollment.course });
        if (syllabus) {
            let totalLectures = 0;
            syllabus.modules.forEach(module => {
                totalLectures += module.lectures.length;
            });

            if (totalLectures > 0) {
                enrollment.progress = Math.round((enrollment.completedLectures.length / totalLectures) * 100);
            }
        }

        enrollment.lastAccessedAt = Date.now();

        if (enrollment.progress >= 100) {
            enrollment.status = "Completed";
        }

        await enrollment.save();

        res.status(200).json({ message: "Progress updated", enrollment });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get student's course details with syllabus
const getStudentCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user._id;

        const Enrollment = require("../models/enrollmentSchema");
        const Syllabus = require("../models/syllabusSchema");
        const Course = require("../models/courseSchema");

        const enrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId,
            status: { $ne: "Cancelled" }
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        const course = await Course.findById(courseId)
            .populate("instructor", "name email");

        const syllabus = await Syllabus.findOne({ course: courseId });

        res.status(200).json({ course, syllabus, enrollment });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    loginUser,
    profileUser,
    registerUser,
    getEnrolledCourses,
    getCourseSyllabus,
    updateLessonProgress,
    getStudentCourseDetails
};
