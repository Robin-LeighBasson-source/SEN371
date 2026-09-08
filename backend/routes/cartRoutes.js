const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const router = express.Router();

// A cart always belongs to one shopper, so every route here needs a token.
router.use(protect);

router.route("/")
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

// Line items are addressed by their product id, because that is the id the
// frontend already has after rendering the cart.
router.route("/items/:productId")
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
