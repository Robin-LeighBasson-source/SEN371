const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Payment = require("../models/Payment");

const createOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id }).populate("items.product_id");

    if (!cart || cart.items.length === 0) {
      const error = new Error("Your cart is empty");
      error.statusCode = 400;
      throw error;
    }

    let totalAmountCents = 0;
    const orderItems = cart.items.map((item) => {
      const currentPrice = item.product_id.price_cents;
      totalAmountCents += currentPrice * item.quantity;

      return {
        product_id: item.product_id._id,
        quantity: item.quantity,
        price_at_purchase_cents: currentPrice, 
      };
    });

    const order = await Order.create({
      user_id: req.user._id,
      total_amount_cents: totalAmountCents,
      order_status: "Pending",
      items: orderItems,
      shipping_address_id: req.body.shipping_address_id || null,
    });

    await Cart.findOneAndDelete({ user_id: req.user._id });
    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error); 
  }
};

const processPayment = async (req, res, next) => {
  try {
    const { payment_method } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (order.user_id.toString() !== req.user._id.toString()) {
      const error = new Error("Not authorized to pay for this order");
      error.statusCode = 403;
      throw error;
    }

    const mockTransactionId = `txn_${Math.random().toString(36).substr(2, 9)}`;

    const payment = await Payment.create({
      order_id: order._id,
      transaction_id: mockTransactionId,
      payment_method: payment_method || "Stripe",
      amount_cents: order.total_amount_cents,
      status: "Completed",
    });

    order.order_status = "Paid";
    await order.save();
    res.json({ success: true, payment, order });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user_id: req.user._id }).sort({ created_at: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, processPayment, getUserOrders };