require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");

// Categories are looked up by slug so the script can be re-run without
// creating duplicates.
const categories = [
  {
    name: "Peripherals",
    slug: "peripherals",
    description: "Keyboards, mice and other desk accessories.",
  },
  {
    name: "Monitors",
    slug: "monitors",
    description: "Displays for work and play.",
  },
  {
    name: "Audio",
    slug: "audio",
    description: "Headphones and speakers.",
  },
];

// `category` is the slug of one of the categories above; it is swapped for the
// real ObjectId once the categories exist.
const products = [
  {
    sku: "PERIPH-KEY-001",
    name: "Wireless Mechanical Keyboard",
    description: "Compact 75% layout with tactile switches and RGB backlighting.",
    price_cents: 129999,
    stock_quantity: 15,
    category: "peripherals",
    images: [
      { image_url: "https://picsum.photos/seed/keyboard/600", is_primary: true },
    ],
  },
  {
    sku: "PERIPH-MOU-002",
    name: "Ergonomic Vertical Mouse",
    description: "Reduces wrist strain during long coding sessions.",
    price_cents: 64950,
    stock_quantity: 30,
    category: "peripherals",
    images: [
      { image_url: "https://picsum.photos/seed/mouse/600", is_primary: true },
    ],
  },
  {
    sku: "MON-4K-003",
    name: "27-inch 4K USB-C Monitor",
    description: "Crisp display with built-in hub for single-cable desk setups.",
    price_cents: 450000,
    stock_quantity: 8,
    category: "monitors",
    images: [
      { image_url: "https://picsum.photos/seed/monitor/600", is_primary: true },
      { image_url: "https://picsum.photos/seed/monitor-back/600" },
    ],
  },
  {
    sku: "AUD-ANC-004",
    name: "Noise Cancelling Headphones",
    description: "Over-ear headphones with active noise cancellation and 30hr battery.",
    price_cents: 210000,
    stock_quantity: 12,
    category: "audio",
    images: [
      { image_url: "https://picsum.photos/seed/headphones/600", is_primary: true },
    ],
  },
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set - create backend/.env first");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    // Upsert categories and remember their ids by slug.
    const categoryIds = {};
    for (const category of categories) {
      const doc = await Category.findOneAndUpdate(
        { slug: category.slug },
        category,
        { new: true, upsert: true, runValidators: true }
      );
      categoryIds[category.slug] = doc._id;
    }
    console.log(`Upserted ${categories.length} categories`);

    // Upsert products by SKU so running the script twice just refreshes them.
    for (const { category, ...product } of products) {
      await Product.findOneAndUpdate(
        { sku: product.sku },
        { ...product, category_id: categoryIds[category] },
        { upsert: true, runValidators: true }
      );
    }
    console.log(`Upserted ${products.length} products`);

    console.log("Database successfully seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
