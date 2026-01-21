const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
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

            const decoded = jwt.verify(token, "secretKey");

            if (decoded.role === "User") {
                req.user = await User.findById(decoded.id).select("-password");
            } else if (decoded.role === "Teacher") {
                req.user = await Teacher.findById(decoded.id).select("-password");
            } else {
                req.user = await Admin.findById(decoded.id).select("-password");
            }

            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(401).json({ message: "Not authorized" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as an admin" });
    }
};

const isUser = (req, res, next) => {
    if (req.user && req.user.role === "User") {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as a user" });
    }
};

const isTeacher = (req, res, next) => {
    if (req.user && req.user.role === "Teacher") {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as a teacher" });
    }
};

module.exports = { protect, isAdmin, isUser, isTeacher };
