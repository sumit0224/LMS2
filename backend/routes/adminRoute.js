const express = require("express");
const router = express.Router();
const { loginAdmin, registerAdmin, profileAdmin, registerUserbyAdmin, registerTeacherbyAdmin, createCourse, updateCourse, deleteCourse } = require("../controller/adminController")
const { protect, isAdmin } = require("../middlewares/authMiddleware")

router.post("/login", loginAdmin)
router.post("/register", registerAdmin)
router.get("/profile", protect, profileAdmin)
router.post("/register/user", protect, isAdmin, registerUserbyAdmin)
router.post("/register/teacher", protect, isAdmin, registerTeacherbyAdmin)
router.post("/course", protect, isAdmin, createCourse)
router.put("/course/:id", protect, isAdmin, updateCourse)
router.delete("/course/:id", protect, isAdmin, deleteCourse)

module.exports = router