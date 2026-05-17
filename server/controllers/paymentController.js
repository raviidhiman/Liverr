const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

const getRazorpay = () => new Razorpay({ key_id:process.env.RAZORPAY_KEY_ID, key_secret:process.env.RAZORPAY_KEY_SECRET });

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success:false, message:"Order not found" });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ success:false, message:"Not authorized" });
    const razorpay = getRazorpay();
    const amountPaise = Math.round(order.price * 100);
    const rzpOrder = await razorpay.orders.create({ amount:amountPaise, currency:"INR",receipt: `ord_${orderId.toString().slice(-10)}`, notes:{ orderId:orderId.toString() } });
    await Payment.create({ order:orderId, buyer:req.user._id, seller:order.seller, amount:order.price, currency:"INR", razorpayOrderId:rzpOrder.id, status:"created" });
    order.razorpayOrderId = rzpOrder.id;
    await order.save();
    res.json({ success:true, razorpayOrderId:rzpOrder.id, amount:amountPaise, currency:"INR", keyId:process.env.RAZORPAY_KEY_ID, orderDetails:{ id:order._id, price:order.price } });
  } catch (err) {
    console.error("Razorpay error:", err);
    res.status(500).json({ success:false, message:"Payment gateway error: "+err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    const body = razorpayOrderId+"|"+razorpayPaymentId;
    const expectedSig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
    if (expectedSig !== razorpaySignature) return res.status(400).json({ success:false, message:"Payment verification failed." });
    await Payment.findOneAndUpdate({ razorpayOrderId }, { razorpayPaymentId, razorpaySignature, status:"paid" });
    const order = await Order.findByIdAndUpdate(orderId, { status:"pending", paymentId:razorpayPaymentId }, { new:true });
    res.json({ success:true, message:"Payment verified! Order is now active.", order });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ buyer:req.user._id }).populate("order","status package deliveryTime").populate("seller","name").sort("-createdAt");
    res.json({ success:true, payments });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
