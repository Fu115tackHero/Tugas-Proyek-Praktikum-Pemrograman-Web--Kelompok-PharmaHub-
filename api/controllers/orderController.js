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

module.exports = {
  createOrder,
  getOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
