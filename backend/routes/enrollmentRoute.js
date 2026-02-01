const express = require("express");
const router = express.Router();
const {
    enrollStudent,
    getStudentEnrollments,
    getMyEnrollments,
    updateProgress,
    getEnrollmentsByCourse,
    cancelEnrollment,
    getAllEnrollments
} = require("../controller/enrollmentController");
const { protect, isAdmin, isUser, isTeacher } = require("../middlewares/authMiddleware");

// Enroll student (Admin only)
router.post("/", protect, isAdmin, enrollStudent);

// Get all enrollments (Admin only)
router.get("/", protect, isAdmin, getAllEnrollments);

// Get current user's enrollments (Student)
router.get("/my", protect, isUser, getMyEnrollments);

// Get student's enrollments by ID (Admin)
router.get("/student/:studentId", protect, isAdmin, getStudentEnrollments);

// Get enrollments by course (Teacher/Admin)
router.get("/course/:courseId", protect, getEnrollmentsByCourse);

// Update progress (Student)
router.put("/:enrollmentId/progress", protect, isUser, updateProgress);

// Cancel enrollment (Admin only)
router.put("/:id/cancel", protect, isAdmin, cancelEnrollment);

module.exports = router;
