const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET /api/cart/:userId - Get user's cart
router.get('/:userId', cartController.getCart);

// POST /api/cart - Add item to cart
router.post('/', cartController.addToCart);

// POST /api/cart/sync - Sync cart from localStorage to DB
router.post('/sync', cartController.syncCart);

// PUT /api/cart/:cartId - Update cart item quantity
router.put('/:cartId', cartController.updateCartItem);

// DELETE /api/cart/:cartId - Remove item from cart
router.delete('/:cartId', cartController.removeFromCart);

// DELETE /api/cart/clear/:userId - Clear user's cart
router.delete('/clear/:userId', cartController.clearCart);

module.exports = router;
