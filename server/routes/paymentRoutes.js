const router = require("express").Router();
const c = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
router.post("/create-order", protect, c.createRazorpayOrder);
router.post("/verify", protect, c.verifyPayment);
router.get("/history", protect, c.getPaymentHistory);
module.exports = router;
