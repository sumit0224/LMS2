const Admin = require("../models/adminSchema");
const User = require("../models/userSchema");
const Teacher = require("../models/teacherSchema");
const Course = require("../models/courseSchema");
const Batch = require("../models/batchSchema");
const Enrollment = require("../models/enrollmentSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    // 🔒 SECURITY: Ignore any role field from request body

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    // 🔒 SECURITY: Allow ONLY ONE admin in the system (unified User model)
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount > 0) {
        res.status(403);
        throw new Error("Admin already exists. Only one admin is allowed.");
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔒 Create admin in User collection with hardcoded role
    const newAdmin = new User({
        name,
        email,
        password: hashedPassword,
        phone: "0000000000",  // Default for admin
        role: "admin"  // Hardcoded, never from req.body
    });

    await newAdmin.save();

    res.status(201).json({
        message: "Admin registered successfully",
        adminId: newAdmin._id
    });
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    // 🔒 Find admin in User collection with role check
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    const token = generateToken(admin._id, admin.role);

    res.status(200).json({
        message: "Login successful",
        token,
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        }
    });
});

const profileAdmin = async (req, res) => {
    try {
        // 🔒 Uses req.user from 'protect' middleware
        const admin = req.user;

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json(admin);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const registerUserbyAdmin = async (req, res) => {
    try {
        const { name, email, phone, password, courseName } = req.body;

        if (!name || !email || !phone || !password) {
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
            phone,
            password: hashedPassword,
            courseName,
            role: "student"  // 🔒 Hardcoded, never from req.body
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully by Admin", user: newUser });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const registerTeacherbyAdmin = async (req, res) => {
    try {
        const { name, email, phone, password, subject, qualification, experience, doj } = req.body;

        if (!name || !email || !phone || !password || !subject || !qualification) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: "Teacher already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newTeacher = new Teacher({
            name,
            email,
            phone,
            password: hashedPassword,
            subject,
            qualification,
            experience,
            doj
        });

        await newTeacher.save();

        res.status(201).json({ message: "Teacher registered successfully by Admin", teacher: newTeacher });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const { title, description, category, price, duration, level, instructor, thumbnail, syllabus, language, prerequisites } = req.body;

        if (!title || !description || !category || !price || !duration || !instructor) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const newCourse = new Course({
            title,
            description,
            category,
            price,
            duration,
            level,
            instructor,
            thumbnail,
            syllabus,
            language,
            prerequisites
        });

        await newCourse.save();

        res.status(201).json({ message: "Course created successfully", course: newCourse });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedCourse = await Course.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course updated successfully", course: updatedCourse });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCourse = await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get dashboard stats (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const Enrollment = require("../models/enrollmentSchema");

        const totalStudents = await User.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        const totalCourses = await Course.countDocuments();
        const activeCourses = await Course.countDocuments({ status: "Active" });

        // Get recent enrollments
        const recentEnrollments = await Enrollment.find()
            .populate("student", "name email")
            .populate("course", "title")
            .sort({ enrolledAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalTeachers,
                totalCourses,
                activeCourses,
                recentEnrollments
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all students (Admin)
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find()
            .select("-password")
            .populate("enrolledCourses", "title")
            .sort({ createdAt: -1 });

        res.status(200).json(students);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all teachers (Admin)
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .select("-password")
            .populate("assignedCourses", "title")
            .sort({ createdAt: -1 });

        res.status(200).json(teachers);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Assign course to teacher (Admin)
const assignCourseToTeacher = async (req, res) => {
    try {
        const { teacherId, courseId } = req.body;

        if (!teacherId || !courseId) {
            return res.status(400).json({ message: "Teacher ID and Course ID are required" });
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Add course to teacher's assigned courses
        await Teacher.findByIdAndUpdate(teacherId, {
            $addToSet: { assignedCourses: courseId }
        });

        // Update course instructor
        await Course.findByIdAndUpdate(courseId, {
            instructor: teacherId
        });

        res.status(200).json({ message: "Course assigned to teacher successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all courses with full details (Admin)
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate("instructor", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(courses);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create a new Batch (Admin)
const createBatch = async (req, res) => {
    try {
        const { title, courseId, limit, startDate, schedule } = req.body;

        if (!title || !courseId) {
            return res.status(400).json({ message: "Title and Course are required" });
        }

        const newBatch = new Batch({
            title,
            course: courseId,
            limit: limit || 10,
            startDate,
            schedule
        });

        await newBatch.save();
        res.status(201).json({ message: "Batch created successfully", batch: newBatch });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all Batches (Admin)
const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate("course", "title")
            .populate("students", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Assign Student to Batch (Admin)
const assignStudentToBatch = async (req, res) => {
    try {
        const { studentId, batchId } = req.body;

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        // Check limit
        if (batch.students.length >= batch.limit) {
            return res.status(400).json({ message: "Batch is full (Max 10 students)" });
        }

        if (batch.students.includes(studentId)) {
            return res.status(400).json({ message: "Student already in this batch" });
        }

        batch.students.push(studentId);
        await batch.save();

        // Update User model
        await User.findByIdAndUpdate(studentId, { batch: batchId });

        res.status(200).json({ message: "Student assigned to batch successfully", batch });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Assign Course to Student (Admin)
const assignCourseToStudent = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        const student = await User.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student || !course) {
            return res.status(404).json({ message: "Student or Course not found" });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: "Student already enrolled in this course" });
        }

        const enrollment = new Enrollment({
            student: studentId,
            course: courseId,
            status: "InProgress",
            progress: 0
        });

        await enrollment.save();

        // Update Student's enrolledCourses
        await User.findByIdAndUpdate(studentId, {
            $addToSet: { enrolledCourses: courseId }
        });

        // Update Course enrollment count
        await Course.findByIdAndUpdate(courseId, {
            $inc: { enrollmentCount: 1 }
        });

        res.status(200).json({ message: "Course assigned to student successfully", enrollment });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    loginAdmin,
    registerAdmin,
    profileAdmin,
    registerUserbyAdmin,
    registerTeacherbyAdmin,
    createCourse,
    updateCourse,
    deleteCourse,
    getDashboardStats,
    getAllStudents,
    getAllTeachers,
    assignCourseToTeacher,
    getAllCourses,
    createBatch,
    getAllBatches,
    assignStudentToBatch,
    assignCourseToStudent
};