const express = require("express");

const router = express.Router();

// Get all users
router.get("/", (req, res) => {
    res.json({
        message: "Get all users endpoint working"
    });
});

// Get user by ID
router.get("/:id", (req, res) => {
    res.json({
        message: `Get user ${req.params.id} endpoint working`
    });
});

// Update user
router.put("/:id", (req, res) => {
    res.json({
        message: `Update user ${req.params.id} endpoint working`
    });
});

// Delete user
router.delete("/:id", (req, res) => {
    res.json({
        message: `Delete user ${req.params.id} endpoint working`
    });
});

module.exports = router;