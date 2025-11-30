const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(authMiddleware);

// POST /api/orders - Create new order
router.post("/", orderController.createOrder);

// GET /api/orders/admin/all - Get all orders (admin only)
router.get("/admin/all", orderController.getAllOrders);

// GET /api/orders - Get all orders for current user
router.get("/", orderController.getOrders);

// POST /api/orders/:id/cancel - Cancel an order (must come before /:id)
router.post("/:id/cancel", orderController.cancelOrder);

// PUT /api/orders/:id/status - Update order status (must come before /:id)
router.put("/:id/status", orderController.updateOrderStatus);

// GET /api/orders/:id - Get specific order by ID
router.get("/:id", orderController.getOrderById);

module.exports = router;
