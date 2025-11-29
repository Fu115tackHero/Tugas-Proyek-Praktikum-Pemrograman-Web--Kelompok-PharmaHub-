const categoryService = require("../services/categoryService");

/**
 * Get all categories
 */
async function getAllCategories(req, res) {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("❌ Error fetching categories:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
}

/**
 * Get category by ID
 */
async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("❌ Error fetching category:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch category" });
  }
}

/**
 * Create new category
 */
async function createCategory(req, res) {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const newCategory = await categoryService.createCategory({
      category_name,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("❌ Error creating category:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
}

/**
 * Update category
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { category_name, description, is_active } = req.body;

    const updatedCategory = await categoryService.updateCategory(id, {
      category_name,
      description,
      is_active,
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("❌ Error updating category:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
}

/**
 * Delete category (soft delete)
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const deletedCategory = await categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("❌ Error deleting category:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
