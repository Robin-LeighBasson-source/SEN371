const express = require("express");

const router = express.Router();

// Get all products
router.get("/", (req, res) => {
    res.json({
        message: "Get all products endpoint working"
    });
});

// Get product by ID
router.get("/:id", (req, res) => {
    res.json({
        message: `Get product ${req.params.id} endpoint working`
    });
});

// Create product
router.post("/", (req, res) => {
    res.json({
        message: "Create product endpoint working"
    });
});

// Update product
router.put("/:id", (req, res) => {
    res.json({
        message: `Update product ${req.params.id} endpoint working`
    });
});

// Delete product
router.delete("/:id", (req, res) => {
    res.json({
        message: `Delete product ${req.params.id} endpoint working`
    });
});

module.exports = router;