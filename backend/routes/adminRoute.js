const express = require("express");
const router = express.Router();
const {
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
} = require("../controller/adminController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

// Auth routes
router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.get("/profile", protect, profileAdmin);

// Dashboard
router.get("/dashboard", protect, isAdmin, getDashboardStats);

// User/Teacher registration
router.post("/register/user", protect, isAdmin, registerUserbyAdmin);
router.post("/register/teacher", protect, isAdmin, registerTeacherbyAdmin);

// User/Teacher lists
router.get("/students", protect, isAdmin, getAllStudents);
router.get("/teachers", protect, isAdmin, getAllTeachers);

// Course management
router.get("/courses", protect, isAdmin, getAllCourses);
router.post("/course", protect, isAdmin, createCourse);
router.put("/course/:id", protect, isAdmin, updateCourse);
router.delete("/course/:id", protect, isAdmin, deleteCourse);

// Course assignment
// Course assignment
router.put("/assign-course", protect, isAdmin, assignCourseToTeacher);
router.put("/assign-course-student", protect, isAdmin, assignCourseToStudent);

// Batch Management
router.post("/batch", protect, isAdmin, createBatch);
router.get("/batches", protect, isAdmin, getAllBatches);
router.put("/assign-batch", protect, isAdmin, assignStudentToBatch);

module.exports = router;