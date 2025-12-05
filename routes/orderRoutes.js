const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(authMiddleware);

// ============================================
// ADMIN ROUTES (SPECIFIC PATHS FIRST)
// ============================================

// GET /api/orders/admin/all - Get all orders (admin only)
router.get("/admin/all", orderController.getAllOrders);

// GET /api/orders/admin/:id - Get order details for admin (includes items)
router.get("/admin/:id", orderController.getOrderDetailsForAdmin);

// POST /api/orders/bulk-archive - Bulk archive orders (admin only)
router.post("/bulk-archive", orderController.bulkArchiveOrders);

// ============================================
// USER ROUTES
// ============================================

// POST /api/orders - Create new order
router.post("/", orderController.createOrder);

// GET /api/orders - Get all orders for current user
router.get("/", orderController.getOrders);

// ============================================
// SPECIFIC ROUTES (MUST COME BEFORE GENERIC /:id)
// ============================================

// POST /api/orders/:id/cancel - Cancel an order
router.post("/:id/cancel", orderController.cancelOrder);

// PUT /api/orders/:id/status - Update order status
router.put("/:id/status", orderController.updateOrderStatus);

// PUT /api/orders/:id/archive - Archive order (admin only)
router.put("/:id/archive", orderController.archiveOrder);

// PUT /api/orders/:id/unarchive - Unarchive order (admin only)
router.put("/:id/unarchive", orderController.unarchiveOrder);

// PUT /api/orders/:id/hide-from-user - Hide order from user's history
router.put("/:id/hide-from-user", orderController.archiveOrderForUser);

// PUT /api/orders/:id/restore-to-user - Restore order to user's history
router.put("/:id/restore-to-user", orderController.unarchiveOrderForUser);

// Payment actions for pending payments
// PUT /api/orders/:id/payment/finalize - Mark payment as paid
router.put("/:id/payment/finalize", orderController.finalizePayment);

// PUT /api/orders/:id/payment/cancel - Cancel payment and order
router.put("/:id/payment/cancel", orderController.cancelPayment);

// Cancel paid order with refund
// PUT /api/orders/:id/cancel-with-refund - Cancel paid order and request refund
router.put(
  "/:id/cancel-with-refund",
  orderController.cancelPaidOrderWithRefund
);

// ============================================
// GENERIC ROUTE (MUST COME LAST)
// ============================================

// GET /api/orders/:id - Get specific order by ID
router.get("/:id", orderController.getOrderById);

module.exports = router;
