const Order = require("../models/Order");
const Gig = require("../models/Gig");
const User = require("../models/User");
const Review = require("../models/Review");
const Payment = require("../models/Payment");

const populateOrder = (q) => q
  .populate("gig", "title coverImage category isActive")
  .populate("buyer", "name avatar")
  .populate("seller", "name avatar");

// Who may move an order from one status to another
const RULES = {
  buyer: { awaiting_payment: ["cancelled"], delivered: ["completed", "revision"] },
  seller: { in_progress: ["delivered", "cancelled"], revision: ["delivered", "cancelled"] },
};

const levelFor = (n) => (n >= 50 ? "Top Rated" : n >= 20 ? "Level Two" : n >= 5 ? "Level One" : "New Seller");

exports.createOrder = async (req, res) => {
  try {
    const { gigId, packageType, requirements } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig || !gig.isActive) return res.status(404).json({ success: false, message: "Gig not available" });
    if (gig.seller.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot order your own gig" });
    const pkg = ["basic", "standard", "premium"].includes(packageType) ? gig.packages[packageType] : null;
    if (!pkg || !pkg.price) return res.status(400).json({ success: false, message: "Invalid package" });
    const order = await Order.create({
      gig: gig._id, gigTitle: gig.title, buyer: req.user._id, seller: gig.seller, package: packageType,
      price: pkg.price, deliveryTime: pkg.deliveryTime, revisionsAllowed: pkg.revisions,
      requirements: String(requirements || "").slice(0, 2000), status: "awaiting_payment",
    });
    res.status(201).json({ success: true, order: await populateOrder(Order.findById(order._id)) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await populateOrder(Order.findById(req.params.id));
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    const uid = req.user._id.toString();
    if (order.buyer._id.toString() !== uid && order.seller._id.toString() !== uid)
      return res.status(403).json({ success: false, message: "Not authorized" });
    res.json({ success: true, order });
  } catch (err) { res.status(400).json({ success: false, message: "Invalid order id" }); }
};

exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await populateOrder(Order.find({ buyer: req.user._id }).sort("-createdAt")).lean();
    const reviewed = await Review.find({ order: { $in: orders.map((o) => o._id) } }).select("order");
    const set = new Set(reviewed.map((r) => r.order.toString()));
    orders.forEach((o) => { o.reviewed = set.has(o._id.toString()); });
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await populateOrder(Order.find({ seller: req.user._id }).sort("-createdAt"));
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryNote } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    const uid = req.user._id.toString();
    const role = order.buyer.toString() === uid ? "buyer" : order.seller.toString() === uid ? "seller" : null;
    if (!role) return res.status(403).json({ success: false, message: "Not authorized" });

    const allowed = (RULES[role][order.status] || []);
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: `As ${role}, you cannot move an order from "${order.status}" to "${status}".` });

    if (status === "revision") {
      if (order.revisionsUsed >= order.revisionsAllowed)
        return res.status(400).json({ success: false, message: "No revisions left on this package." });
      order.revisionsUsed += 1;
    }
    if (status === "delivered") {
      if (!deliveryNote || !String(deliveryNote).trim())
        return res.status(400).json({ success: false, message: "Add a delivery note (links, instructions) before delivering." });
      order.deliveryNote = String(deliveryNote).slice(0, 2000);
      order.deliveredAt = new Date();
    }
    if (status === "revision" && deliveryNote) order.deliveryNote = String(deliveryNote).slice(0, 2000);

    order.status = status;

    if (status === "completed") {
      order.completedAt = new Date();
      await Gig.findByIdAndUpdate(order.gig, { $inc: { orderCount: 1 } });
      const seller = await User.findByIdAndUpdate(order.seller, { $inc: { completedOrders: 1 } }, { new: true });
      if (seller) { seller.sellerLevel = levelFor(seller.completedOrders); await seller.save(); }
    }
    if (status === "cancelled" && role === "seller") {
      // Paid order cancelled by the seller -> flag the payment for a manual refund
      await Payment.updateMany({ order: order._id, status: "paid" }, { status: "refund_pending" });
    }
    await order.save();
    res.json({ success: true, order: await populateOrder(Order.findById(order._id)) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
