const categoryService = require("../services/categoryService");

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

module.exports = {
  getAllCategories,
};
