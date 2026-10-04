const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
  gigTitle: { type: String, default: "" },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  package: { type: String, enum: ["basic", "standard", "premium"], required: true },
  price: { type: Number, required: true },
  deliveryTime: { type: Number, required: true },
  revisionsAllowed: { type: Number, default: 1 },
  revisionsUsed: { type: Number, default: 0 },
  requirements: { type: String, default: "", maxlength: 2000 },
  status: { type: String, enum: ["awaiting_payment", "in_progress", "delivered", "revision", "completed", "cancelled"], default: "awaiting_payment" },
  deliveryNote: { type: String, default: "" },
  dueDate: Date,
  deliveredAt: Date,
  completedAt: Date,
  paymentId: { type: String, default: "" },
  razorpayOrderId: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
