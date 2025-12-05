const orderService = require("../services/orderService");

/**
 * POST /api/orders - Create a new order
 */
async function createOrder(req, res) {
  try {
    const userId = req.user.userId;
    const orderData = req.body;

    console.log("[OrderController] Creating order for user:", userId);

    // Validate required fields
    if (!orderData.customerName || !orderData.customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Nama dan nomor telepon pelanggan wajib diisi",
      });
    }

    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Pesanan harus memiliki setidaknya satu item",
      });
    }

    if (!orderData.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Metode pembayaran wajib dipilih",
      });
    }

    if (!orderData.totalAmount || orderData.totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total pembayaran tidak valid",
      });
    }

    const result = await orderService.createOrder(userId, orderData);

    console.log(
      "[OrderController] Order created successfully:",
      result.order.order_number
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("[OrderController] Error creating order:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal membuat pesanan",
      error: error.message,
    });
  }
}

/**
 * GET /api/orders - Get all orders for current user
 */
async function getOrders(req, res) {
  try {
    const userId = req.user.userId;

    console.log("[OrderController] Fetching orders for user:", userId);

    const orders = await orderService.getOrdersByUserId(userId);

    res.status(200).json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("[OrderController] Error fetching orders:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pesanan",
      error: error.message,
    });
  }
}

/**
 * GET /api/orders/admin/all - Get all orders (admin only)
 */
async function getAllOrders(req, res) {
  try {
    console.log("[OrderController] Fetching all orders for admin");

    const orders = await orderService.getAllOrders();

    res.status(200).json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error(
      "[OrderController] Error fetching all orders:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Gagal mengambil semua pesanan",
      error: error.message,
    });
  }
}

/**
 * GET /api/orders/admin/:id - Get order details for admin (includes items)
 */
async function getOrderDetailsForAdmin(req, res) {
  try {
    const orderId = parseInt(req.params.id);

    console.log(`[OrderController] Admin fetching order details ${orderId}`);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID pesanan tidak valid",
      });
    }

    // Use getOrderByIdForAdmin which doesn't require userId
    const order = await orderService.getOrderByIdForAdmin(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "[OrderController] Error fetching order details for admin:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail pesanan",
      error: error.message,
    });
  }
}

/**
 * GET /api/orders/:id - Get specific order by ID
 */
async function getOrderById(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.id);

    console.log(
      `[OrderController] Fetching order ${orderId} for user ${userId}`
    );

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID pesanan tidak valid",
      });
    }

    const order = await orderService.getOrderById(userId, orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("[OrderController] Error fetching order:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail pesanan",
      error: error.message,
    });
  }
}

/**
 * PUT /api/orders/:id/status - Update order status (admin or system)
 */
async function updateOrderStatus(req, res) {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    console.log(
      `[OrderController] Updating order ${orderId} status to:`,
      status
    );

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID pesanan tidak valid",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status pesanan wajib diisi",
      });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
      "delivered",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status pesanan tidak valid",
      });
    }

    const result = await orderService.updateOrderStatus(orderId, status);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      order: result,
    });
  } catch (error) {
    console.error(
      "[OrderController] Error updating order status:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui status pesanan",
      error: error.message,
    });
  }
}

/**
 * POST /api/orders/:id/cancel - Cancel an order
 */
async function cancelOrder(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.id);
    const { cancellationReason } = req.body;

    console.log(
      `[OrderController] Cancelling order ${orderId} for user ${userId}`
    );

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID pesanan tidak valid",
      });
    }

    if (!cancellationReason || cancellationReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Alasan pembatalan wajib diisi",
      });
    }

    const result = await orderService.cancelOrder(
      userId,
      orderId,
      cancellationReason
    );

    res.status(200).json({
      success: true,
      order: result,
    });
  } catch (error) {
    console.error("[OrderController] Error cancelling order:", error.message);

    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    if (error.message === "Only pending orders can be cancelled") {
      return res.status(400).json({
        success: false,
        message: "Hanya pesanan dengan status pending yang dapat dibatalkan",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal membatalkan pesanan",
      error: error.message,
    });
  }
}

/**
 * PUT /api/orders/:id/archive
 * Archive order (soft delete)
 * Admin only
 */
