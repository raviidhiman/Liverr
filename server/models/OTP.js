const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otpHash: { type: String, required: true },
  purpose: { type: String, enum: ["registration", "reset"], default: "registration" },
  attempts: { type: Number, default: 0 },
  // MongoDB TTL index removes the document automatically after expiry
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });
otpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model("OTP", otpSchema);
