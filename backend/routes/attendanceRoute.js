const express = require("express");
const router = express.Router();
const { protect, isTeacher, isUser } = require("../middlewares/authMiddleware");
const {
    markAttendance,
    updateAttendance,
    getAttendanceByCourse,
    getStudentAttendance,
    getAttendance,
    checkAttendance
} = require("../controller/attendanceController");

// Teacher routes
router.post("/", protect, isTeacher, markAttendance);
router.put("/:id", protect, isTeacher, updateAttendance);
router.get("/course/:courseId", protect, isTeacher, getAttendanceByCourse);
router.get("/check", protect, isTeacher, checkAttendance);

// Student routes
router.get("/my-attendance", protect, isUser, getStudentAttendance);
router.get("/student/:studentId", protect, getStudentAttendance);

// Shared
router.get("/:id", protect, getAttendance);

module.exports = router;
