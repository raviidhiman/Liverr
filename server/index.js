require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();
app.set("trust proxy", 1); // needed behind Render / Vercel proxies (rate limiting, IPs)

app.use(helmet());

// CLIENT_URL can be a comma separated list, e.g. https://liverr.vercel.app,http://localhost:5173
const allowed = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "4mb" })); // images are sent as small base64 data URLs
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);

app.get("/", (_, res) => res.json({ name: "Liverr API", status: "running" }));
app.get("/api/health", (_, res) => res.json({ success: true, status: "ok" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/gigs", require("./routes/gigRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

app.use("/api", (req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: status === 500 && process.env.NODE_ENV === "production" ? "Server error" : err.message });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Liverr API running on port ${PORT}`));
});
