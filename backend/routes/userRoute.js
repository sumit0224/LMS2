const express = require("express");
const router = express.Router();
const {
    loginUser,
    profileUser,
    getEnrolledCourses,
    getCourseSyllabus,
    updateLessonProgress,
    getStudentCourseDetails
} = require("../controller/userController");
const { protect, isUser } = require("../middlewares/authMiddleware");

router.get("/", (req, res) => {
    res.send("user api");
});

// Auth routes
router.post("/login", loginUser);
// 🔒 SECURITY: Public registration removed - students created by admin only
router.get("/profile", protect, isUser, profileUser);

// Course & progress routes
router.get("/courses", protect, isUser, getEnrolledCourses);
router.get("/courses/:courseId", protect, isUser, getStudentCourseDetails);
router.get("/courses/:courseId/syllabus", protect, isUser, getCourseSyllabus);
router.put("/progress/:enrollmentId", protect, isUser, updateLessonProgress);

module.exports = router;