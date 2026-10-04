const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { sendOTPEmail } = require("../utils/email");

const MAX_OTP_ATTEMPTS = 5;
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const genOTP = () => crypto.randomInt(100000, 1000000).toString();
const hashOTP = (otp) => crypto.createHash("sha256").update(otp + process.env.JWT_SECRET).digest("hex");
const publicUser = (u) => ({
  _id: u._id, name: u.name, email: u.email, role: u.role, isVerified: u.isVerified,
  avatar: u.avatar, favorites: u.favorites || [], sellerLevel: u.sellerLevel,
});

exports.sendOTP = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const purpose = req.body.purpose === "reset" ? "reset" : "registration";
    if (!emailRx.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email" });

    const existing = await User.findOne({ email });
    if (purpose === "registration" && existing)
      return res.status(400).json({ success: false, message: "Email already registered. Please log in." });
    // Do not reveal whether an account exists when resetting a password
    if (purpose === "reset" && !existing)
      return res.json({ success: true, message: "If an account exists, an OTP has been sent." });

    const otp = genOTP();
    await OTP.deleteMany({ email, purpose });
    await OTP.create({ email, otpHash: hashOTP(otp), purpose, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    const { delivered } = await sendOTPEmail(email, otp, purpose);
    const devAllowed = process.env.ALLOW_DEV_OTP === "true";
    if (!delivered && !devAllowed && process.env.NODE_ENV === "production") {
      await OTP.deleteMany({ email, purpose });
      return res.status(500).json({ success: false, message: "Email service is not configured on the server." });
    }
    const body = { success: true, message: delivered ? `OTP sent to ${email}` : "OTP generated (dev mode)." };
    if (!delivered && devAllowed) body.devOtp = otp; // shown on screen only in dev/demo mode
    res.json(body);
  } catch (err) {
    console.error("sendOTP:", err.message);
    res.status(500).json({ success: false, message: "Failed to send OTP. Check the email settings on the server." });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();
    const purpose = req.body.purpose === "reset" ? "reset" : "registration";
    const record = await OTP.findOne({ email, purpose });
    if (!record) return res.status(400).json({ success: false, message: "OTP not found or expired. Request a new one." });
    if (new Date() > record.expiresAt) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: "OTP expired. Request a new one." });
    }
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(429).json({ success: false, message: "Too many wrong attempts. Request a new OTP." });
    }
    if (record.otpHash !== hashOTP(otp)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: "Incorrect OTP." });
    }
    await OTP.deleteOne({ _id: record._id });
    const verificationToken = jwt.sign({ email, purpose, verified: true }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ success: true, message: "OTP verified", verificationToken });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.register = async (req, res) => {
  try {
    const { name, password, role, verificationToken } = req.body;
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!verificationToken) return res.status(400).json({ success: false, message: "Email not verified" });
    let decoded;
    try { decoded = jwt.verify(verificationToken, process.env.JWT_SECRET); }
    catch { return res.status(400).json({ success: false, message: "Verification expired. Start again." }); }
    if (decoded.purpose !== "registration" || decoded.email !== email)
      return res.status(400).json({ success: false, message: "Invalid verification token" });
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: "Email already registered" });
    const user = await User.create({ name: name.trim(), email, password, role: role === "seller" ? "seller" : "buyer", isVerified: true });
    res.status(201).json({ success: true, token: genToken(user._id), user: publicUser(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    res.json({ success: true, token: genToken(user._id), user: publicUser(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.forgotPassword = async (req, res) => { req.body.purpose = "reset"; return exports.sendOTP(req, res); };

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, verificationToken } = req.body;
    const email = String(req.body.email || "").toLowerCase().trim();
    let decoded;
    try { decoded = jwt.verify(verificationToken, process.env.JWT_SECRET); }
    catch { return res.status(400).json({ success: false, message: "Verification expired. Start again." }); }
    if (decoded.purpose !== "reset" || decoded.email !== email)
      return res.status(400).json({ success: false, message: "Invalid token" });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMe = async (req, res) => res.json({ success: true, user: publicUser(req.user) });
