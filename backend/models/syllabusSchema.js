const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        unique: true // One syllabus per course
    },
    title: {
        type: String,
        required: [true, "Syllabus title is required"],
        trim: true
    },
    modules: [{
        moduleTitle: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        duration: {
            type: String, // e.g., "2 weeks"
            required: true
        },
        lectures: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            contentType: {
                type: String,
                enum: ["Video", "Article", "Quiz", "Assignment"],
                default: "Video"
            },
            duration: {
                type: Number, // in minutes
                min: 0
            },
            contentUrl: {
                type: String, // URL to video/pdf
                trim: true
            },
            isFreePreview: {
                type: Boolean,
                default: false
            }
        }]
    }],
    totalDuration: {
        type: String, // Calculated total duration
    },
    learningOutcomes: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

module.exports = mongoose.model("Syllabus", syllabusSchema);
