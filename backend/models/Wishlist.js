const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  // unique: one wishlist per shopper, same rule as the cart.
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
