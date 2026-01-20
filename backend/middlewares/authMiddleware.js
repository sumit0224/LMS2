const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const User = require("../models/userSchema"); // Optional: if we want to support user auth here too

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


            req.user = await Admin.findById(decoded.id).select("-password");

            // If not found in Admin, maybe check User? 
            // The current requirement is likely for Admin protection.
            // If req.user is null, it might mean the token belongs to a User, not an Admin, 
            // OR the Admin was deleted.

            if (!req.user) {
                // Fallback or specific check. 
                // If the token has "role: admin", it should be in Admin.
                if (decoded.role === 'admin') {
                    return res.status(401).json({ message: "Not authorized, admin not found" });
                }
                // If we want to allow generic users:
                // req.user = await User.findById(decoded.id).select("-password");
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

module.exports = { protect, isAdmin };
