const Review = require("../models/Review");
const Order = require("../models/Order");
const Gig = require("../models/Gig");
const User = require("../models/User");

const avgFor = async (filter) => {
  const [r] = await Review.aggregate([{ $match: filter }, { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]);
  return { rating: r ? Math.round(r.avg * 10) / 10 : 0, reviewCount: r ? r.count : 0 };
};

exports.createReview = async (req, res) => {
  try {
    const { orderId } = req.body;
    const rating = Math.round(Number(req.body.rating));
    const comment = String(req.body.comment || "").trim();
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ success: false, message: "Rating must be 1 to 5" });
    if (!comment) return res.status(400).json({ success: false, message: "Please write a short review" });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Only the buyer can review" });
    if (order.status !== "completed") return res.status(400).json({ success: false, message: "Order must be completed first" });
    if (await Review.findOne({ order: orderId })) return res.status(400).json({ success: false, message: "Already reviewed" });

    const review = await Review.create({ gig: order.gig, order: orderId, reviewer: req.user._id, seller: order.seller, rating, comment });
    // Gig rating = average of that gig's reviews; seller rating = average across ALL the seller's reviews
    await Gig.findByIdAndUpdate(order.gig, await avgFor({ gig: order.gig }));
    await User.findByIdAndUpdate(order.seller, await avgFor({ seller: order.seller }));
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getGigReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId }).populate("reviewer", "name avatar country").sort("-createdAt");
    res.json({ success: true, reviews });
  } catch (err) { res.status(400).json({ success: false, message: "Invalid gig id" }); }
};
