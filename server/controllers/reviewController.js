const Review = require("../models/Review");
const Order = require("../models/Order");
const Gig = require("../models/Gig");
const User = require("../models/User");
exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success:false, message:"Order not found" });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ success:false, message:"Only buyer can review" });
    if (order.status !== "completed") return res.status(400).json({ success:false, message:"Order must be completed first" });
    const existing = await Review.findOne({ order:orderId });
    if (existing) return res.status(400).json({ success:false, message:"Already reviewed" });
    const review = await Review.create({ gig:order.gig, order:orderId, reviewer:req.user._id, seller:order.seller, rating, comment });
    const reviews = await Review.find({ gig:order.gig });
    const avg = (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1);
    await Gig.findByIdAndUpdate(order.gig, { rating:avg, reviewCount:reviews.length });
    await User.findByIdAndUpdate(order.seller, { rating:avg, reviewCount:reviews.length });
    res.status(201).json({ success:true, review });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
exports.getGigReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ gig:req.params.gigId }).populate("reviewer","name avatar country").sort("-createdAt");
    res.json({ success:true, reviews });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
