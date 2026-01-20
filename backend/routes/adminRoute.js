const express = require("express");
const router = express.Router();
const {loginAdmin, registerAdmin, profileAdmin} = require("../controller/adminController")


router.post("/login", loginAdmin)
router.post("/register", registerAdmin)
router.get("/profile", profileAdmin)

module.exports = router