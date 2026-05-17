const router = require("express").Router();
const c = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
router.get("/conversations", protect, c.getConversations);
router.post("/conversations", protect, c.createOrGetConversation);
router.get("/unread", protect, c.getUnreadCount);
router.get("/:convId", protect, c.getMessages);
router.post("/:convId", protect, c.sendMessage);
module.exports = router;
