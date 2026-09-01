const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [
      {
        address_type: { type: String, enum: ["Billing", "Shipping"] },
        street_address: String,
        city: String,
        state: String,
        postal_code: String,
        country: String,
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("User", userSchema);
