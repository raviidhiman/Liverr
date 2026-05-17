const Order = require("../models/Order");
const Gig = require("../models/Gig");
exports.createOrder = async (req, res) => {
  try {
    const { gigId, packageType, requirements } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success:false, message:"Gig not found" });
    const pkg = gig.packages[packageType];
    if (!pkg) return res.status(400).json({ success:false, message:"Invalid package" });
    const dueDate = new Date(Date.now() + pkg.deliveryTime*24*60*60*1000);
    const order = await Order.create({ gig:gigId, buyer:req.user._id, seller:gig.seller, package:packageType, price:pkg.price, deliveryTime:pkg.deliveryTime, requirements, dueDate, status:"awaiting_payment" });
    const populated = await Order.findById(order._id).populate("gig","title coverImage").populate("buyer","name avatar").populate("seller","name avatar");
    res.status(201).json({ success:true, order:populated });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer:req.user._id }).populate("gig","title coverImage category").populate("seller","name avatar").sort("-createdAt");
    res.json({ success:true, orders });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller:req.user._id }).populate("gig","title coverImage").populate("buyer","name avatar").sort("-createdAt");
    res.json({ success:true, orders });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryNote } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success:false, message:"Order not found" });
    const isSeller = order.seller.toString() === req.user._id.toString();
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    if (!isSeller && !isBuyer) return res.status(403).json({ success:false, message:"Not authorized" });
    order.status = status;
    if (deliveryNote) order.deliveryNote = deliveryNote;
    if (status === "completed") await Gig.findByIdAndUpdate(order.gig, { $inc:{ orderCount:1 } });
    await order.save();
    res.json({ success:true, order });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
