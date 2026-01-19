const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["Pending", "Success", "Failed", "Refunded"],
        default: "Pending"
    },
    paymentMethod: {
        type: String, // e.g. "Card", "UPI", "PayPal"
    },
    receiptUrl: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
