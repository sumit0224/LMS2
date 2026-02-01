const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course is required"]
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch"
    },
    date: {
        type: Date,
        required: [true, "Date is required"]
    },
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["Present", "Absent", "Late", "Excused"],
            default: "Absent"
        }
    }],
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, "Notes cannot exceed 500 characters"]
    }
}, { timestamps: true });

// CRITICAL: Prevent duplicate attendance for same course & date
attendanceSchema.index(
    { course: 1, date: 1 },
    { unique: true }
);

// Performance indexes
attendanceSchema.index({ markedBy: 1 });
attendanceSchema.index({ "records.student": 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
