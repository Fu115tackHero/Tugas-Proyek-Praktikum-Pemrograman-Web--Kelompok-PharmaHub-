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
 * Create a new product
 * @param {Object} data - Product data
 */
async function createProduct(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      name,
      brand,
      price,
      stock,
      description,
      category_id,
      prescription_required,
      min_stock,
      main_image_url,
      // Product details
      generic_name,
      uses,
      how_it_works,
      ingredients,
      side_effects,
      precaution,
      interactions,
      indication,
    } = data;

    // Insert into products table
    const insertProductQuery = `
      INSERT INTO products (name, brand, price, stock, description, category_id, prescription_required, min_stock, main_image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING product_id, name, brand, price, stock, description, category_id, prescription_required, main_image_url, created_at;
    `;
    const productValues = [
      name,
      brand || null,
      price,
      stock || 0,
      description || null,
      category_id,
      prescription_required || false,
      min_stock || 10,
      main_image_url || null,
    ];
    const productResult = await client.query(insertProductQuery, productValues);
    const product = productResult.rows[0];

    // Insert into product_details table if any detail is provided
    if (generic_name || uses || how_it_works || ingredients || side_effects || precaution || interactions || indication) {
      const insertDetailsQuery = `
        INSERT INTO product_details (
          product_id,
          generic_name,
          uses,
          how_it_works,
          ingredients,
          side_effects,
          precaution,
          interactions,
          indication
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING detail_id;
      `;
      
      await client.query(insertDetailsQuery, [
        product.product_id,
        generic_name || null,
        uses || null,
        how_it_works || null,
        ingredients || [],
        side_effects || [],
        precaution || [],
        interactions || [],
        indication || [],
      ]);
    }

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
    SELECT 
      p.product_id,
      p.name,
      p.brand,
      p.price,
      p.stock,
      p.min_stock,
      p.description,
      p.prescription_required,
      p.is_active,
      p.featured,
      p.view_count,
      p.sold_count,
      p.main_image_url,
      p.created_at,
      p.category_id,
      c.category_name,
      pd.generic_name,
      pd.uses,
      pd.how_it_works,
      pd.ingredients,
      pd.side_effects,
      pd.precaution,
      pd.interactions,
      pd.indication
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.category_id
    LEFT JOIN product_details pd ON p.product_id = pd.product_id
    WHERE p.is_active = true
    ORDER BY p.created_at DESC
  `;
  const { rows } = await pool.query(query);
  
  // Map main_image_url to image for frontend compatibility
  return rows.map(row => ({
    ...row,
    id: row.product_id, // Also add 'id' field for frontend
    image: row.main_image_url,
    prescriptionRequired: row.prescription_required,
    // Map detail fields to match formData field names
    genericName: row.generic_name,
    sideEffects: row.side_effects,
    howItWorks: row.how_it_works
  }));
}

/** Get full product by id including category */
async function getProductById(id) {
  const query = `
    SELECT 
      p.product_id,
      p.name,
      p.brand,
      p.price,
      p.stock,
      p.min_stock,
      p.description,
      p.prescription_required,
      p.is_active,
      p.featured,
      p.view_count,
      p.sold_count,
      p.category_id,
      p.main_image_url,
      p.created_at,
      c.category_name,
      pd.generic_name,
      pd.uses,
      pd.how_it_works,
      pd.ingredients,
      pd.side_effects,
      pd.precaution,
      pd.interactions,
      pd.indication
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.category_id
    LEFT JOIN product_details pd ON p.product_id = pd.product_id
    WHERE p.product_id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [id]);
  const product = rows[0] || null;
  
  // Map fields for frontend compatibility
  if (product) {
    return {
      ...product,
      id: product.product_id,
      image: product.main_image_url,
      prescriptionRequired: product.prescription_required,
      // Map detail fields to match formData field names
      genericName: product.generic_name,
      sideEffects: product.side_effects,
      howItWorks: product.how_it_works
    };
  }
  
  return null;
}

/** Update product */
async function updateProduct(id, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      name,
      brand,
      price,
      stock,
      description,
      category_id,
      prescription_required,
      min_stock,
      is_active,
      featured,
      main_image_url,
      // Product details
      generic_name,
      uses,
      how_it_works,
      ingredients,
      side_effects,
      precaution,
      interactions,
      indication,
    } = data;

    // Update products table
    const updateQuery = `
      UPDATE products
      SET 
        name = COALESCE($1, name),
        brand = COALESCE($2, brand),
        price = COALESCE($3, price),
        stock = COALESCE($4, stock),
        description = COALESCE($5, description),
        category_id = COALESCE($6, category_id),
        prescription_required = COALESCE($7, prescription_required),
        min_stock = COALESCE($8, min_stock),
        is_active = COALESCE($9, is_active),
        featured = COALESCE($10, featured),
        main_image_url = COALESCE($11, main_image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $12
      RETURNING *;
    `;

    const values = [
      name,
      brand,
      price,
      stock,
      description,
      category_id,
      prescription_required,
      min_stock,
      is_active,
      featured,
      main_image_url,
      id,
    ];

    const result = await client.query(updateQuery, values);
    const updatedProduct = result.rows[0] || null;

    // Update or insert product_details if any detail field is provided
    if (updatedProduct && (generic_name !== undefined || uses !== undefined || 
        how_it_works !== undefined || ingredients !== undefined || 
        side_effects !== undefined || precaution !== undefined || 
        interactions !== undefined || indication !== undefined)) {
      
      // Check if details exist
      const checkDetailsQuery = `SELECT detail_id FROM product_details WHERE product_id = $1;`;
      const detailsCheck = await client.query(checkDetailsQuery, [id]);

      if (detailsCheck.rows.length > 0) {
        // Update existing details
        const updateDetailsQuery = `
          UPDATE product_details
          SET
            generic_name = COALESCE($1, generic_name),
            uses = COALESCE($2, uses),
            how_it_works = COALESCE($3, how_it_works),
            ingredients = COALESCE($4, ingredients),
            side_effects = COALESCE($5, side_effects),
            precaution = COALESCE($6, precaution),
            interactions = COALESCE($7, interactions),
            indication = COALESCE($8, indication),
            updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $9;
        `;

        await client.query(updateDetailsQuery, [
          generic_name,
          uses,
          how_it_works,
          ingredients,
          side_effects,
          precaution,
          interactions,
          indication,
          id,
        ]);
      } else {
        // Insert new details
        const insertDetailsQuery = `
          INSERT INTO product_details (
            product_id,
            generic_name,
            uses,
            how_it_works,
            ingredients,
            side_effects,
            precaution,
            interactions,
            indication
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `;

        await client.query(insertDetailsQuery, [
          id,
          generic_name || null,
          uses || null,
          how_it_works || null,
          ingredients || [],
          side_effects || [],
          precaution || [],
          interactions || [],
          indication || [],
        ]);
      }
    }

    await client.query("COMMIT");
    return updatedProduct;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Delete product (hard delete) */
async function deleteProduct(id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Delete from product_details first (if exists)
    await client.query(
      `DELETE FROM product_details WHERE product_id = $1`,
      [id]
    );

    // Delete from products
    const query = `
      DELETE FROM products
      WHERE product_id = $1
      RETURNING product_id;
    `;
    const { rows } = await client.query(query, [id]);

    await client.query("COMMIT");
    return rows[0] || null;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
