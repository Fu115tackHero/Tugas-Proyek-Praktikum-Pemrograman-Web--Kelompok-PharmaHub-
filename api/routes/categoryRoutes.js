const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// GET /api/categories - Get all categories
router.get("/categories", categoryController.getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get("/categories/:id", categoryController.getCategoryById);

// POST /api/categories - Create new category (admin only)
router.post("/categories", categoryController.createCategory);

// PUT /api/categories/:id - Update category (admin only)
router.put("/categories/:id", categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category (admin only)
router.delete("/categories/:id", categoryController.deleteCategory);

module.exports = router;
