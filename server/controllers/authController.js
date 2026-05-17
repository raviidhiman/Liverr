const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { sendOTPEmail } = require("../utils/email");

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const genOTP = () => crypto.randomInt(100000, 999999).toString();

exports.sendOTP = async (req, res) => {
  try {
    const { email, purpose = "registration" } = req.body;
    if (!email) return res.status(400).json({ success:false, message:"Email required" });
    if (purpose === "registration") {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ success:false, message:"Email already registered. Please login." });
    }
    if (purpose === "reset") {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ success:false, message:"No account with this email." });
    }
    await OTP.deleteMany({ email: email.toLowerCase(), purpose });
    const otp = genOTP();
    await OTP.create({ email: email.toLowerCase(), otp, purpose, expiresAt: new Date(Date.now() + 5*60*1000) });
    await sendOTPEmail(email, otp, purpose);
    res.json({ success:true, message:`OTP sent to ${email}` });
  } catch (err) {
    console.error("sendOTP:", err);
    res.status(500).json({ success:false, message:"Failed to send OTP. Check email config." });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = "registration" } = req.body;
    const record = await OTP.findOne({ email: email.toLowerCase(), purpose });
    if (!record) return res.status(400).json({ success:false, message:"OTP not found. Request a new one." });
    if (new Date() > record.expiresAt) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ success:false, message:"OTP expired. Request a new one." });
    }
    if (record.otp !== otp) return res.status(400).json({ success:false, message:"Incorrect OTP." });
    await OTP.deleteOne({ _id: record._id });
    const token = jwt.sign({ email: email.toLowerCase(), purpose, verified: true }, process.env.JWT_SECRET, { expiresIn: "10m" });
    res.json({ success:true, message:"OTP verified", verificationToken: token });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, verificationToken } = req.body;
    if (!verificationToken) return res.status(400).json({ success:false, message:"Email not verified" });
    let decoded;
    try { decoded = jwt.verify(verificationToken, process.env.JWT_SECRET); }
    catch { return res.status(400).json({ success:false, message:"Verification token expired" }); }
    if (decoded.purpose !== "registration" || decoded.email !== email.toLowerCase())
      return res.status(400).json({ success:false, message:"Invalid verification token" });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success:false, message:"Email already registered" });
    const user = await User.create({ name, email: email.toLowerCase(), password, role: role||"buyer", isVerified:true, isSeller: role==="seller" });
    const token = genToken(user._id);
    res.status(201).json({ success:true, token, user:{ _id:user._id, name:user.name, email:user.email, role:user.role, isVerified:user.isVerified, avatar:user.avatar } });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success:false, message:"Invalid email or password" });
    const token = genToken(user._id);
    res.json({ success:true, token, user:{ _id:user._id, name:user.name, email:user.email, role:user.role, isVerified:user.isVerified, avatar:user.avatar, isSeller:user.isSeller } });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.forgotPassword = async (req, res) => { req.body.purpose = "reset"; return exports.sendOTP(req, res); };

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, verificationToken } = req.body;
    let decoded;
    try { decoded = jwt.verify(verificationToken, process.env.JWT_SECRET); }
    catch { return res.status(400).json({ success:false, message:"Token expired" }); }
    if (decoded.purpose !== "reset" || decoded.email !== email.toLowerCase())
      return res.status(400).json({ success:false, message:"Invalid token" });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success:false, message:"Password must be at least 6 characters" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success:false, message:"User not found" });
    user.password = newPassword;
    await user.save();
    res.json({ success:true, message:"Password reset successfully" });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.getMe = async (req, res) => res.json({ success:true, user: req.user });
