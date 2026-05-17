const mongoose = require("mongoose");
const pkgSchema = new mongoose.Schema({ title: String, description: String, deliveryTime: Number, revisions: { type: Number, default: 1 }, price: Number, features: [String] });
const gigSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 100 },
  category: { type: String, required: true, enum: ["Graphics & Design","Digital Marketing","Writing & Translation","Video & Animation","Music & Audio","Programming & Tech","Business","Data","Lifestyle"] },
  description: { type: String, required: true, maxlength: 2000 },
  packages: { basic: pkgSchema, standard: pkgSchema, premium: pkgSchema },
  tags: [String], coverImage: { type: String, default: "" },
  rating: { type: Number, default: 0 }, reviewCount: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 }, isActive: { type: Boolean, default: true },
}, { timestamps: true });
gigSchema.index({ title: "text", description: "text", tags: "text" });
module.exports = mongoose.model("Gig", gigSchema);
