const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  package: { type: String, enum: ["basic","standard","premium"], required: true },
  price: { type: Number, required: true }, deliveryTime: { type: Number, required: true },
  requirements: { type: String, default: "" },
  status: { type: String, enum: ["awaiting_payment","pending","in_progress","delivered","completed","cancelled","revision"], default: "awaiting_payment" },
  deliveryNote: { type: String, default: "" }, dueDate: Date,
  paymentId: { type: String, default: "" }, razorpayOrderId: { type: String, default: "" },
}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);
