const router = require("express").Router();
const c = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");
router.post("/", protect, c.createReview);
router.get("/gig/:gigId", c.getGigReviews);
module.exports = router;
