const Wishlist = require("../models/Wishlist");
const httpError = require("../utils/httpError");
const findProductOr404 = require("../utils/findProduct");
const { addProductToCart } = require("./cartController");

const WISHLIST_PRODUCT_FIELDS = "name price_cents images stock_quantity";

// Same one-document-per-shopper rule as the cart: looked up by the id from the
// token, created empty on first use.
const getOrCreateWishlist = (userId) =>
  Wishlist.findOneAndUpdate(
    { user_id: userId },
    { $setOnInsert: { products: [] } },
    { upsert: true, new: true },
  );

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    await wishlist.populate("products", WISHLIST_PRODUCT_FIELDS);

    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      throw httpError("product_id is required", 400);
    }

    const product = await findProductOr404(product_id);

    // $addToSet keeps the request idempotent: saving the same product twice
    // leaves one entry, so the UI never has to check first.
    const wishlist = await Wishlist.findOneAndUpdate(
      { user_id: req.user._id },
      { $addToSet: { products: product._id } },
      { upsert: true, new: true },
    ).populate("products", WISHLIST_PRODUCT_FIELDS);

    res.status(201).json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);

    const isSaved = wishlist.products.some(
      (productId) => productId.toString() === req.params.productId,
    );

    if (!isSaved) {
      throw httpError("That product is not in your wishlist", 404);
    }

    wishlist.products.pull(req.params.productId);
    await wishlist.save();
    await wishlist.populate("products", WISHLIST_PRODUCT_FIELDS);

    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

// The one place the two features touch: a saved product is added to the cart and
// dropped from the wishlist. The cart's own add function is reused so the
// "already in the cart" and stock rules stay in a single place.
const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await getOrCreateWishlist(req.user._id);

    const isSaved = wishlist.products.some(
      (savedId) => savedId.toString() === productId,
    );

    if (!isSaved) {
      throw httpError("That product is not in your wishlist", 404);
    }

    const cart = await addProductToCart(req.user._id, productId, 1);

    wishlist.products.pull(productId);
    await wishlist.save();
    await wishlist.populate("products", WISHLIST_PRODUCT_FIELDS);
    await cart.populate("items.product_id", WISHLIST_PRODUCT_FIELDS);

    res.json({ success: true, wishlist, cart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
};
