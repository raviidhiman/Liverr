const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ["registration","reset"], default: "registration" },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 5*60*1000), index: { expires: 0 } },
}, { timestamps: true });
otpSchema.index({ email: 1, purpose: 1 });
module.exports = mongoose.model("OTP", otpSchema);
