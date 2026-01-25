const express = require("express");
const router = express.Router();
const { loginUser, profileUser, registerUser } = require("../controller/userController");
const { protect, isUser } = require("../middlewares/authMiddleware");

router.get("/", (req, res) => {
    res.send("user api")
})

router.post("/login", loginUser)
router.post("/register", registerUser)
router.get("/profile", protect, isUser, profileUser)


module.exports = router