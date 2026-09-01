// Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_amount_cents: { type: Number, required: true },
    order_status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Cancelled"],
      default: "Pending",
    },
    shipping_address_id: { type: mongoose.Schema.Types.ObjectId }, // Can map to a specific embedded address ID from User
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price_at_purchase_cents: { type: Number, required: true }, // Price snapshot
      },
    ],
  },
  { timestamps: { createdAt: "created_at" } },
);

module.exports = mongoose.model("Order", orderSchema);
