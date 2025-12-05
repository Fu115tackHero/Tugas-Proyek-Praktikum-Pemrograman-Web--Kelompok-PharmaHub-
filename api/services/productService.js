const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Use centralized database configuration
const pool = require("../config/database");

/**
 * Helper: Insert array items into normalized child tables
 */
async function insertDetailArrays(client, detail_id, arrays) {
  const { ingredients, important_info, side_effects, precaution, interactions, indication } = arrays;

  // Helper to deduplicate array items (case-insensitive)
  const deduplicateArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    return arr.filter(item => {
      const normalized = String(item).trim().toLowerCase();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  };

  // Insert ingredients (deduplicated)
  if (Array.isArray(ingredients) && ingredients.length > 0) {
    const uniqueIngredients = deduplicateArray(ingredients);
    for (let i = 0; i < uniqueIngredients.length; i++) {
      await client.query(
        `INSERT INTO product_ingredients (detail_id, ingredient, display_order) VALUES ($1, $2, $3)
         ON CONFLICT (detail_id, ingredient) DO NOTHING`,
        [detail_id, uniqueIngredients[i].trim(), i]
      );
    }
  }

  // Insert important_info (deduplicated)
  if (Array.isArray(important_info) && important_info.length > 0) {
    const uniqueInfo = deduplicateArray(important_info);
    console.log("🔍 Inserting important_info:", {
      original: important_info,
      unique: uniqueInfo,
      originalLength: important_info.length,
      uniqueLength: uniqueInfo.length
    });
    for (let i = 0; i < uniqueInfo.length; i++) {
      console.log(`  📌 Inserting item ${i + 1}/${uniqueInfo.length}:`, uniqueInfo[i]);
      const result = await client.query(
        `INSERT INTO product_important_info (detail_id, info_text, display_order) 
         VALUES ($1, $2, $3) 
         ON CONFLICT DO NOTHING
         RETURNING info_id`,
        [detail_id, uniqueInfo[i].trim(), i]
      );
      if (result.rows.length > 0) {
        console.log(`  ✅ Inserted with info_id:`, result.rows[0].info_id);
      } else {
        console.log(`  ⚠️  Duplicate skipped:`, uniqueInfo[i]);
      }
    }
  }

  // Insert side_effects (deduplicated)
  if (Array.isArray(side_effects) && side_effects.length > 0) {
    const uniqueSideEffects = deduplicateArray(side_effects);
    for (let i = 0; i < uniqueSideEffects.length; i++) {
      await client.query(
        `INSERT INTO product_side_effects (detail_id, side_effect_text, display_order) 
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [detail_id, uniqueSideEffects[i].trim(), i]
      );
    }
  }

  // Insert precautions (deduplicated)
  if (Array.isArray(precaution) && precaution.length > 0) {
    const uniquePrecautions = deduplicateArray(precaution);
    for (let i = 0; i < uniquePrecautions.length; i++) {
      await client.query(
        `INSERT INTO product_precautions (detail_id, precaution_text, display_order) 
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [detail_id, uniquePrecautions[i].trim(), i]
      );
    }
  }

  // Insert interactions (deduplicated)
  if (Array.isArray(interactions) && interactions.length > 0) {
    const uniqueInteractions = deduplicateArray(interactions);
    for (let i = 0; i < uniqueInteractions.length; i++) {
      await client.query(
        `INSERT INTO product_interactions (detail_id, interaction_text, display_order) 
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [detail_id, uniqueInteractions[i].trim(), i]
      );
    }
  }

  // Insert indications (deduplicated)
  if (Array.isArray(indication) && indication.length > 0) {
    const uniqueIndications = deduplicateArray(indication);
    for (let i = 0; i < uniqueIndications.length; i++) {
      await client.query(
        `INSERT INTO product_indications (detail_id, indication_text, display_order) 
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [detail_id, uniqueIndications[i].trim(), i]
      );
    }
  }
}

/**
 * Helper: Delete all detail arrays for a product
 */
async function deleteDetailArrays(client, detail_id) {
  await client.query(`DELETE FROM product_ingredients WHERE detail_id = $1`, [detail_id]);
  await client.query(`DELETE FROM product_important_info WHERE detail_id = $1`, [detail_id]);
  await client.query(`DELETE FROM product_side_effects WHERE detail_id = $1`, [detail_id]);
  await client.query(`DELETE FROM product_precautions WHERE detail_id = $1`, [detail_id]);
  await client.query(`DELETE FROM product_interactions WHERE detail_id = $1`, [detail_id]);
  await client.query(`DELETE FROM product_indications WHERE detail_id = $1`, [detail_id]);
}

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
      main_image_url, // This will be used to create product_images entry
      // Product details
      generic_name,
      uses,
      how_it_works,
      ingredients,
      important_info,
      side_effects,
      precaution,
      interactions,
      indication,
    } = data;

    // Validation
    if (!name || name.trim() === "") {
      throw new Error("Product name is required");
    }
    if (typeof price !== "number" || price <= 0) {
      throw new Error("Price must be a positive number");
    }
    if (typeof stock !== "number" || stock < 0) {
      throw new Error("Stock must be a non-negative number");
    }
    if (!category_id) {
      throw new Error("Category is required");
    }

    // Check for duplicate product name (case-insensitive)
    const duplicateCheck = await client.query(
      `SELECT product_id, name FROM products WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name.trim()]
    );
    
    if (duplicateCheck.rows.length > 0) {
      throw new Error("Product with this name already exists");
    }

    // Insert into products table (WITHOUT main_image_url column)
    const insertProductQuery = `
      INSERT INTO products (name, brand, price, stock, description, category_id, prescription_required, min_stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING product_id, name, brand, price, stock, description, category_id, prescription_required, created_at;
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
    ];
    const productResult = await client.query(insertProductQuery, productValues);
    const product = productResult.rows[0];

    // Insert main image to product_images table if provided
    if (main_image_url) {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, image_order) VALUES ($1, $2, $3, $4)`,
        [product.product_id, main_image_url, true, 0]
      );
    }

    // Insert into product_details table if any detail is provided
    if (
      generic_name ||
      uses ||
      how_it_works ||
      ingredients ||
      important_info ||
      side_effects ||
      precaution ||
      interactions ||
      indication
    ) {
      const insertDetailsQuery = `
        INSERT INTO product_details (
          product_id,
          generic_name,
          uses,
          how_it_works
        ) VALUES ($1, $2, $3, $4)
        RETURNING detail_id;
      `;

      const detailResult = await client.query(insertDetailsQuery, [
        product.product_id,
        generic_name || null,
        uses || null,
        how_it_works || null,
      ]);

      const detail_id = detailResult.rows[0].detail_id;

      // Insert arrays into normalized child tables
      await insertDetailArrays(client, detail_id, {
        ingredients,
        important_info,
        side_effects,
        precaution,
        interactions,
        indication,
      });
    }

    await client.query("COMMIT");
    return product;
  } catch (err) {
    await client.query("ROLLBACK");
    // Provide meaningful error messages
    if (err.code === "23503") {
      // Foreign key violation
      throw new Error("Invalid category ID");
    }
    if (err.code === "22003") {
      // Numeric field overflow
      throw new Error("Price or stock value is too large");
    }
    if (err.code === "23505") {
      // Unique violation - Check which constraint was violated
      console.error("Unique violation details:", err.detail, err.constraint);
      
      // Check if it's specifically about the product name
      if (err.detail && err.detail.toLowerCase().includes('name')) {
        throw new Error("Product with this name already exists");
      }
      
      // Check constraint name for product ingredients unique constraint
      if (err.constraint && err.constraint.includes('unique_detail_ingredient')) {
        throw new Error("Duplicate ingredient entry detected");
      }
      
      throw new Error(`Duplicate entry: ${err.detail || err.constraint || "A unique constraint was violated"}`);
    }
    throw err;
  } finally {
    client.release();
  }
}


/** Get all products with category name */
async function getAllProducts() {
  const client = await pool.connect();
  try {
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
        p.created_at,
        p.category_id,
        c.category_name,
        pd.detail_id,
        pd.generic_name,
        pd.uses,
        pd.how_it_works,
        pi.image_url as main_image_url,
        -- Aggregate arrays using subqueries for optimal performance
        (SELECT COALESCE(array_agg(ingredient ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_ingredients WHERE detail_id = pd.detail_id) AS ingredients,
        (SELECT COALESCE(array_agg(info_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_important_info WHERE detail_id = pd.detail_id) AS important_info,
        (SELECT COALESCE(array_agg(side_effect_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_side_effects WHERE detail_id = pd.detail_id) AS side_effects,
        (SELECT COALESCE(array_agg(precaution_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_precautions WHERE detail_id = pd.detail_id) AS precaution,
        (SELECT COALESCE(array_agg(interaction_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_interactions WHERE detail_id = pd.detail_id) AS interactions,
        (SELECT COALESCE(array_agg(indication_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_indications WHERE detail_id = pd.detail_id) AS indication
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = true
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `;
    const { rows } = await client.query(query);

    // Map to frontend-friendly format
    const productsWithDetails = rows.map((row) => ({
      ...row,
      id: row.product_id, // Also add 'id' field for frontend
      image: row.main_image_url,
      prescriptionRequired: row.prescription_required,
      // Map detail fields to match formData field names (camelCase)
      genericName: row.generic_name,
      howItWorks: row.how_it_works,
      // Map all detail arrays to camelCase
      ingredients: row.ingredients || [],
      importantInfo: row.important_info || [],
      sideEffects: row.side_effects || [],
      precaution: row.precaution || [],
      interactions: row.interactions || [],
      indication: row.indication || [],
    }));

    return productsWithDetails;
  } finally {
    client.release();
  }
}

