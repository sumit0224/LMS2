const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 1
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
        default: "Draft"
    },
    // Enhanced features
    isLateAllowed: {
        type: Boolean,
        default: false
    },
    maxAttempts: {
        type: Number,
        default: 1,
        min: 1
    },
    attachments: [{
        name: String,
        url: String
    }]
}, { timestamps: true });

// Index for efficient course-based queries
assignmentSchema.index({ course: 1, status: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
