/**
 * Product Routes
 * Definisi semua endpoint untuk products
 */

const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  getProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  validateProduct,
  validateImage,
  validateId,
} = require("../middleware/validation");
const { adminOnly } = require("../middleware/auth");
const { uploadSingleImage, handleImageUpload } = require("../middleware/imageUpload");

// Public routes
router.get("/", getAllProducts);
router.get("/:id/image", validateId, getProductImage);
router.get("/:id", validateId, getProduct);

// Admin-only routes
router.post(
  "/",
  adminOnly,
  uploadSingleImage,
  handleImageUpload,
  validateProduct,
  createProduct
);
router.put(
  "/:id",
  adminOnly,
  validateId,
  uploadSingleImage,
  handleImageUpload,
  validateProduct,
  updateProduct
);
router.delete("/:id", adminOnly, validateId, deleteProduct);

module.exports = router;
