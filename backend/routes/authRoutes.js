const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

// Builds the signed token a client sends back on protected requests.
const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

// The user shape we are willing to send back - never includes password_hash.
const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  role: user.role,
});

// Register a new user
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      const error = new Error(
        "email, password, first_name and last_name are required",
      );
      error.statusCode = 400;
      return next(error);
    }

    const existing = await User.findOne({ email });

    if (existing) {
      const error = new Error("An account with that email already exists");
      error.statusCode = 409;
      return next(error);
    }

    const user = await User.create({
      email,
      password_hash: await bcrypt.hash(password, SALT_ROUNDS),
      first_name,
      last_name,
    });

    res.status(201).json({
      success: true,
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// Log in an existing user
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("email and password are required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email });

    // Same message for an unknown email and a bad password, so the response
    // cannot be used to work out which accounts exist.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    res.json({
      success: true,
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// Return the user belonging to the token in the Authorization header
router.get("/me", async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      const error = new Error("Not authorised, no token provided");
      error.statusCode = 401;
      return next(error);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      const error = new Error("Not authorised, user no longer exists");
      error.statusCode = 401;
      return next(error);
    }

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    // jwt throws on an expired or tampered token - report that as a 401
    // rather than letting it fall through as a 500.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "Not authorised, token is invalid or has expired";
    }
    next(error);
  }
});

// Log out - with stateless JWTs the client just discards its token.
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

module.exports = router;
