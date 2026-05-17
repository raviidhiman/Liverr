const User = require("../models/User");
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success:false, message:"User not found" });
    res.json({ success:true, user });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, country, languages } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, bio, skills, country, languages }, { new:true, runValidators:true }).select("-password");
    res.json({ success:true, user });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
};
