const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
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
    moduleId: {
        type: String, // Or ObjectId related to backend/models/syllabusSchema.js
        required: true
    },
    assignmentTitle: {
        type: String,
        required: true
    },
    submissionUrl: {
        type: String, // Link to uploaded file
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Pending", "Graded", "Rejected"],
        default: "Pending"
    },
    grade: {
        type: String // A, B, C or 80/100
    },
    feedback: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