/** Get full product by id including category */
async function getProductById(id) {
  const client = await pool.connect();
  try {
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
        p.created_at,
        c.category_name,
        pd.detail_id,
        pd.generic_name,
        pd.uses,
        pd.how_it_works,
        pi.image_url as main_image_url,
        -- Aggregate arrays using subqueries
        (SELECT COALESCE(array_agg(ingredient ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_ingredients WHERE detail_id = pd.detail_id) AS ingredients,
        (SELECT COALESCE(array_agg(info_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_important_info WHERE detail_id = pd.detail_id) AS important_info,
        (SELECT COALESCE(array_agg(side_effect_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_side_effects WHERE detail_id = pd.detail_id) AS side_effects,
        (SELECT COALESCE(array_agg(precaution_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_precautions WHERE detail_id = pd.detail_id) AS precaution,
        (SELECT COALESCE(array_agg(interaction_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_interactions WHERE detail_id = pd.detail_id) AS interactions,
        (SELECT COALESCE(array_agg(indication_text ORDER BY display_order), ARRAY[]::TEXT[])
         FROM product_indications WHERE detail_id = pd.detail_id) AS indication
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = true
      WHERE p.product_id = $1
      LIMIT 1
    `;
    const { rows } = await client.query(query, [id]);
    const product = rows[0] || null;

    // Map to frontend-friendly format
    if (product && product.detail_id) {
      return {
        ...product,
        id: product.product_id,
        image: product.main_image_url,
        prescriptionRequired: product.prescription_required,
        // Map detail fields to match formData field names (camelCase)
        genericName: product.generic_name,
        howItWorks: product.how_it_works,
        // Map array fields from snake_case to camelCase
        ingredients: product.ingredients || [],
        importantInfo: product.important_info || [],
        sideEffects: product.side_effects || [],
        precaution: product.precaution || [],
        interactions: product.interactions || [],
        indication: product.indication || [],
      };
    }

    return product ? {
      ...product,
      id: product.product_id,
      image: product.main_image_url,
      prescriptionRequired: product.prescription_required,
      genericName: product.generic_name,
      howItWorks: product.how_it_works,
      // Add empty arrays as fallback
      ingredients: [],
      importantInfo: [],
      sideEffects: [],
      precaution: [],
      interactions: [],
      indication: [],
    } : null;
  } finally {
    client.release();
  }
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
      main_image_url, // Will update product_images table
      // Product details
      generic_name,
      uses,
      how_it_works,
      ingredients,
      important_info,
      side_effects,
      precaution,
      interactions,
      indication,
    } = data;

    // Check for duplicate product name if name is being updated (case-insensitive)
    if (name !== undefined && name !== null) {
      const duplicateCheck = await client.query(
        `SELECT product_id, name FROM products WHERE LOWER(name) = LOWER($1) AND product_id != $2 LIMIT 1`,
        [name.trim(), id]
      );
      
      if (duplicateCheck.rows.length > 0) {
        throw new Error("Product with this name already exists");
      }
    }

    // Update products table (WITHOUT main_image_url column)
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
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $11
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
      id,
    ];

    const result = await client.query(updateQuery, values);
    const updatedProduct = result.rows[0] || null;

    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    // Update main image in product_images table if provided
    if (main_image_url !== undefined) {
      // Check if primary image exists
      const checkImageQuery = `SELECT image_id FROM product_images WHERE product_id = $1 AND is_primary = true`;
      const imageCheck = await client.query(checkImageQuery, [id]);

      if (imageCheck.rows.length > 0) {
        // Update existing primary image (no updated_at column in normalized schema)
        await client.query(
          `UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true`,
          [main_image_url, id]
        );
      } else {
        // Insert new primary image
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, image_order) VALUES ($1, $2, $3, $4)`,
          [id, main_image_url, true, 0]
        );
      }
    }

    // Update or insert product_details if any detail field is provided
    if (
      updatedProduct &&
      (generic_name !== undefined ||
        uses !== undefined ||
        how_it_works !== undefined ||
        ingredients !== undefined ||
        important_info !== undefined ||
        side_effects !== undefined ||
        precaution !== undefined ||
        interactions !== undefined ||
        indication !== undefined)
    ) {
      // Check if details exist
      const checkDetailsQuery = `SELECT detail_id FROM product_details WHERE product_id = $1;`;
      const detailsCheck = await client.query(checkDetailsQuery, [id]);

      if (detailsCheck.rows.length > 0) {
        const detail_id = detailsCheck.rows[0].detail_id;

        // Update existing details (only scalar fields)
        const updateDetailsQuery = `
          UPDATE product_details
          SET
            generic_name = COALESCE($1, generic_name),
            uses = COALESCE($2, uses),
            how_it_works = COALESCE($3, how_it_works),
            updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $4;
        `;

        await client.query(updateDetailsQuery, [
          generic_name,
          uses,
          how_it_works,
          id,
        ]);

        // Delete old array data and insert new ones if provided
        if (ingredients !== undefined || important_info !== undefined || side_effects !== undefined ||
            precaution !== undefined || interactions !== undefined || indication !== undefined) {
          await deleteDetailArrays(client, detail_id);
          await insertDetailArrays(client, detail_id, {
            ingredients,
            important_info,
            side_effects,
            precaution,
            interactions,
            indication,
          });
        }
      } else {
        // Insert new details
        const insertDetailsQuery = `
          INSERT INTO product_details (
            product_id,
            generic_name,
            uses,
            how_it_works
          ) VALUES ($1, $2, $3, $4)
          RETURNING detail_id;
        `;

        const detailResult = await client.query(insertDetailsQuery, [
          id,
          generic_name || null,
          uses || null,
          how_it_works || null,
        ]);

        const detail_id = detailResult.rows[0].detail_id;

        // Insert arrays
        await insertDetailArrays(client, detail_id, {
          ingredients,
          important_info,
          side_effects,
          precaution,
          interactions,
          indication,
        });
      }
    }

    await client.query("COMMIT");
    return updatedProduct;
  } catch (err) {
    await client.query("ROLLBACK");
    
    // Provide meaningful error messages
    if (err.code === "23503") {
      // Foreign key violation
      throw new Error("Invalid category ID");
    }
    if (err.code === "23505") {
      // Unique violation
      console.error("Unique violation details:", err.detail, err.constraint);
      
      if (err.detail && err.detail.toLowerCase().includes('name')) {
        throw new Error("Product with this name already exists");
      }
      
      if (err.constraint && err.constraint.includes('unique_detail_ingredient')) {
        throw new Error("Duplicate ingredient entry detected");
      }
      
      throw new Error(`Duplicate entry: ${err.detail || err.constraint || "A unique constraint was violated"}`);
    }
    
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

    // Check if product is referenced in active orders (pending, processing, shipped)
    const orderCheck = await client.query(
      `SELECT COUNT(*) as count FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.product_id = $1 
       AND o.order_status IN ('pending', 'processing', 'shipped')`,
      [id]
    );
    
    if (parseInt(orderCheck.rows[0].count) > 0) {
      throw new Error(
        `Produk tidak dapat dihapus karena sedang ada di ${orderCheck.rows[0].count} pesanan aktif. Tunggu hingga pesanan selesai atau dibatalkan.`
      );
    }

    // Check if product is in any user's cart
    const cartCheck = await client.query(
      `SELECT COUNT(*) as count FROM cart_items WHERE product_id = $1`,
      [id]
    );
    
    if (parseInt(cartCheck.rows[0].count) > 0) {
      throw new Error(
        `Produk tidak dapat dihapus karena sedang ada di keranjang ${cartCheck.rows[0].count} pengguna. Hapus dari keranjang terlebih dahulu.`
      );
    }

    // Check if product is saved for later
    const savedCheck = await client.query(
      `SELECT COUNT(*) as count FROM saved_for_later WHERE product_id = $1`,
      [id]
    );
    
    if (parseInt(savedCheck.rows[0].count) > 0) {
      throw new Error(
        `Produk tidak dapat dihapus karena disimpan oleh ${savedCheck.rows[0].count} pengguna. Hapus dari saved for later terlebih dahulu.`
      );
    }

    // For completed orders, reviews, and historical data, we'll allow deletion
    // but clean up references appropriately

    // Remove from notifications (set to NULL if allowed, or delete notification)
    await client.query(
      `UPDATE notifications SET related_product_id = NULL WHERE related_product_id = $1`,
      [id]
    );

    // Remove from sales_reports (set to NULL)
    await client.query(
      `UPDATE sales_reports SET top_selling_product_id = NULL WHERE top_selling_product_id = $1`,
      [id]
    );

    // Delete product reviews (historical data - safe to delete)
    await client.query(`DELETE FROM product_reviews WHERE product_id = $1`, [id]);

    // Delete from product_images
    await client.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);

    // Delete from product_details
    await client.query(`DELETE FROM product_details WHERE product_id = $1`, [id]);

    // For completed order_items, we keep them for historical records
    // but you might want to set a flag or handle differently
    // Note: This might be a business decision - keeping for now

    // Delete from products
    const query = `
      DELETE FROM products
      WHERE product_id = $1
      RETURNING product_id, name;
    `;
    const { rows } = await client.query(query, [id]);

    if (!rows[0]) {
      throw new Error("Produk tidak ditemukan");
    }

    await client.query("COMMIT");
    console.log(`✅ Product ${rows[0].name} (ID: ${id}) deleted successfully`);
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get all deleted/archived products (soft deleted, is_active = false)
 */
async function getDeletedProducts() {
  const client = await pool.connect();
  try {
    console.log("[ProductService] Fetching deleted products...");
    
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.brand,
        p.price,
        p.stock,
        p.description,
        p.is_active,
        p.updated_at,
        pc.category_name,
        COALESCE(
          (SELECT COUNT(DISTINCT o.order_id)
           FROM orders o
           INNER JOIN order_items oi ON o.order_id = oi.order_id
           WHERE oi.product_id = p.product_id),
          0
        ) AS total_orders
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE p.is_active = FALSE
      ORDER BY p.updated_at DESC
    `;
    
    const result = await client.query(query);
    console.log(`[ProductService] Found ${result.rows.length} deleted products`);
    
    return result.rows;
  } catch (error) {
    console.error("[ProductService] Error fetching deleted products:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Restore a soft-deleted product (set is_active = true)
 */
async function restoreProduct(id) {
  const client = await pool.connect();
  try {
    console.log(`[ProductService] Restoring product ID: ${id}`);
    
    const query = `
      UPDATE products
      SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1 AND is_active = FALSE
      RETURNING *
    `;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      console.log(`[ProductService] Product ${id} not found or already active`);
      return null;
    }
    
    console.log(`[ProductService] Product ${id} restored successfully`);
    return result.rows[0];
  } catch (error) {
    console.error(`[ProductService] Error restoring product ${id}:`, error.message);
    throw error;
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
  getDeletedProducts,
  restoreProduct,
};
