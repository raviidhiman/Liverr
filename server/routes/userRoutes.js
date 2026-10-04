const router = require("express").Router();
const c = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// Specific routes first, "/:id" last
router.get("/me/stats", protect, c.getStats);
router.get("/favorites/list", protect, c.getFavorites);
router.post("/favorites/:gigId", protect, c.toggleFavorite);
router.put("/profile/update", protect, c.updateProfile);
router.put("/become-seller", protect, c.becomeSeller);
router.get("/:id", c.getProfile);
module.exports = router;
