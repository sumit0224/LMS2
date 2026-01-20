const express = require("express");
const router = express.Router();
const { loginAdmin, registerAdmin, profileAdmin, registerUserbyAdmin } = require("../controller/adminController")
const { protect, isAdmin } = require("../middlewares/authMiddleware")

router.post("/login", loginAdmin)
router.post("/register", registerAdmin)
router.get("/profile", protect, profileAdmin)
router.post("/register/user", protect,   isAdmin, registerUserbyAdmin)

module.exports = router