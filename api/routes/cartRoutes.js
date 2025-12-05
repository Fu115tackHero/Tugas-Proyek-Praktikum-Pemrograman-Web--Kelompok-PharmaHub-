// Cart Routes
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

// All cart routes require authentication
router.use(authMiddleware);

// Saved for later operations (more specific routes first)
router.get("/saved", cartController.getSavedForLater); // GET /api/cart/saved - Get saved items
router.post("/save-for-later", cartController.saveForLater); // POST /api/cart/save-for-later - Save item
router.post("/move-to-cart", cartController.moveToCart); // POST /api/cart/move-to-cart - Move to cart
router.delete("/saved/:productId", cartController.removeFromSaved); // DELETE /api/cart/saved/:productId - Remove saved

// Cart CRUD operations
router.get("/", cartController.getCart); // GET /api/cart - Get user's cart
router.post("/", cartController.addToCart); // POST /api/cart - Add item to cart
router.delete("/", cartController.clearCart); // DELETE /api/cart - Clear cart (before /:productId)
router.put("/:productId", cartController.updateQuantity); // PUT /api/cart/:productId - Update quantity
router.delete("/:productId", cartController.removeFromCart); // DELETE /api/cart/:productId - Remove item

module.exports = router;
