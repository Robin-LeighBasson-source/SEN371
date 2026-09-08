const Cart = require("../models/Cart");
const Product = require("../models/Product");
const httpError = require("../utils/httpError");
const findProductOr404 = require("../utils/findProduct");

// The product fields the cart page needs to draw a line item. The cart itself
// stores only a reference, so these values are always read fresh from the
// products collection instead of being copied into the cart.
const CART_PRODUCT_FIELDS = "name price_cents images stock_quantity";

// A shopper has exactly one cart, found by the user id the auth middleware
// decoded from the token - never by an id sent in the request body. `upsert`
// means a first-time shopper gets an empty cart back instead of a 404, so the
// frontend never has to "create" a cart before using it.
const getOrCreateCart = (userId) =>
  Cart.findOneAndUpdate(
    { user_id: userId },
    { $setOnInsert: { items: [] } },
    { upsert: true, new: true },
  );

// Quantities are whole numbers of at least 1. Removing an item is its own
// endpoint, so a quantity of 0 is rejected rather than silently deleting a line.
const parseQuantity = (value) => {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw httpError("quantity must be a whole number of 1 or more", 400);
  }

  return quantity;
};

const assertInStock = (product, quantity) => {
  if (quantity > product.stock_quantity) {
    throw httpError(
      `Only ${product.stock_quantity} of "${product.name}" left in stock`,
      400,
    );
  }
};

// Exported as well as used locally, so the wishlist's "move to cart" action
// reuses this exact rule instead of writing its own copy of it.
const addProductToCart = async (userId, productId, quantity) => {
  const product = await findProductOr404(productId);
  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find(
    (item) => item.product_id.toString() === product._id.toString(),
  );

  // Adding a product that is already in the cart tops up its quantity instead of
  // creating a second line for the same product.
  const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
  assertInStock(product, newQuantity);

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({ product_id: product._id, quantity });
  }

  await cart.save();
  return cart;
};

const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate("items.product_id", CART_PRODUCT_FIELDS);

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      throw httpError("product_id is required", 400);
    }

    const quantity = parseQuantity(req.body.quantity ?? 1);
    const cart = await addProductToCart(req.user._id, product_id, quantity);
    await cart.populate("items.product_id", CART_PRODUCT_FIELDS);

    res.status(201).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const quantity = parseQuantity(req.body.quantity);
    const cart = await getOrCreateCart(req.user._id);

    const item = cart.items.find(
      (cartItem) => cartItem.product_id.toString() === req.params.productId,
    );

    if (!item) {
      throw httpError("That product is not in your cart", 404);
    }

    // The quantity is set outright here rather than added to, because this is
    // what the cart page's quantity box means.
    assertInStock(await Product.findById(item.product_id), quantity);
    item.quantity = quantity;

    await cart.save();
    await cart.populate("items.product_id", CART_PRODUCT_FIELDS);

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);

    const item = cart.items.find(
      (cartItem) => cartItem.product_id.toString() === req.params.productId,
    );

    if (!item) {
      throw httpError("That product is not in your cart", 404);
    }

    cart.items.pull(item._id);
    await cart.save();
    await cart.populate("items.product_id", CART_PRODUCT_FIELDS);

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// Empties the cart but keeps the cart document itself, so the shopper keeps
// using the same cart afterwards.
const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addProductToCart,
};
