const express = require("express");
const router = express.Router();
const { protect, isTeacher, isUser } = require("../middlewares/authMiddleware");
const {
    submitAssignment,
    getSubmissionsByAssignment,
    reviewSubmission,
    getStudentSubmissions,
    getSubmission
} = require("../controller/submissionController");

// Student routes
router.post("/", protect, isUser, submitAssignment);
router.get("/my-submissions", protect, isUser, getStudentSubmissions);
router.get("/student/:studentId", protect, getStudentSubmissions);

// Teacher routes
router.get("/assignment/:assignmentId", protect, isTeacher, getSubmissionsByAssignment);
router.put("/:id/review", protect, isTeacher, reviewSubmission);

// Shared
router.get("/:id", protect, getSubmission);

module.exports = router;
