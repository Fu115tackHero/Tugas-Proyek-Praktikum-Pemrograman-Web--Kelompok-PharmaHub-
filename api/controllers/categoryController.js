/**
 * Category Controller
 * Handle semua business logic untuk categories
 */

const { query } = require("../config/database");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT 
      category_id,
      category_name,
      description,
      is_active
    FROM product_categories
    WHERE is_active = true
    ORDER BY category_name ASC
  `);

  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows.map((row) => ({
      id: row.category_id,
      name: row.category_name,
      description: row.description,
      isActive: row.is_active,
    })),
  });
});

module.exports = {
  getAllCategories,
};
