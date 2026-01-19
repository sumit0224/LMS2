const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: [true, "Date is required"],
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Late", "Excused"],
        default: "Present",
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher", // or "Admin", could differ based on system
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: [200, "Remarks cannot exceed 200 characters"]
    }
}, { timestamps: true });

// Compound index to ensure a student isn't marked twice for the same course on the same date (optional but recommended)
// Note: 'date' might need truncation to just YYYY-MM-DD for this to work strictly as "daily attendance"
attendanceSchema.index({ student: 1, course: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
