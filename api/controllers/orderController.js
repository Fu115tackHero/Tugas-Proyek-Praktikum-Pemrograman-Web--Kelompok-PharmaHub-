const { query } = require("../config/database");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  // Query to get all orders with items
  const result = await query(`
    SELECT 
      o.order_id,
      o.order_number,
      o.user_id,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      o.subtotal,
      o.tax_amount,
      o.discount_amount,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.notes,
      o.created_at,
      o.updated_at,
      json_agg(
        json_build_object(
          'item_id', oi.order_item_id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.product_price,
          'total_price', oi.subtotal
        )
      ) FILTER (WHERE oi.order_item_id IS NOT NULL) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    GROUP BY o.order_id
    ORDER BY o.created_at DESC
  `);

  // Map to frontend format
  const orders = result.rows.map(order => ({
    id: order.order_number, // Frontend expects string ID like 'ORD-...'
    dbId: order.order_id,
    userId: order.user_id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    date: order.created_at,
    status: order.order_status,
    total: parseFloat(order.total_amount),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    items: order.items || []
  }));

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params; // This is order_number or order_id? Let's assume order_id for DB, but frontend sends order_number usually.
  // Let's handle both or assume ID. The frontend uses order.id which is mapped to order_number.
  // But for API updates, using the numeric ID is safer if we have it, or we query by order_number.
  
  const { status } = req.body;

  if (!status) {
    throw new AppError("Status is required", 400);
  }

  // Check if order exists
  // We'll try to find by order_number first (since frontend uses it as ID)
  let result = await query("SELECT * FROM orders WHERE order_number = $1", [id]);
  
  if (result.rows.length === 0) {
    // Try by numeric ID just in case
    if (!isNaN(id)) {
      result = await query("SELECT * FROM orders WHERE order_id = $1", [id]);
    }
  }

  if (result.rows.length === 0) {
    throw new AppError("Order not found", 404);
  }

  const order = result.rows[0];

  // Update status
  const updateResult = await query(
    "UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *",
    [status, order.order_id]
  );

  res.json({
    success: true,
    message: "Order status updated",
    data: {
      id: updateResult.rows[0].order_number,
      status: updateResult.rows[0].order_status,
      updatedAt: updateResult.rows[0].updated_at
    }
  });
});

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Public (or Private if auth required)
 */
const createOrder = asyncHandler(async (req, res) => {
  const {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    items, // Array of { productId, productName, quantity, price }
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    paymentMethod,
    paymentStatus,
    notes,
    couponCode
  } = req.body;

  // Validate required fields
  if (!customerName || !customerPhone || !items || items.length === 0) {
    throw new AppError("Data pesanan tidak lengkap", 400);
  }

  // Generate order number
  const orderNumber = `PHARMAHUB-${Date.now()}`;

  // Start transaction
  const client = await require("../config/database").pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert order
    const orderResult = await client.query(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        subtotal, tax_amount, discount_amount, total_amount,
        payment_method, payment_status, order_status, notes, coupon_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        orderNumber,
        userId || null,
        customerName,
        customerEmail || null,
        customerPhone,
        subtotal || 0,
        taxAmount || 0,
        discountAmount || 0,
        totalAmount,
        paymentMethod === 'bayar_ditempat' ? 'bayar_ditempat' : 'pembayaran_online',
        paymentStatus || 'pending',
        'pending',
        notes || null,
        couponCode || null
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.order_id,
          item.productId || item.id,
          item.productName || item.name,
          item.price,
          item.quantity,
          item.price * item.quantity
        ]
      );

      // Update product stock
      await client.query(
        `UPDATE products SET stock = stock - $1, sold_count = sold_count + $1 WHERE product_id = $2`,
        [item.quantity, item.productId || item.id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: {
        orderId: order.order_id,
        orderNumber: order.order_number,
        status: order.order_status,
        paymentStatus: order.payment_status,
        total: parseFloat(order.total_amount),
        createdAt: order.created_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

/**
 * @desc    Get orders by user ID
 * @route   GET /api/orders/user/:userId
 * @access  Private
 */
const getOrdersByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await query(`
    SELECT 
      o.order_id,
      o.order_number,
      o.user_id,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      o.subtotal,
      o.tax_amount,
      o.discount_amount,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.notes,
      o.coupon_code,
      o.created_at,
      o.updated_at,
      json_agg(
        json_build_object(
          'item_id', oi.order_item_id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.product_price,
          'total_price', oi.subtotal
        )
      ) FILTER (WHERE oi.order_item_id IS NOT NULL) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.user_id = $1
    GROUP BY o.order_id
    ORDER BY o.created_at DESC
  `, [userId]);

  const orders = result.rows.map(order => ({
    id: order.order_number,
    dbId: order.order_id,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
    date: order.created_at,
    status: order.order_status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    total: parseFloat(order.total_amount),
    subtotal: parseFloat(order.subtotal),
    tax: parseFloat(order.tax_amount),
    discount: parseFloat(order.discount_amount),
    couponCode: order.coupon_code,
    notes: order.notes,
    items: order.items || []
  }));

  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

module.exports = {
  getAllOrders,
  updateOrderStatus,
  createOrder,
  getOrdersByUser
};
