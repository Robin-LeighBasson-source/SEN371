const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    transaction_id: { type: String, required: true },
    payment_method: {
      type: String,
      enum: ["Stripe", "PayPal"],
      required: true,
    },
    amount_cents: { type: Number, required: true },
    status: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at" } },
);

module.exports = mongoose.model("Payment", paymentSchema);
