const User = require("../models/User");
const Gig = require("../models/Gig");
const Order = require("../models/Order");
const Review = require("../models/Review");

const FEE = 0.2; // Liverr service fee on seller earnings (shown in dashboard)
const list = (v) => (Array.isArray(v) ? v : String(v || "").split(",")).map((s) => String(s).trim()).filter(Boolean).slice(0, 15);

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -favorites -email");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const [gigs, reviews] = await Promise.all([
      Gig.find({ seller: user._id, isActive: true }).populate("seller", "name avatar rating reviewCount sellerLevel").sort("-createdAt"),
      Review.find({ seller: user._id }).populate("reviewer", "name avatar country").sort("-createdAt").limit(20),
    ]);
    res.json({ success: true, user, gigs, reviews });
  } catch (err) { res.status(400).json({ success: false, message: "Invalid user id" }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, country, avatar } = req.body;
    const update = {};
    if (name !== undefined) { if (!String(name).trim()) return res.status(400).json({ success: false, message: "Name cannot be empty" }); update.name = String(name).trim(); }
    if (bio !== undefined) update.bio = String(bio).slice(0, 500);
    if (country !== undefined) update.country = String(country).slice(0, 60);
    if (req.body.skills !== undefined) update.skills = list(req.body.skills);
    if (req.body.languages !== undefined) update.languages = list(req.body.languages);
    if (avatar !== undefined) {
      if (avatar.length > 600000) return res.status(400).json({ success: false, message: "Avatar image is too large" });
      update.avatar = avatar;
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.becomeSeller = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { role: "seller" }, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });
    const user = await User.findById(req.user._id);
    const has = user.favorites.some((id) => id.toString() === req.params.gigId);
    user.favorites = has ? user.favorites.filter((id) => id.toString() !== req.params.gigId) : [...user.favorites, gig._id];
    await user.save();
    res.json({ success: true, favorites: user.favorites, added: !has });
  } catch (err) { res.status(400).json({ success: false, message: "Invalid gig id" }); }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites", match: { isActive: true },
      populate: { path: "seller", select: "name avatar rating reviewCount sellerLevel" },
    });
    res.json({ success: true, gigs: user.favorites.filter(Boolean) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const uid = req.user._id;
    const buyerOrders = await Order.find({ buyer: uid }).select("status price");
    const buyer = {
      totalOrders: buyerOrders.length,
      activeOrders: buyerOrders.filter((o) => ["in_progress", "delivered", "revision"].includes(o.status)).length,
      completedOrders: buyerOrders.filter((o) => o.status === "completed").length,
      totalSpent: buyerOrders.filter((o) => !["awaiting_payment", "cancelled"].includes(o.status)).reduce((s, o) => s + o.price, 0),
    };
    let seller = null;
    if (req.user.role === "seller") {
      const so = await Order.find({ seller: uid }).select("status price");
      const sum = (arr) => arr.reduce((s, o) => s + o.price, 0);
      const done = so.filter((o) => o.status === "completed");
      const pending = so.filter((o) => ["in_progress", "delivered", "revision"].includes(o.status));
      seller = {
        gigs: await Gig.countDocuments({ seller: uid }),
        totalOrders: so.length,
        activeOrders: pending.length,
        completedOrders: done.length,
        earnings: Math.round(sum(done) * (1 - FEE)),
        pendingEarnings: Math.round(sum(pending) * (1 - FEE)),
        feePercent: FEE * 100,
        rating: req.user.rating, reviewCount: req.user.reviewCount, level: req.user.sellerLevel,
      };
    }
    res.json({ success: true, buyer, seller });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
