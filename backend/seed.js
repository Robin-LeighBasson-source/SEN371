require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

// Generate a valid MongoDB ObjectId to satisfy the category_id requirement
const dummyCategoryId = new mongoose.Types.ObjectId();

const dummyProducts = [
  {
    name: "Wireless Mechanical Keyboard",
    description: "Compact 75% layout with tactile switches and RGB backlighting.",
    price_cents: 129999,
    stock: 15,
    sku: "PERIPH-KEY-001",
    category_id: dummyCategoryId,
    image_url: "https://via.placeholder.com/400"
  },
  {
    name: "Ergonomic Vertical Mouse",
    description: "Reduces wrist strain during long coding sessions.",
    price_cents: 64950,
    stock: 30,
    sku: "PERIPH-MOU-002",
    category_id: dummyCategoryId,
    image_url: "https://via.placeholder.com/400"
  },
  {
    name: "27-inch 4K USB-C Monitor",
    description: "Crisp display with built-in hub for single-cable desk setups.",
    price_cents: 450000,
    stock: 8,
    sku: "MON-4K-003",
    category_id: dummyCategoryId,
    image_url: "https://via.placeholder.com/400"
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Over-ear headphones with active noise cancellation and 30hr battery.",
    price_cents: 210000,
    stock: 12,
    sku: "AUD-ANC-004",
    category_id: dummyCategoryId,
    image_url: "https://via.placeholder.com/400"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    await Product.insertMany(dummyProducts);
    console.log("Database successfully seeded with dummy products!");

    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();