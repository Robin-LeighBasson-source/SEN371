const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
} = require("../controllers/wishlistController");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getWishlist)
  .post(addToWishlist);

router.delete("/items/:productId", removeFromWishlist);
router.post("/items/:productId/move-to-cart", moveToCart);

module.exports = router;
