const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

/**
 * GET /api/products
 * Retrieve all products from Supabase or fallback
 * PUBLIC - No authentication required
 */
router.get("/products", productController.getAllProducts);

/**
 * GET /api/products/deleted
 * Get all deleted/archived products
 * PROTECTED - Admin only
 * NOTE: This must come BEFORE /:id route to avoid matching "deleted" as an ID
 */
router.get("/products/deleted", authMiddleware, requireAdmin, productController.getDeletedProducts);

/**
 * GET /api/products/:id
 * Retrieve specific product by ID
 * PUBLIC - No authentication required
 */
router.get("/products/:id", productController.getProductById);

/**
 * POST /api/products
 * Create a new product
 * PROTECTED - Admin only
 */
router.post("/products", authMiddleware, requireAdmin, productController.createProduct);

/**
 * PUT /api/products/:id
 * Update a product by ID
 * PROTECTED - Admin only
 */
router.put("/products/:id", authMiddleware, requireAdmin, productController.updateProduct);

/**
 * DELETE /api/products/:id
 * Delete a product by ID (soft delete)
 * PROTECTED - Admin only
 */
router.delete("/products/:id", authMiddleware, requireAdmin, productController.deleteProduct);

/**
 * POST /api/products/:id/restore
 * Restore a deleted product
 * PROTECTED - Admin only
 */
router.post("/products/:id/restore", authMiddleware, requireAdmin, productController.restoreProduct);

module.exports = router;
