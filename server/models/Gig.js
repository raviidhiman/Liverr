const mongoose = require("mongoose");

const pkgSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  deliveryTime: { type: Number, required: true, min: 1 },
  revisions: { type: Number, default: 1, min: 0 },
  price: { type: Number, required: true, min: 1 },
  features: [String],
}, { _id: false });

const CATEGORIES = ["Graphics & Design", "Digital Marketing", "Writing & Translation", "Video & Animation", "Music & Audio", "Programming & Tech", "Business", "Data", "Lifestyle"];

const gigSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, enum: CATEGORIES, index: true },
  description: { type: String, required: true, maxlength: 2000 },
  packages: { basic: pkgSchema, standard: pkgSchema, premium: pkgSchema },
  tags: [String],
  coverImage: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

gigSchema.statics.CATEGORIES = CATEGORIES;
module.exports = mongoose.model("Gig", gigSchema);
