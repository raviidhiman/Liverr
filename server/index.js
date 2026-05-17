require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/gigs",     require("./routes/gigRoutes"));
app.use("/api/orders",   require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reviews",  require("./routes/reviewRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.get("/", (_, res) => res.json({ status: "FreelanceHub API running 🚀" }));