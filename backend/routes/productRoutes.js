const express = require("express");
const {
  listProducts,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", listProducts);
router.post("/", createProduct);
router.get("/:sku", getProductBySku);
router.put("/:sku", updateProduct);
router.delete("/:sku", deleteProduct);

module.exports = router;
