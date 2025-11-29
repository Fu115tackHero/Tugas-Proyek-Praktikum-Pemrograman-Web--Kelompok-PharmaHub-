const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

/**
 * GET /api/products
 * Retrieve all products from Supabase or fallback
 */
router.get("/products", productController.getAllProducts);

/**
 * GET /api/products/:id
 * Retrieve specific product by ID
 */
router.get("/products/:id", productController.getProductById);

module.exports = router;
