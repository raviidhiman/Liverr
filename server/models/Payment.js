const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true }, currency: { type: String, default: "INR" },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, default: "" }, razorpaySignature: { type: String, default: "" },
  status: { type: String, enum: ["created","paid","failed"], default: "created" },
}, { timestamps: true });
module.exports = mongoose.model("Payment", paymentSchema);