async function archiveOrder(req, res) {
  console.log("🗄️ [OrderController] Archive order");
  console.log("   Order ID:", req.params.id);
  console.log("   User role:", req.user?.role);

  try {
    // Verify admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can archive orders",
      });
    }

    const orderId = parseInt(req.params.id);

    const order = await orderService.archiveOrder(orderId);

    res.status(200).json({
      success: true,
      message: "Order archived successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ [OrderController] Error archiving order:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PUT /api/orders/:id/unarchive
 * Unarchive order (restore)
 * Admin only
 */
async function unarchiveOrder(req, res) {
  console.log("📂 [OrderController] Unarchive order");
  console.log("   Order ID:", req.params.id);

  try {
    // Verify admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can unarchive orders",
      });
    }

    const orderId = parseInt(req.params.id);

    const order = await orderService.unarchiveOrder(orderId);

    res.status(200).json({
      success: true,
      message: "Order unarchived successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "❌ [OrderController] Error unarchiving order:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /api/orders/bulk-archive
 * Archive multiple orders
 * Admin only
 */
async function bulkArchiveOrders(req, res) {
  console.log("🗄️ [OrderController] Bulk archive orders");
  console.log("   Order IDs:", req.body.orderIds);

  try {
    // Verify admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can archive orders",
      });
    }

    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orderIds array is required",
      });
    }

    const result = await orderService.bulkArchiveOrders(orderIds);

    res.status(200).json({
      success: true,
      message: `${result.archived_count} orders archived successfully`,
      data: result,
    });
  } catch (error) {
    console.error(
      "❌ [OrderController] Error bulk archiving orders:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PUT /api/orders/:id/hide-from-user
 * Hide order from user's history view (USER-SIDE deletion)
 * User can only hide their own orders
 */
async function archiveOrderForUser(req, res) {
  console.log("👤 [OrderController] User hiding order from history");
  console.log("   Order ID:", req.params.id);
  console.log("   User ID:", req.user?.userId);

  try {
    const orderId = parseInt(req.params.id);
    const userId = req.user.userId; // FIX: Changed from user_id to userId

    const result = await orderService.archiveOrderForUser(orderId, userId);

    res.status(200).json({
      success: true,
      message: "Pesanan berhasil dihapus dari riwayat",
      data: result,
    });
  } catch (error) {
    console.error(
      "❌ [OrderController] Error hiding order for user:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PUT /api/orders/:id/restore-to-user
 * Restore order to user's history view
 * User can only restore their own orders
 */
async function unarchiveOrderForUser(req, res) {
  console.log("👤 [OrderController] User restoring order to history");
  console.log("   Order ID:", req.params.id);
  console.log("   User ID:", req.user?.userId);

  try {
    const orderId = parseInt(req.params.id);
    const userId = req.user.userId; // FIX: Changed from user_id to userId

    const result = await orderService.unarchiveOrderForUser(orderId, userId);

    res.status(200).json({
      success: true,
      message: "Pesanan berhasil dikembalikan ke riwayat",
      data: result,
    });
  } catch (error) {
    console.error(
      "❌ [OrderController] Error restoring order for user:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PUT /api/orders/:id/payment/finalize - Mark pending payment as paid and advance status
 */
async function finalizePayment(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID pesanan tidak valid" });
    }

    const result = await orderService.finalizePayment(orderId, userId);
    return res.status(200).json({ success: true, order: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/orders/:id/payment/cancel - Cancel pending payment and order
 */
async function cancelPayment(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.id);
    const { reason } = req.body || {};

    if (isNaN(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID pesanan tidak valid" });
    }

    const result = await orderService.cancelPayment(orderId, userId, reason);
    return res.status(200).json({ success: true, order: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/orders/:id/cancel-with-refund - Cancel paid order and request refund
 */
async function cancelPaidOrderWithRefund(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.id);
    const { reason } = req.body || {};

    if (isNaN(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID pesanan tidak valid" });
    }

    if (!reason || reason.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Alasan pembatalan wajib diisi" });
    }

    const result = await orderService.cancelPaidOrderWithRefund(
      orderId,
      userId,
      reason
    );
    return res.status(200).json({
      success: true,
      message: "Pesanan berhasil dibatalkan. Refund akan diproses oleh admin.",
      order: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getAllOrders,
  getOrderDetailsForAdmin,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  archiveOrder, // Admin archive
  unarchiveOrder, // Admin unarchive
  bulkArchiveOrders, // Admin bulk archive
  archiveOrderForUser, // User hide from history
  unarchiveOrderForUser, // User restore to history
  finalizePayment,
  cancelPayment,
  cancelPaidOrderWithRefund, // Cancel paid order with refund
};
