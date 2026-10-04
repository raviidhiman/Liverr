const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  razorpayOrderId: { type: String, required: true, index: true },
  razorpayPaymentId: { type: String, default: "" },
  razorpaySignature: { type: String, default: "" },
  mock: { type: Boolean, default: false },
  status: { type: String, enum: ["created", "paid", "failed", "refund_pending"], default: "created" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
