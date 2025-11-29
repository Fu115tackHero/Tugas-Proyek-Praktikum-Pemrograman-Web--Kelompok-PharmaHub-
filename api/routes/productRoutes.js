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

/**
 * POST /api/products
 * Create a new product
 */
router.post("/products", productController.createProduct);

/**
 * PUT /api/products/:id
 * Update a product by ID
 */
router.put("/products/:id", productController.updateProduct);

/**
 * DELETE /api/products/:id
 * Delete a product by ID (soft delete)
 */
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
