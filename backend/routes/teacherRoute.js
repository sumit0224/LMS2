const express = require("express");
const router = express.Router();
const { loginTeacher, profileTeacher } = require("../controller/teacherController");
const { protect, isTeacher } = require("../middlewares/authMiddleware");

router.post("/login", loginTeacher);
router.get("/profile", protect, isTeacher, profileTeacher);

module.exports = router;
