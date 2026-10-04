const rateLimit = require("express-rate-limit");
const make = (windowMs, max, message) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { success: false, message } });

exports.apiLimiter = make(15 * 60 * 1000, 1000, "Too many requests, slow down.");
exports.otpLimiter = make(10 * 60 * 1000, 8, "Too many OTP requests. Try again in 10 minutes.");
exports.loginLimiter = make(15 * 60 * 1000, 20, "Too many login attempts. Try again later.");
