const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createOrder, processPayment, getUserOrders } = require("../controllers/orderController");

const router = express.Router();

// Apply the protect middleware to all order routes automatically[cite: 5]
router.use(protect); 

// Create a new order and get user's order history
router.route("/")
  .post(createOrder)
  .get(getUserOrders);

// Process payment for a specific order
router.post("/:id/pay", processPayment);

module.exports = router;