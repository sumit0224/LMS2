const express = require("express");
const router = express.Router();
const { loginUser, profileUser } = require("../controller/userController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", (req, res) => {
    res.send("user api")
})

router.post("/login", loginUser)
router.get("/profile", protect, profileUser)


module.exports = router