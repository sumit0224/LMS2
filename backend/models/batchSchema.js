const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Batch title is required"],
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course is required"]
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    limit: {
        type: Number,
        default: 10,
        max: [10, "Batch cannot exceed 10 students"]
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    schedule: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Prevent over-enrollment at DB level (validation)
batchSchema.path('students').validate(function (value) {
    if (value.length > this.limit) {
        return false;
    }
    return true;
}, 'Batch limit reached');

module.exports = mongoose.model("Batch", batchSchema);
