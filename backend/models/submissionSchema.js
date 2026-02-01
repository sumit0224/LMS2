const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    submissionText: {
        type: String,
        default: ""
    },
    submissionFile: {
        type: String, // file URL
        default: ""
    },
    marksObtained: {
        type: Number,
        default: null
    },
    feedback: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Submitted", "Reviewed"],
        default: "Submitted"
    },
    isLate: {
        type: Boolean,
        default: false
    },
    attemptNumber: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

// CRITICAL: Enforce one submission per assignment per student
submissionSchema.index(
    { assignment: 1, student: 1 },
    { unique: true }
);

// Performance indexes
submissionSchema.index({ student: 1, status: 1 });
submissionSchema.index({ assignment: 1, status: 1 });
submissionSchema.index({ course: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
