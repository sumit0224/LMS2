const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 2 characters long"],
        maxlength: [50, "Name cannot exceed 50 characters"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address"
        ],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10}$/, "Phone number must be 10 digits"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    doj: {
        type: Date,
        default: Date.now
    },
    batchNo: {
        type: String,
        trim: true
    },
    personal: {
        type: String,
        maxlength: [500, "Personal details cannot exceed 500 characters"],
        trim: true
    },
    courseName: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);