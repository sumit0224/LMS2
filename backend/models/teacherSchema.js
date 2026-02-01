const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters long"],
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
    subject: {
        type: String,
        required: [true, "Subject is required"],
        trim: true
    },
    qualification: {
        type: String,
        required: [true, "Qualification is required"],
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    doj: {
        type: Date,
        default: Date.now
    },
    assignedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],
    role: {
        type: String,
        enum: ["teacher"],
        default: "teacher",
        immutable: true  // 🔒 SECURITY: Role cannot be changed
    }
}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);
