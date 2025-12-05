const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Use centralized database configuration
const pool = require("../config/database");

/**
 * Get all categories
 */
async function getAllCategories() {
  const query = `
    SELECT 
      category_id,
      category_name,
      description,
      is_active,
      created_at
    FROM product_categories
    WHERE is_active = true
    ORDER BY category_name ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

/**
 * Get category by ID
 */
async function getCategoryById(id) {
  const query = `
    SELECT 
      category_id,
      category_name,
      description,
      is_active,
      created_at
    FROM product_categories
    WHERE category_id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

/**
 * Create new category
 */
async function createCategory(data) {
  const { category_name, description } = data;

  // Check if category already exists
  const existingQuery = `
    SELECT category_id FROM product_categories 
    WHERE LOWER(category_name) = LOWER($1)
  `;
  const existing = await pool.query(existingQuery, [category_name]);

  if (existing.rows.length > 0) {
    throw new Error(`Kategori "${category_name}" sudah ada`);
  }

  const insertQuery = `
    INSERT INTO product_categories (category_name, description, is_active)
    VALUES ($1, $2, $3)
    RETURNING category_id, category_name, description, is_active, created_at
  `;

  const { rows } = await pool.query(insertQuery, [
    category_name,
    description || `Kategori untuk ${category_name.toLowerCase()}`,
    true,
  ]);

  return rows[0];
}

/**
 * Update category
 */
async function updateCategory(id, data) {
  const { category_name, description, is_active } = data;

  const updateQuery = `
    UPDATE product_categories
    SET 
      category_name = COALESCE($1, category_name),
      description = COALESCE($2, description),
      is_active = COALESCE($3, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE category_id = $4
    RETURNING category_id, category_name, description, is_active, created_at, updated_at
  `;

  const { rows } = await pool.query(updateQuery, [
    category_name,
    description,
    is_active,
    id,
  ]);

  if (rows.length === 0) {
    throw new Error("Kategori tidak ditemukan");
  }

  return rows[0];
}

/**
 * Delete category (soft delete)
 */
async function deleteCategory(id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if category has child categories
    const childCheck = await client.query(
      `SELECT COUNT(*) as count FROM product_categories 
       WHERE parent_category_id = $1 AND is_active = true`,
      [id]
    );
    
    if (parseInt(childCheck.rows[0].count) > 0) {
      throw new Error(
        `Kategori tidak dapat dihapus karena memiliki ${childCheck.rows[0].count} sub-kategori aktif. Hapus atau pindahkan sub-kategori terlebih dahulu.`
      );
    }

    // Check if category is used by any active product
    const productCheck = await client.query(
      `SELECT COUNT(*) as count FROM products 
       WHERE category_id = $1 AND is_available = true`,
      [id]
    );

    if (parseInt(productCheck.rows[0].count) > 0) {
      throw new Error(
        `Kategori tidak dapat dihapus karena sedang digunakan oleh ${productCheck.rows[0].count} produk aktif. Pindahkan atau nonaktifkan produk terlebih dahulu.`
      );
    }

    // Soft delete the category
    const deleteQuery = `
      UPDATE product_categories
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE category_id = $1
      RETURNING category_id, category_name
    `;

    const { rows } = await client.query(deleteQuery, [id]);

    if (rows.length === 0) {
      throw new Error("Kategori tidak ditemukan");
    }

    await client.query("COMMIT");
    console.log(`✅ Category ${rows[0].category_name} (ID: ${id}) soft deleted successfully`);
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
