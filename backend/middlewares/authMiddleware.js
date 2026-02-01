const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const Teacher = require("../models/teacherSchema");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 🔒 Unified User model for admin/student, separate Teacher model
            if (decoded.role === "student" || decoded.role === "admin") {
                req.user = await User.findById(decoded.id).select("-password");
            } else if (decoded.role === "teacher") {
                req.user = await Teacher.findById(decoded.id).select("-password");
            } else {
                return res.status(401).json({ message: "Invalid role in token" });
            }

            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({ message: "Not authorized" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};

const isUser = (req, res, next) => {
    if (req.user && req.user.role === "student") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as a student" });
    }
};

const isTeacher = (req, res, next) => {
    if (req.user && req.user.role === "teacher") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as a teacher" });
    }
};

module.exports = { protect, isAdmin, isUser, isTeacher };

