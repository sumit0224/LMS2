const express = require("express");
const router = express.Router();
const {
    loginTeacher,
    profileTeacher,
    getAssignedCourses,
    getCourseEnrollments,
    updateCourseSyllabus,
    getCourseDetails,
    getStudentsForAttendance,
    markAttendance
} = require("../controller/teacherController");
const { protect, isTeacher } = require("../middlewares/authMiddleware");

// Auth routes
router.post("/login", loginTeacher);
router.get("/profile", protect, isTeacher, profileTeacher);

// Course management
router.get("/courses", protect, isTeacher, getAssignedCourses);
router.get("/courses/:courseId", protect, isTeacher, getCourseDetails);
router.get("/courses/:courseId/enrollments", protect, isTeacher, getCourseEnrollments);
router.put("/courses/:courseId/syllabus", protect, isTeacher, updateCourseSyllabus);

// Attendance
router.get("/courses/:courseId/attendance-students", protect, isTeacher, getStudentsForAttendance);
router.post("/attendance", protect, isTeacher, markAttendance);

module.exports = router;
