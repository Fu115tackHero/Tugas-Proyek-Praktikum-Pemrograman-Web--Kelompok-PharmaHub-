const db = require('../config/database');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(`
      SELECT 
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        ci.added_at,
        p.name,
        p.brand,
        p.price,
        p.image,
        p.category_id,
        p.stock,
        pc.category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil keranjang'
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Check if product exists and has stock
    const productCheck = await db.query(
      'SELECT stock FROM products WHERE product_id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    if (productCheck.rows[0].stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stok tidak mencukupi'
      });
    }

    // Check if item already in cart
    const existingItem = await db.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      await db.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2',
        [newQuantity, existingItem.rows[0].cart_id]
      );
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, productId, quantity]
      );
    }

    res.json({
      success: true,
      message: 'Item berhasil ditambahkan ke keranjang'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan item ke keranjang'
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity harus lebih dari 0'
      });
    }

    await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2',
      [quantity, cartId]
    );

    res.json({
      success: true,
      message: 'Quantity berhasil diupdate'
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate item'
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    res.json({
      success: true,
      message: 'Item berhasil dihapus dari keranjang'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus item dari keranjang'
    });
  }
};

// Clear user's cart
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Keranjang berhasil dikosongkan'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengosongkan keranjang'
    });
  }
};

// Sync cart from localStorage to database
const syncCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    // Clear existing cart
    await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    // Insert all items from localStorage (or update if exists)
    for (const item of cartItems) {
      // Cek apakah item sudah ada
      const existing = await db.query(
        'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, item.id]
      );

      if (existing.rows.length > 0) {
        // Update quantity
        await db.query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3',
          [item.quantity, userId, item.id]
        );
      } else {
        // Insert baru
        await db.query(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
          [userId, item.id, item.quantity]
        );
      }
    }

    res.json({
      success: true,
      message: 'Cart berhasil disinkronkan'
    });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyinkronkan cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};
