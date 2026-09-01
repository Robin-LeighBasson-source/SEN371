// Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price_cents: { type: Number, required: true }, // Integer to prevent rounding errors
  stock_quantity: { type: Number, required: true, default: 0 },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  images: [
    {
      image_url: { type: String, required: true },
      is_primary: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
