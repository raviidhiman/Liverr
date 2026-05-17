const router = require("express").Router();
const c = require("../controllers/userController");
const { protect } = require("../middleware/auth");
router.get("/:id", c.getProfile);
router.put("/profile/update", protect, c.updateProfile);
module.exports = router;
