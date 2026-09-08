const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    // unique: a shopper has exactly one cart, so the database rejects a second
    // one even if two requests race to create it.
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: { updatedAt: "updated_at" } },
);

module.exports = mongoose.model("Cart", cartSchema);
