const Gig = require("../models/Gig");
const Order = require("../models/Order");

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SELLER_FIELDS = "name avatar rating reviewCount sellerLevel isVerified";

// Only accept the fields a seller is allowed to set (prevents mass assignment)
const cleanPackages = (input = {}) => {
  const out = {};
  for (const tier of ["basic", "standard", "premium"]) {
    const p = input[tier];
    if (!p || !(Number(p.price) > 0)) continue;
    out[tier] = {
      title: String(p.title || "").slice(0, 60),
      description: String(p.description || "").slice(0, 300),
      price: Math.round(Number(p.price)),
      deliveryTime: Math.max(1, Math.round(Number(p.deliveryTime) || 1)),
      revisions: Math.max(0, Math.round(Number(p.revisions) || 0)),
      features: (Array.isArray(p.features) ? p.features : []).map((f) => String(f).trim()).filter(Boolean).slice(0, 10),
    };
  }
  return out;
};
const cleanTags = (t) => (Array.isArray(t) ? t : String(t || "").split(","))
  .map((x) => String(x).trim().toLowerCase()).filter(Boolean).slice(0, 8);

const pickGigFields = (body) => {
  const data = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.category !== undefined) data.category = body.category;
  if (body.description !== undefined) data.description = body.description;
  if (body.tags !== undefined) data.tags = cleanTags(body.tags);
  if (body.coverImage !== undefined) data.coverImage = body.coverImage;
  if (body.isActive !== undefined) data.isActive = !!body.isActive;
  if (body.packages !== undefined) data.packages = cleanPackages(body.packages);
  return data;
};

exports.getGigs = async (req, res) => {
  try {
    const { category, search, min, max, delivery, seller, sort = "newest" } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit) || 12));
    const q = { isActive: true };
    if (category) q.category = category;
    if (seller) q.seller = seller;
    if (search) {
      const rx = new RegExp(escapeRx(String(search).trim()), "i");
      q.$or = [{ title: rx }, { tags: rx }, { description: rx }, { category: rx }];
    }
    if (min || max) {
      q["packages.basic.price"] = {};
      if (min) q["packages.basic.price"].$gte = Number(min);
      if (max) q["packages.basic.price"].$lte = Number(max);
    }
    if (delivery) q["packages.basic.deliveryTime"] = { $lte: Number(delivery) };
    const sorts = {
      newest: { createdAt: -1 }, popular: { orderCount: -1, rating: -1 }, rating: { rating: -1, reviewCount: -1 },
      price_asc: { "packages.basic.price": 1 }, price_desc: { "packages.basic.price": -1 },
    };
    const [gigs, total] = await Promise.all([
      Gig.find(q).populate("seller", SELLER_FIELDS).sort(sorts[sort] || sorts.newest).skip((page - 1) * limit).limit(limit),
      Gig.countDocuments(q),
    ]);
    res.json({ success: true, gigs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("seller", `${SELLER_FIELDS} bio country languages skills createdAt completedOrders`);
    if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });
    res.json({ success: true, gig });
  } catch (err) { res.status(400).json({ success: false, message: "Invalid gig id" }); }
};

exports.createGig = async (req, res) => {
  try {
    const data = pickGigFields(req.body);
    if (!data.packages || !data.packages.basic)
      return res.status(400).json({ success: false, message: "Basic package with a price is required" });
    const gig = await Gig.create({ ...data, seller: req.user._id });
    res.status(201).json({ success: true, gig });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });
    if (gig.seller.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Not authorized" });
    const data = pickGigFields(req.body);
    if (data.packages && !data.packages.basic)
      return res.status(400).json({ success: false, message: "Basic package with a price is required" });
    gig.set(data);
    await gig.save();
    res.json({ success: true, gig });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });
    if (gig.seller.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Not authorized" });
    // Keep gigs that have orders (history), just hide them
    const hasOrders = await Order.exists({ gig: gig._id });
    if (hasOrders) {
      gig.isActive = false;
      await gig.save();
      return res.json({ success: true, message: "Gig has orders, so it was paused instead of deleted." });
    }
    await gig.deleteOne();
    res.json({ success: true, message: "Gig deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ seller: req.user._id }).sort("-createdAt");
    res.json({ success: true, gigs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
