const crypto = require("crypto");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

// Mock mode = no real Razorpay keys configured. Lets you test the whole flow locally.
const isMock = () => {
  const id = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  return !id || !secret || /dummy|your_|change_me/i.test(id + secret);
};
// On a production server, fake payments are blocked unless explicitly allowed (demo deployments)
const mockBlocked = () => isMock() && process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK_PAYMENTS !== "true";

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Not authorized" });
    if (order.status !== "awaiting_payment") return res.status(400).json({ success: false, message: "This order is already paid or closed." });

    if (mockBlocked()) return res.status(503).json({ success: false, message: "Payments are not configured on this server yet." });

    const amountPaise = Math.round(order.price * 100);
    let rzpOrderId, mock = isMock();
    if (mock) {
      rzpOrderId = `mock_${order._id}_${Date.now()}`;
    } else {
      const Razorpay = require("razorpay");
      const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const created = await rzp.orders.create({ amount: amountPaise, currency: "INR", receipt: `ord_${order._id.toString().slice(-10)}`, notes: { orderId: order._id.toString() } });
      rzpOrderId = created.id;
    }
    await Payment.deleteMany({ order: order._id, status: "created" });
    await Payment.create({ order: order._id, buyer: req.user._id, seller: order.seller, amount: order.price, currency: "INR", razorpayOrderId: rzpOrderId, mock, status: "created" });
    order.razorpayOrderId = rzpOrderId;
    await order.save();
    res.json({ success: true, mock, razorpayOrderId: rzpOrderId, amount: amountPaise, currency: "INR", keyId: mock ? "" : process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Razorpay error:", err.message || err);
    res.status(500).json({ success: false, message: "Payment gateway error: " + (err.error?.description || err.message) });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Not authorized" });
    if (order.status !== "awaiting_payment") return res.json({ success: true, message: "Order already active.", order });

    // The Razorpay order must be one WE created for THIS order and this buyer
    const payment = await Payment.findOne({ order: order._id, buyer: req.user._id, razorpayOrderId, status: "created" });
    if (!payment || order.razorpayOrderId !== razorpayOrderId)
      return res.status(400).json({ success: false, message: "Payment does not match this order." });

    if (payment.mock) {
      if (!isMock() || mockBlocked()) return res.status(400).json({ success: false, message: "Mock payments are disabled." });
    } else {
      const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
      const a = Buffer.from(expected), b = Buffer.from(String(razorpaySignature || ""));
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
        return res.status(400).json({ success: false, message: "Payment verification failed." });
    }
    payment.status = "paid";
    payment.razorpayPaymentId = razorpayPaymentId || `mock_pay_${Date.now()}`;
    payment.razorpaySignature = razorpaySignature || "";
    await payment.save();
    order.status = "in_progress";
    order.paymentId = payment.razorpayPaymentId;
    order.dueDate = new Date(Date.now() + order.deliveryTime * 24 * 60 * 60 * 1000);
    await order.save();
    res.json({ success: true, message: "Payment successful! Your order is now active.", order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ buyer: req.user._id })
      .populate("order", "status package gigTitle").populate("seller", "name").sort("-createdAt");
    res.json({ success: true, payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
