const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Student is required"]
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course is required"]
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Active", "Completed", "Expired", "Cancelled"],
        default: "Active"
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    completedLectures: [{
        type: String // or ObjectId if lectures have unique IDs manageable here
    }],
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent duplicate enrollments for active courses
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
