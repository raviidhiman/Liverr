const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ success:false, message:"Not authorized" });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ success:false, message:"User not found" });
    next();
  } catch { return res.status(401).json({ success:false, message:"Token invalid or expired" }); }
};
const sellerOnly = (req, res, next) => {
  if (req.user?.role !== "seller") return res.status(403).json({ success:false, message:"Seller access required" });
  next();
};
module.exports = { protect, sellerOnly };
