const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

// GET /api/categories - Get all categories (PUBLIC)
router.get("/categories", categoryController.getAllCategories);

// GET /api/categories/:id - Get category by ID (PUBLIC)
router.get("/categories/:id", categoryController.getCategoryById);

// POST /api/categories - Create new category (ADMIN ONLY)
router.post("/categories", authMiddleware, requireAdmin, categoryController.createCategory);

// PUT /api/categories/:id - Update category (ADMIN ONLY)
router.put("/categories/:id", authMiddleware, requireAdmin, categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category (ADMIN ONLY)
router.delete("/categories/:id", authMiddleware, requireAdmin, categoryController.deleteCategory);

module.exports = router;
