const express = require("express");
const router = express.Router();
const {
    createSyllabus,
    getSyllabusByCourse,
    updateSyllabus,
    addLesson,
    addModule,
    deleteSyllabus
} = require("../controller/syllabusController");
const { protect, isAdmin, isTeacher } = require("../middlewares/authMiddleware");

// Create syllabus (Admin only)
router.post("/", protect, isAdmin, createSyllabus);

// Get syllabus by course ID (Public)
router.get("/:courseId", getSyllabusByCourse);

// Update syllabus (Admin only)
router.put("/:id", protect, isAdmin, updateSyllabus);

// Add module to syllabus (Admin/Teacher)
router.post("/:id/module", protect, addModule);

// Add lesson to module (Teacher)
router.post("/:syllabusId/module/:moduleIndex/lesson", protect, isTeacher, addLesson);

// Delete syllabus (Admin only)
router.delete("/:id", protect, isAdmin, deleteSyllabus);

module.exports = router;
