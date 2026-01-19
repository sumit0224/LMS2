const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, "Comment cannot exceed 500 characters"]
    }
}, { timestamps: true });

// Prevent multiple reviews from the same student for the same course
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
