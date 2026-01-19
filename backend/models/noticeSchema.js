const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    message: {
        type: String,
        required: [true, "Message is required"],
    },
    targetAudience: {
        type: String,
        enum: ["All", "Students", "Teachers"],
        default: "All"
    },
    category: {
        type: String,
        enum: ["General", "Urgent", "Event", "Maintenance"],
        default: "General"
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin", // Could also be Teacher depending on logic
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);
