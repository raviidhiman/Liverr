const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["buyer","seller"], default: "buyer" },
  isVerified: { type: Boolean, default: false },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "", maxlength: 500 },
  skills: [String], country: { type: String, default: "" }, languages: [String],
  rating: { type: Number, default: 0 }, reviewCount: { type: Number, default: 0 },
  isSeller: { type: Boolean, default: false },
  sellerLevel: { type: String, enum: ["New Seller","Level One","Level Two","Top Rated"], default: "New Seller" },
}, { timestamps: true });
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12); next();
});
userSchema.methods.matchPassword = function(pass) { return bcrypt.compare(pass, this.password); };
module.exports = mongoose.model("User", userSchema);
