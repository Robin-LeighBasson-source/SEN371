const express = require("express");

const router = express.Router();

// Get all orders
router.get("/", (req, res) => {
    res.json({
        message: "Get all orders endpoint working"
    });
});

// Get order by ID
router.get("/:id", (req, res) => {
    res.json({
        message: `Get order ${req.params.id} endpoint working`
    });
});

// Create order
router.post("/", (req, res) => {
    res.json({
        message: "Create order endpoint working"
    });
});

// Update order
router.put("/:id", (req, res) => {
    res.json({
        message: `Update order ${req.params.id} endpoint working`
    });
});

// Delete order
router.delete("/:id", (req, res) => {
    res.json({
        message: `Delete order ${req.params.id} endpoint working`
    });
});

module.exports = router;