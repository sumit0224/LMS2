const express = require("express");
const router = express.Router();
const { protect, isTeacher, isAdmin, isUser } = require("../middlewares/authMiddleware");
const {
    createAssignment,
    getAssignmentsByCourse,
    getAssignment,
    updateAssignment,
    publishAssignment,
    deleteAssignment,
    getTeacherAssignments
} = require("../controller/assignmentController");

// Teacher routes
router.post("/", protect, isTeacher, createAssignment);
router.get("/my-assignments", protect, isTeacher, getTeacherAssignments);
router.put("/:id", protect, isTeacher, updateAssignment);
router.put("/:id/publish", protect, isTeacher, publishAssignment);
router.delete("/:id", protect, isTeacher, deleteAssignment);

// Shared routes (access controlled in controller)
router.get("/course/:courseId", protect, getAssignmentsByCourse);
router.get("/:id", protect, getAssignment);

module.exports = router;
