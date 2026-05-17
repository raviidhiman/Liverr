const router = require("express").Router();
const c = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
router.post("/", protect, c.createOrder);
router.get("/buyer", protect, c.getBuyerOrders);
router.get("/seller", protect, c.getSellerOrders);
router.put("/:id/status", protect, c.updateOrderStatus);
module.exports = router;
