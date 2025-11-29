const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

/**
 * Create a new product with details in a transaction
 * @param {Object} data - Combined payload of product + details
 */
async function createProduct(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      // basic
      name,
      price,
      stock,
      description,
      image_url,
      category_id,
      // details
      generic_name,
      uses,
      ingredients,
      side_effects,
      dosage,
      storage,
      warnings,
    } = data;

    const insertProductQuery = `
      INSERT INTO products (name, price, stock, description, image_url, category_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING product_id, name, price, stock, description, image_url, category_id, created_at;
    `;
    const productValues = [
      name,
      price,
      stock,
      description || null,
      image_url || null,
      category_id,
    ];
    const productResult = await client.query(insertProductQuery, productValues);
    const product = productResult.rows[0];

    const insertDetailsQuery = `
      INSERT INTO product_details (
        product_id, generic_name, uses, ingredients, side_effects, dosage, storage, warnings
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING product_id;
    `;

    // Ensure arrays map to Postgres text[]; pg will handle JS arrays to array if column is text[]
    const detailValues = [
      product.product_id,
      generic_name || null,
      uses || null,
      ingredients || null,
      side_effects || null,
      dosage || null,
      storage || null,
      warnings || null,
    ];
    await client.query(insertDetailsQuery, detailValues);

    await client.query("COMMIT");
    return product;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Get all products with category name */
async function getAllProducts() {
  const query = `
    SELECT p.*, c.category_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.category_id
    ORDER BY p.created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

/** Get full product by id including category and details */
async function getProductById(id) {
  const query = `
    SELECT 
      p.product_id,
      p.name,
      p.price,
      p.stock,
      p.description,
      p.image_url,
      p.category_id,
      p.created_at,
      c.category_name,
      d.generic_name,
      d.uses,
      d.ingredients,
      d.side_effects,
      d.dosage,
      d.storage,
      d.warnings
    FROM products p
    JOIN product_categories c ON p.category_id = c.category_id
    LEFT JOIN product_details d ON p.product_id = d.product_id
    WHERE p.product_id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
