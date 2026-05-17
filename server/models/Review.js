const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });
module.exports = mongoose.model("Review", reviewSchema);
