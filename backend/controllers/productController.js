const Product = require("../models/Product");
const Category = require("../models/Category");

const listProducts = async (req, res, next) => {
  try {
    const { search = "", category_id, page = 1, limit = 12 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const filter = {};
    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { sku: { $regex: escaped, $options: "i" } },
      ];
    }

    if (category_id) filter.category_id = category_id;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category_id", "name slug")
        .sort({ createdAt: -1, name: 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductBySku = async (req, res, next) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku }).populate(
      "category_id",
      "name slug description"
    );

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { sku: req.params.sku },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ sku: req.params.sku });

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
};
