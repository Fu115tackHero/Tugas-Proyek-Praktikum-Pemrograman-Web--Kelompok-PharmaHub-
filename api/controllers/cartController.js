// Cart Controller - HTTP handlers for cart endpoints
const cartService = require("../services/cartService");

const cartController = {
  /**
   * GET /api/cart - Get user's cart
   */
  async getCart(req, res) {
    try {
      const userId = req.user.userId;
      console.log(`🛒 [CartController] GET cart for user ${userId}`);

      const cartItems = await cartService.getCartByUserId(userId);

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      res.status(200).json({
        success: true,
        data: {
          items: cartItems,
          subtotal: parseFloat(subtotal.toFixed(2)),
          itemCount,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("❌ [CartController] Error getting cart:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve cart",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * POST /api/cart - Add item to cart
   * Body: { product_id, quantity }
   */
  async addToCart(req, res) {
    try {
      const userId = req.user.userId;
      const { product_id, quantity } = req.body;

      console.log(
        `➕ [CartController] POST add to cart - User: ${userId}, Product: ${product_id}, Qty: ${quantity}`
      );

      // Validation
      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const qty = parseInt(quantity) || 1;

      if (qty <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        });
      }

      const cartItem = await cartService.addToCart(userId, product_id, qty);

      // Fetch updated cart
      const updatedCart = await cartService.getCartByUserId(userId);

      res.status(201).json({
        success: true,
        message: "Product added to cart",
        data: {
          cartItem,
          cart: updatedCart,
        },
      });
    } catch (error) {
      console.error("❌ [CartController] Error adding to cart:", error.message);

      // Handle specific errors
      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes("stock") ||
        error.message.includes("available")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to add item to cart",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * PUT /api/cart/:productId - Update cart item quantity
   * Body: { quantity }
   */
  async updateQuantity(req, res) {
    try {
      const userId = req.user.userId;
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;

      console.log(
        `🔄 [CartController] PUT update quantity - User: ${userId}, Product: ${productId}, Qty: ${quantity}`
      );

      // Validation
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      if (quantity === undefined || quantity === null) {
        return res.status(400).json({
          success: false,
          message: "Quantity is required",
        });
      }

      const qty = parseInt(quantity);

      if (qty < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot be negative",
        });
      }

      const result = await cartService.updateQuantity(userId, productId, qty);

      // Fetch updated cart
      const updatedCart = await cartService.getCartByUserId(userId);

      res.status(200).json({
        success: true,
        message: qty === 0 ? "Item removed from cart" : "Quantity updated",
        data: {
          item: result,
          cart: updatedCart,
        },
      });
    } catch (error) {
      console.error(
        "❌ [CartController] Error updating quantity:",
        error.message
      );

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes("stock") ||
        error.message.includes("available")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update quantity",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * DELETE /api/cart/:productId - Remove item from cart
   */
  async removeFromCart(req, res) {
    try {
      const userId = req.user.userId;
      const productId = parseInt(req.params.productId);

      console.log(
        `🗑️ [CartController] DELETE remove from cart - User: ${userId}, Product: ${productId}`
      );

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      const success = await cartService.removeFromCart(userId, productId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      // Fetch updated cart
      const updatedCart = await cartService.getCartByUserId(userId);

      res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: {
          cart: updatedCart,
        },
      });
    } catch (error) {
      console.error(
        "❌ [CartController] Error removing from cart:",
        error.message
      );
      res.status(500).json({
        success: false,
        message: "Failed to remove item from cart",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * DELETE /api/cart - Clear all cart items
   */
  async clearCart(req, res) {
    try {
      const userId = req.user.userId;

      console.log(`🧹 [CartController] DELETE clear cart - User: ${userId}`);

      const deletedCount = await cartService.clearCart(userId);

      res.status(200).json({
        success: true,
        message: "Cart cleared",
        data: {
          deletedCount,
        },
      });
    } catch (error) {
      console.error("❌ [CartController] Error clearing cart:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to clear cart",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * GET /api/cart/saved - Get saved for later items
   */
  async getSavedForLater(req, res) {
    try {
      const userId = req.user.userId;

      console.log(`💾 [CartController] GET saved for later - User: ${userId}`);

      const savedItems = await cartService.getSavedForLater(userId);

      res.status(200).json({
        success: true,
        data: {
          items: savedItems,
          count: savedItems.length,
        },
      });
    } catch (error) {
      console.error(
        "❌ [CartController] Error getting saved items:",
        error.message
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve saved items",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * POST /api/cart/save-for-later - Save item for later
   * Body: { product_id }
   */
  async saveForLater(req, res) {
    try {
      const userId = req.user.userId;
      const { product_id } = req.body;

      console.log(
        `💾 [CartController] POST save for later - User: ${userId}, Product: ${product_id}`
      );

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const savedItem = await cartService.saveForLater(userId, product_id);

      // Fetch updated cart and saved items
      const updatedCart = await cartService.getCartByUserId(userId);
      const updatedSaved = await cartService.getSavedForLater(userId);

      res.status(201).json({
        success: true,
        message: "Item saved for later",
        data: {
          savedItem,
          cart: updatedCart,
          savedItems: updatedSaved,
        },
      });
    } catch (error) {
      console.error(
        "❌ [CartController] Error saving for later:",
        error.message
      );
      res.status(500).json({
        success: false,
        message: "Failed to save item for later",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * POST /api/cart/move-to-cart - Move saved item to cart
   * Body: { product_id, quantity }
   */
  async moveToCart(req, res) {
    try {
      const userId = req.user.userId;
      const { product_id, quantity } = req.body;

      console.log(
        `🔄 [CartController] POST move to cart - User: ${userId}, Product: ${product_id}`
      );

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const qty = parseInt(quantity) || 1;

      const cartItem = await cartService.moveToCart(userId, product_id, qty);

      // Fetch updated cart and saved items
      const updatedCart = await cartService.getCartByUserId(userId);
      const updatedSaved = await cartService.getSavedForLater(userId);

      res.status(200).json({
        success: true,
        message: "Item moved to cart",
        data: {
          cartItem,
          cart: updatedCart,
          savedItems: updatedSaved,
        },
      });
    } catch (error) {
      console.error("❌ [CartController] Error moving to cart:", error.message);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to move item to cart",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * DELETE /api/cart/saved/:productId - Remove from saved for later
   */
  async removeFromSaved(req, res) {
    try {
      const userId = req.user.userId;
      const productId = parseInt(req.params.productId);

      console.log(
        `🗑️ [CartController] DELETE remove from saved - User: ${userId}, Product: ${productId}`
      );

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      const success = await cartService.removeFromSaved(userId, productId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Saved item not found",
        });
      }

      // Fetch updated saved items
      const updatedSaved = await cartService.getSavedForLater(userId);

      res.status(200).json({
        success: true,
        message: "Item removed from saved for later",
        data: {
          savedItems: updatedSaved,
        },
      });
    } catch (error) {
      console.error(
        "❌ [CartController] Error removing from saved:",
        error.message
      );
      res.status(500).json({
        success: false,
        message: "Failed to remove saved item",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
};

module.exports = cartController;
