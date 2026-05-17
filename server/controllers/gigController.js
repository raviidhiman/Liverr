const Gig = require("../models/Gig");
exports.getGigs = async (req, res) => {
  try {
    const { category, search, min, max, sort="-createdAt", page=1, limit=16 } = req.query;
    const q = { isActive:true };
    if (category) q.category = category;
    if (search) q.$text = { $search: search };
    if (min||max) { q["packages.basic.price"]={}; if(min) q["packages.basic.price"].$gte=Number(min); if(max) q["packages.basic.price"].$lte=Number(max); }
    const [gigs, total] = await Promise.all([
      Gig.find(q).populate("seller","name avatar rating reviewCount sellerLevel isVerified").sort(sort).skip((page-1)*limit).limit(Number(limit)),
      Gig.countDocuments(q)
    ]);
    res.json({ success:true, gigs, total, pages:Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
exports.getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate("seller","name avatar bio rating reviewCount sellerLevel country languages skills isVerified createdAt");
    if (!gig) return res.status(404).json({ success:false, message:"Gig not found" });
    res.json({ success:true, gig });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
exports.createGig = async (req, res) => {
  try {
    const gig = await Gig.create({ ...req.body, seller:req.user._id });
    res.status(201).json({ success:true, gig });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
};
exports.updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success:false, message:"Gig not found" });
    if (gig.seller.toString() !== req.user._id.toString()) return res.status(403).json({ success:false, message:"Not authorized" });
    const updated = await Gig.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    res.json({ success:true, gig:updated });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
};
exports.deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success:false, message:"Gig not found" });
    if (gig.seller.toString() !== req.user._id.toString()) return res.status(403).json({ success:false, message:"Not authorized" });
    await gig.deleteOne();
    res.json({ success:true, message:"Gig deleted successfully" });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
exports.getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ seller:req.user._id }).sort("-createdAt");
    res.json({ success:true, gigs });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
