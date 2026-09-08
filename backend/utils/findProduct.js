const mongoose = require("mongoose");
const Product = require("../models/Product");
const httpError = require("./httpError");

// Looks a product up before it is stored as a reference in a cart or wishlist.
// Both features only ever save a product's _id, so an id that does not exist
// would sit there unnoticed until checkout, where createOrder reads
// `price_cents` off the populated product and would crash on null.
const findProductOr404 = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw httpError("Invalid product id", 400);
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw httpError("Product not found", 404);
  }

  return product;
};

module.exports = findProductOr404;
