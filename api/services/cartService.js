// Cart Service - Database operations for shopping cart
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech')
    ? { rejectUnauthorized: false } // Required for Neon
    : false, // Local postgres without SSL
});

const cartService = {
  /**
   * Get user's cart with product details
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Cart items with product info
   */
  async getCartByUserId(userId) {
    try {
      console.log(`🛒 [CartService] Fetching cart for user ${userId}...`);

      const query = `
        SELECT 
          ci.cart_id,
          ci.user_id,
          ci.product_id,
          ci.quantity,
          ci.added_at,
          ci.updated_at,
          p.name,
          p.brand,
          p.price,
          p.stock,
          pi.image_url AS main_image_url,
          p.prescription_required,
          p.is_active,
          pc.category_name
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.product_id
        LEFT JOIN product_categories pc ON p.category_id = pc.category_id
        LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
        WHERE ci.user_id = $1 AND p.is_active = TRUE
        ORDER BY ci.added_at DESC
      `;

      const result = await pool.query(query, [userId]);

      console.log(`✅ [CartService] Found ${result.rows.length} items in cart`);

      return result.rows.map((item) => ({
        cart_id: item.cart_id,
        id: item.product_id, // Frontend expects 'id'
        product_id: item.product_id,
        name: item.name,
        brand: item.brand,
        price: parseFloat(item.price),
        quantity: item.quantity,
        stock: item.stock,
        image: item.main_image_url,
        category: item.category_name,
        prescriptionRequired: item.prescription_required,
        isActive: item.is_active,
        added_at: item.added_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      console.error("❌ [CartService] Error fetching cart:", error.message);
      throw error;
    }
  },

  /**
   * Add item to cart or update quantity if exists
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<Object>} Cart item
   */
  async addToCart(userId, productId, quantity = 1) {
    const client = await pool.connect();

    try {
      console.log(
        `➕ [CartService] Adding product ${productId} to user ${userId}'s cart (qty: ${quantity})`
      );

      await client.query("BEGIN");

      // Validate product exists and is active
      const productCheck = await client.query(
        `SELECT product_id, name, stock, is_active 
         FROM products 
         WHERE product_id = $1`,
        [productId]
      );

      if (productCheck.rows.length === 0) {
        throw new Error("Product not found");
      }

      const product = productCheck.rows[0];

      if (!product.is_active) {
        throw new Error("Product is no longer available");
      }

      // Check if item already in cart
      const existingItem = await client.query(
        `SELECT cart_id, quantity 
         FROM cart_items 
         WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );

      let result;

      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + quantity;

        if (newQuantity > product.stock) {
          throw new Error(
            `Insufficient stock. Only ${product.stock} units available`
          );
        }

        result = await client.query(
          `UPDATE cart_items 
           SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE cart_id = $2 
           RETURNING *`,
          [newQuantity, existingItem.rows[0].cart_id]
        );

        console.log(
          `✅ [CartService] Updated cart item quantity to ${newQuantity}`
        );
      } else {
        // Insert new item
        if (quantity > product.stock) {
          throw new Error(
            `Insufficient stock. Only ${product.stock} units available`
          );
        }

        result = await client.query(
          `INSERT INTO cart_items (user_id, product_id, quantity) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [userId, productId, quantity]
        );

        console.log(
          `✅ [CartService] Added new item to cart (cart_id: ${result.rows[0].cart_id})`
        );
      }

      await client.query("COMMIT");

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ [CartService] Error adding to cart:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Update cart item quantity
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart item
   */
  async updateQuantity(userId, productId, quantity) {
    const client = await pool.connect();

    try {
      console.log(
        `🔄 [CartService] Updating product ${productId} quantity to ${quantity} for user ${userId}`
      );

      await client.query("BEGIN");

      // Validate quantity
      if (quantity < 0) {
        throw new Error("Quantity cannot be negative");
      }

      // Check product stock
      const productCheck = await client.query(
        `SELECT stock FROM products WHERE product_id = $1 AND is_active = TRUE`,
        [productId]
      );

      if (productCheck.rows.length === 0) {
        throw new Error("Product not found or inactive");
      }

      if (quantity > productCheck.rows[0].stock) {
        throw new Error(
          `Insufficient stock. Only ${productCheck.rows[0].stock} units available`
        );
      }

      // If quantity is 0, delete the item
      if (quantity === 0) {
        await client.query(
          `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`,
          [userId, productId]
        );

        console.log(`🗑️ [CartService] Removed item from cart (quantity 0)`);

        await client.query("COMMIT");
        return { deleted: true, product_id: productId };
      }

      // Update quantity
      const result = await client.query(
        `UPDATE cart_items 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2 AND product_id = $3 
         RETURNING *`,
        [quantity, userId, productId]
      );

      if (result.rows.length === 0) {
        throw new Error("Cart item not found");
      }

      console.log(`✅ [CartService] Quantity updated to ${quantity}`);

      await client.query("COMMIT");

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ [CartService] Error updating quantity:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Remove item from cart
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async removeFromCart(userId, productId) {
    try {
      console.log(
        `🗑️ [CartService] Removing product ${productId} from user ${userId}'s cart`
      );

      const result = await pool.query(
        `DELETE FROM cart_items 
         WHERE user_id = $1 AND product_id = $2 
         RETURNING cart_id`,
        [userId, productId]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️ [CartService] Cart item not found`);
        return false;
      }

      console.log(
        `✅ [CartService] Item removed from cart (cart_id: ${result.rows[0].cart_id})`
      );
      return true;
    } catch (error) {
      console.error(
        "❌ [CartService] Error removing from cart:",
        error.message
      );
      throw error;
    }
  },

  /**
   * Clear all cart items for user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Number of deleted items
   */
  async clearCart(userId) {
    try {
      console.log(`🧹 [CartService] Clearing cart for user ${userId}`);

      const result = await pool.query(
        `DELETE FROM cart_items WHERE user_id = $1 RETURNING cart_id`,
        [userId]
      );

      console.log(
        `✅ [CartService] Cleared ${result.rows.length} items from cart`
      );

      return result.rows.length;
    } catch (error) {
      console.error("❌ [CartService] Error clearing cart:", error.message);
      throw error;
    }
  },

  /**
   * Get saved for later items
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Saved items with product details
   */
  async getSavedForLater(userId) {
    try {
      console.log(
        `💾 [CartService] Fetching saved items for user ${userId}...`
      );

      const query = `
        SELECT 
          sfl.saved_id,
          sfl.user_id,
          sfl.product_id,
          sfl.saved_at,
          p.name,
          p.brand,
          p.price,
          p.stock,
          pi.image_url AS main_image_url,
          p.prescription_required,
          p.is_active,
          pc.category_name
        FROM saved_for_later sfl
        INNER JOIN products p ON sfl.product_id = p.product_id
        LEFT JOIN product_categories pc ON p.category_id = pc.category_id
        LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
        WHERE sfl.user_id = $1 AND p.is_active = TRUE
        ORDER BY sfl.saved_at DESC
      `;

      const result = await pool.query(query, [userId]);

      console.log(`✅ [CartService] Found ${result.rows.length} saved items`);

      return result.rows.map((item) => ({
        saved_id: item.saved_id,
        id: item.product_id,
        product_id: item.product_id,
        name: item.name,
        brand: item.brand,
        price: parseFloat(item.price),
        stock: item.stock,
        image: item.main_image_url,
        category: item.category_name,
        prescriptionRequired: item.prescription_required,
        isActive: item.is_active,
        saved_at: item.saved_at,
      }));
    } catch (error) {
      console.error(
        "❌ [CartService] Error fetching saved items:",
        error.message
      );
      throw error;
    }
  },

  /**
   * Save item for later (move from cart)
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Saved item
   */
  async saveForLater(userId, productId) {
    const client = await pool.connect();

    try {
      console.log(
        `💾 [CartService] Saving product ${productId} for later for user ${userId}`
      );

      await client.query("BEGIN");

      // Check if already saved
      const existingSaved = await client.query(
        `SELECT saved_id FROM saved_for_later WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );

      if (existingSaved.rows.length > 0) {
        console.log(`⚠️ [CartService] Product already in saved for later`);
        await client.query("ROLLBACK");
        return existingSaved.rows[0];
      }

      // Add to saved for later
      const result = await client.query(
        `INSERT INTO saved_for_later (user_id, product_id) 
         VALUES ($1, $2) 
         RETURNING *`,
        [userId, productId]
      );

      // Remove from cart if exists
      await client.query(
        `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );

      console.log(
        `✅ [CartService] Product saved for later (saved_id: ${result.rows[0].saved_id})`
      );

      await client.query("COMMIT");

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ [CartService] Error saving for later:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Move saved item back to cart
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to add to cart
   * @returns {Promise<Object>} Cart item
   */
  async moveToCart(userId, productId, quantity = 1) {
    const client = await pool.connect();

    try {
      console.log(
        `🔄 [CartService] Moving product ${productId} to cart for user ${userId}`
      );

      await client.query("BEGIN");

      // Remove from saved for later
      const deleteResult = await client.query(
        `DELETE FROM saved_for_later 
         WHERE user_id = $1 AND product_id = $2 
         RETURNING saved_id`,
        [userId, productId]
      );

      if (deleteResult.rows.length === 0) {
        throw new Error("Item not found in saved for later");
      }

      // Add to cart (reuse addToCart logic with transaction)
      const existingCart = await client.query(
        `SELECT cart_id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );

      let cartItem;

      if (existingCart.rows.length > 0) {
        // Update quantity
        const newQuantity = existingCart.rows[0].quantity + quantity;

        const updateResult = await client.query(
          `UPDATE cart_items 
           SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE cart_id = $2 
           RETURNING *`,
          [newQuantity, existingCart.rows[0].cart_id]
        );

        cartItem = updateResult.rows[0];
      } else {
        // Insert new cart item
        const insertResult = await client.query(
          `INSERT INTO cart_items (user_id, product_id, quantity) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [userId, productId, quantity]
        );

        cartItem = insertResult.rows[0];
      }

      console.log(
        `✅ [CartService] Product moved to cart (cart_id: ${cartItem.cart_id})`
      );

      await client.query("COMMIT");

      return cartItem;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ [CartService] Error moving to cart:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Remove item from saved for later
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async removeFromSaved(userId, productId) {
    try {
      console.log(
        `🗑️ [CartService] Removing product ${productId} from saved for later`
      );

      const result = await pool.query(
        `DELETE FROM saved_for_later 
         WHERE user_id = $1 AND product_id = $2 
         RETURNING saved_id`,
        [userId, productId]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️ [CartService] Saved item not found`);
        return false;
      }

      console.log(
        `✅ [CartService] Item removed from saved (saved_id: ${result.rows[0].saved_id})`
      );
      return true;
    } catch (error) {
      console.error(
        "❌ [CartService] Error removing from saved:",
        error.message
      );
      throw error;
    }
  },
};

module.exports = cartService;
