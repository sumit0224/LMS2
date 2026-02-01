const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Course title is required"],
        minlength: [3, "Title must be at least 3 characters long"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minlength: [10, "Description must be at least 10 characters long"]
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    duration: {
        type: String,
        required: [true, "Duration is required"],
        trim: true
    },
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner"
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: [true, "Instructor is required"]
    },
    thumbnail: {
        type: String,
        default: "default_thumbnail.jpg"
    },
    syllabus: [{
        topic: String,
        description: String
    }],
    enrollmentCount: {
        type: Number,
        default: 0
    },
    language: {
        type: String,
        default: "English"
    },
    prerequisites: [{
        type: String
    }],
    status: {
        type: String,
        enum: ["Draft", "Active"],
        default: "Draft"
    }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
