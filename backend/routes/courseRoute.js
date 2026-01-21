const express = require("express");
const router = express.Router();
const { getAllCourses, getCourseDetails } = require("../controller/courseController");

// Public routes for preview
router.get("/", getAllCourses);
router.get("/:id", getCourseDetails);

module.exports = router;
