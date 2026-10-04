/**
 * Demo data for Liverr.   Run:  npm run seed   (from /server)
 * Only touches accounts ending in @liverr.test (safe to re-run).
 * All demo accounts use the password:  Password@123
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Gig = require("./models/Gig");

const PASSWORD = "Password@123";

const sellers = [
  { name: "Aarav Sharma", email: "aarav@liverr.test", country: "India", bio: "Brand identity designer with 6+ years of experience. I turn ideas into memorable logos.", skills: ["Logo design", "Branding", "Illustrator"], languages: ["English", "Hindi"], rating: 4.9, reviewCount: 124, completedOrders: 60, sellerLevel: "Top Rated" },
  { name: "Priya Verma", email: "priya@liverr.test", country: "India", bio: "Full-stack developer (MERN). I build fast, clean web apps and fix stubborn bugs.", skills: ["React", "Node.js", "MongoDB"], languages: ["English", "Hindi"], rating: 4.8, reviewCount: 58, completedOrders: 24, sellerLevel: "Level Two" },
  { name: "Rohan Mehta", email: "rohan@liverr.test", country: "India", bio: "Content writer and SEO specialist helping brands rank and convert.", skills: ["SEO", "Blog writing", "Copywriting"], languages: ["English"], rating: 4.7, reviewCount: 19, completedOrders: 8, sellerLevel: "Level One" },
];
const buyers = [
  { name: "Demo Buyer", email: "buyer@liverr.test", country: "India" },
  { name: "Neha Gupta", email: "neha@liverr.test", country: "India" },
];

const pk = (title, description, price, deliveryTime, revisions, features) => ({ title, description, price, deliveryTime, revisions, features });

const gigsFor = (u) => ({
  "aarav@liverr.test": [
    { title: "I will design a modern minimalist logo for your brand", category: "Graphics & Design", tags: ["logo", "branding", "minimal"], description: "Get a clean, memorable logo with source files. I'll research your niche, share concepts and polish the one you love.", packages: { basic: pk("Starter", "1 logo concept, PNG + JPG", 999, 2, 1, ["1 concept", "PNG & JPG", "Commercial use"]), standard: pk("Pro", "3 concepts, vector files", 2499, 3, 3, ["3 concepts", "Vector source (AI/SVG)", "Social media kit"]), premium: pk("Brand", "Full brand identity", 5999, 5, 5, ["5 concepts", "Brand guidelines PDF", "Stationery design", "Unlimited revisions*"]) }, rating: 4.9, reviewCount: 98, orderCount: 70 },
    { title: "I will create eye-catching social media post designs", category: "Graphics & Design", tags: ["social media", "instagram", "canva"], description: "A pack of scroll-stopping post templates tailored to your brand colours, ready to post.", packages: { basic: pk("5 Posts", "5 custom post designs", 799, 2, 1, ["5 designs", "Editable Canva link"]), standard: pk("15 Posts", "15 custom post designs", 1999, 4, 2, ["15 designs", "Editable files", "Story variants"]) }, rating: 4.8, reviewCount: 26, orderCount: 31 },
    { title: "I will design a professional YouTube thumbnail", category: "Video & Animation", tags: ["thumbnail", "youtube"], description: "High-CTR thumbnails designed to get clicks while staying true to your channel style.", packages: { basic: pk("1 Thumbnail", "One custom thumbnail", 499, 1, 1, ["1 design", "HD export"]), standard: pk("3 Thumbnails", "Three thumbnails", 1299, 2, 2, ["3 designs", "HD export", "PSD source"]) }, rating: 4.7, reviewCount: 14, orderCount: 18 },
  ],
  "priya@liverr.test": [
    { title: "I will build a full-stack MERN web application", category: "Programming & Tech", tags: ["react", "node", "mongodb", "mern"], description: "Production-ready MERN apps with authentication, REST APIs and responsive UI. Clean, documented code.", packages: { basic: pk("Landing + API", "Small app with 2-3 pages", 7999, 7, 2, ["Responsive UI", "REST API", "Deployed demo"]), standard: pk("Full App", "Auth, dashboard, CRUD", 19999, 14, 3, ["Authentication", "Admin dashboard", "Payment-ready", "Docs"]), premium: pk("Startup MVP", "Complete MVP", 44999, 30, 5, ["Everything in Full App", "Payments", "Email/OTP", "CI + deployment", "30 days support"]) }, rating: 4.9, reviewCount: 31, orderCount: 22 },
    { title: "I will fix bugs in your React or Node.js project", category: "Programming & Tech", tags: ["debugging", "react", "node"], description: "Stuck on an error? Send me your repo and I'll find and fix the issue, with an explanation of what went wrong.", packages: { basic: pk("1 Bug", "Fix one bug or error", 999, 1, 1, ["1 bug fix", "Explanation"]), standard: pk("Up to 5 Bugs", "Fix several issues", 3499, 3, 2, ["5 bug fixes", "Code review"]) }, rating: 4.8, reviewCount: 27, orderCount: 34 },
    { title: "I will turn your Figma design into a responsive website", category: "Programming & Tech", tags: ["figma", "html", "tailwind"], description: "Pixel-perfect conversion of Figma/PSD into responsive React + Tailwind pages.", packages: { basic: pk("1 Page", "Single responsive page", 2499, 3, 2, ["1 page", "Mobile responsive"]), standard: pk("5 Pages", "Multi-page website", 9999, 7, 3, ["5 pages", "Animations", "SEO basics"]) }, rating: 4.7, reviewCount: 11, orderCount: 12 },
  ],
  "rohan@liverr.test": [
    { title: "I will write SEO-optimised blog articles that rank", category: "Writing & Translation", tags: ["seo", "blog", "content"], description: "Well-researched, original 1000+ word articles with keyword optimisation and a clear call to action.", packages: { basic: pk("1 Article", "1000 words", 1499, 3, 1, ["1000 words", "Keyword optimised", "Plagiarism free"]), standard: pk("3 Articles", "3 x 1000 words", 3999, 6, 2, ["3 articles", "Meta descriptions", "Internal link ideas"]) }, rating: 4.7, reviewCount: 12, orderCount: 15 },
    { title: "I will write high-converting website copy", category: "Writing & Translation", tags: ["copywriting", "website", "landing page"], description: "Clear, persuasive copy for your landing page or whole website that speaks to your customers.", packages: { basic: pk("Landing Page", "One landing page", 2999, 3, 2, ["Headline options", "Full page copy"]), standard: pk("Website", "Up to 5 pages", 8999, 7, 3, ["5 pages", "Tone of voice guide"]) }, rating: 4.6, reviewCount: 7, orderCount: 9 },
    { title: "I will plan your digital marketing strategy", category: "Digital Marketing", tags: ["marketing", "strategy", "social media"], description: "A practical 30-day marketing plan with channels, content ideas and measurable goals.", packages: { basic: pk("Mini Plan", "30-day plan", 1999, 3, 1, ["30-day calendar", "Channel advice"]), standard: pk("Full Strategy", "90-day strategy + call", 5999, 7, 2, ["90-day roadmap", "Competitor review", "1 hour call"]) }, rating: 4.5, reviewCount: 5, orderCount: 6 },
  ],
});

(async () => {
  if (!process.env.MONGO_URI) { console.error("MONGO_URI missing in server/.env"); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  const old = await User.find({ email: /@liverr\.test$/ }).select("_id");
  const ids = old.map((u) => u._id);
  await Gig.deleteMany({ seller: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });

  for (const b of buyers) await User.create({ ...b, password: PASSWORD, role: "buyer", isVerified: true });
  for (const s of sellers) {
    const user = await User.create({ ...s, password: PASSWORD, role: "seller", isVerified: true });
    for (const g of gigsFor(user)[s.email]) await Gig.create({ ...g, seller: user._id });
  }
  console.log("🌱 Seeded demo data.");
  console.log("   Sellers: aarav@liverr.test, priya@liverr.test, rohan@liverr.test");
  console.log("   Buyers : buyer@liverr.test, neha@liverr.test");
  console.log(`   Password for all: ${PASSWORD}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
