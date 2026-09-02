const express = require("express");
const { register } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

router.post("/login", (req, res) => {
  res.json({
    message: "Login endpoint working",
  });
});

module.exports = router;
