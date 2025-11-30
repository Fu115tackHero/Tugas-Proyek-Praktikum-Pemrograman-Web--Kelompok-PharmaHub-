const pool = require("../config/database");

/**
 * ============================================
 * AUTO SALES REPORT SERVICE
 * ============================================
 * Auto-generate sales reports from completed orders
 * Includes: revenue tracking, low stock alerts, transaction details
 * Export: CSV, PDF, JSON
 */

/**
 * AUTO-GENERATE sales report from completed orders
 * Aggregates data from orders table where order_status = 'completed'
 */
async function generateSalesReport(startDate = null, endDate = null) {
  console.log("📊 [AutoSalesReport] Auto-generating sales report");
  console.log("   Start date:", startDate);
  console.log("   End date:", endDate);

  try {
    let dateFilter = "";
    const params = [];

    if (startDate && endDate) {
      dateFilter =
        "AND DATE(o.created_at) >= $1::date AND DATE(o.created_at) <= $2::date";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = "AND DATE(o.created_at) >= $1::date";
      params.push(startDate);
    } else if (endDate) {
      dateFilter = "AND DATE(o.created_at) <= $1::date";
      params.push(endDate);
    }

    // Aggregate sales data from completed orders
    const query = `
      SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT CASE WHEN o.order_status = 'completed' THEN o.order_id END) as completed_orders,
        COUNT(DISTINCT CASE WHEN o.order_status = 'cancelled' THEN o.order_id END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN o.order_status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN o.order_status = 'completed' THEN o.tax_amount ELSE 0 END), 0) as total_tax,
        COALESCE(SUM(CASE WHEN o.order_status = 'completed' THEN o.discount_amount ELSE 0 END), 0) as total_discount,
        COALESCE(SUM(CASE WHEN o.order_status = 'completed' THEN (o.total_amount - COALESCE(o.tax_amount, 0) - COALESCE(o.discount_amount, 0)) ELSE 0 END), 0) as net_revenue,
        MIN(o.created_at) as period_start,
        MAX(o.created_at) as period_end
      FROM orders o
      WHERE o.order_status IN ('completed', 'cancelled')
      ${dateFilter}
    `;

    const { rows } = await pool.query(query, params);
    const reportData = rows[0];

    console.log("   Orders data:", reportData);

    // Find top selling product
    let topProductQuery = `
      SELECT 
        oi.product_id,
        p.name as product_name,
        SUM(oi.quantity) as total_quantity
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.order_status = 'completed'
      ${dateFilter}
      GROUP BY oi.product_id, p.name
      ORDER BY total_quantity DESC
      LIMIT 1
    `;

    const topProductResult = await pool.query(topProductQuery, params);
    const topProduct = topProductResult.rows[0] || {};

    console.log("   Top product:", topProduct);

    const result = {
      period_start: reportData.period_start,
      period_end: reportData.period_end,
      total_orders: parseInt(reportData.total_orders) || 0,
      completed_orders: parseInt(reportData.completed_orders) || 0,
      cancelled_orders: parseInt(reportData.cancelled_orders) || 0,
      total_revenue: parseFloat(reportData.total_revenue) || 0,
      total_tax: parseFloat(reportData.total_tax) || 0,
      total_discount: parseFloat(reportData.total_discount) || 0,
      net_revenue: parseFloat(reportData.net_revenue) || 0,
      top_selling_product_id: topProduct.product_id || null,
      top_selling_product_name: topProduct.product_name || null,
      top_selling_quantity: parseInt(topProduct.total_quantity) || 0,
    };

    console.log("✅ [AutoSalesReport] Report generated successfully");
    console.log("   Result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(
      "❌ [AutoSalesReport] Error generating report:",
      error.message
    );
    console.error("   Stack:", error.stack);
    throw error;
  }
}

/**
 * Get low stock products (stock < 10)
 */
async function getLowStockProducts() {
  console.log("📊 [AutoSalesReport] Fetching low stock products");

  try {
    const query = `
      SELECT 
        product_id,
        name,
        brand,
        stock,
        min_stock,
        price,
        category_id,
        main_image_url
      FROM products
      WHERE stock < 10 AND is_active = TRUE
      ORDER BY stock ASC, name ASC
    `;

    const { rows } = await pool.query(query);
    console.log(`✅ [AutoSalesReport] Found ${rows.length} low stock products`);
    return rows;
  } catch (error) {
    console.error(
      "❌ [AutoSalesReport] Error fetching low stock:",
      error.message
    );
    throw error;
  }
}

/**
 * Get completed transactions with details
 */
async function getCompletedTransactions(
  startDate = null,
  endDate = null,
  limit = 100
) {
  console.log("📊 [AutoSalesReport] Fetching completed transactions");
  console.log("   Start date:", startDate);
  console.log("   End date:", endDate);
  console.log("   Limit:", limit);

  try {
    let dateFilter = "";
    const params = [];

    if (startDate && endDate) {
      dateFilter =
        "AND DATE(o.created_at) >= $1::date AND DATE(o.created_at) <= $2::date";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = "AND DATE(o.created_at) >= $1::date";
      params.push(startDate);
    } else if (endDate) {
      dateFilter = "AND DATE(o.created_at) <= $1::date";
      params.push(endDate);
    }

    params.push(limit);

    const query = `
      SELECT 
        o.order_id,
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.payment_method,
        o.payment_status,
        o.subtotal,
        o.tax_amount,
        o.discount_amount,
        o.total_amount,
        o.coupon_code,
        o.completed_at,
        o.created_at,
        COUNT(oi.order_item_id) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.order_status = 'completed'
      ${dateFilter}
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
      LIMIT $${params.length}
    `;

    const { rows } = await pool.query(query, params);
    console.log(
      `✅ [AutoSalesReport] Found ${rows.length} completed transactions`
    );
    return rows;
  } catch (error) {
    console.error(
      "❌ [AutoSalesReport] Error fetching transactions:",
      error.message
    );
    throw error;
  }
}

/**
 * Get transaction details (order items)
 */
async function getTransactionDetails(orderId) {
  console.log(
    "📊 [AutoSalesReport] Fetching transaction details for order:",
    orderId
  );

  try {
    const query = `
      SELECT 
        oi.order_item_id,
        oi.product_id,
        oi.product_name,
        oi.product_price,
        oi.quantity,
        oi.subtotal,
        p.main_image_url,
        p.brand
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
    `;

    const { rows } = await pool.query(query, [orderId]);
    console.log(
      `✅ [AutoSalesReport] Found ${rows.length} items for order ${orderId}`
    );
    return rows;
  } catch (error) {
    console.error(
      "❌ [AutoSalesReport] Error fetching transaction details:",
      error.message
    );
    throw error;
  }
}

/**
 * Generate CSV export data with product details
 */
async function generateCSV(transactions) {
  console.log(
    "📄 [AutoSalesReport] Generating CSV export with product details"
  );

  try {
    // Fetch all order items for all transactions
    const orderIds = transactions.map((t) => t.order_id);

    const itemsQuery = `
      SELECT 
        oi.order_id,
        oi.product_name,
        oi.product_price,
        oi.quantity,
        oi.subtotal,
        p.brand
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ANY($1::int[])
      ORDER BY oi.order_id, oi.order_item_id
    `;

    const { rows: allItems } = await pool.query(itemsQuery, [orderIds]);

    // Group items by order_id
    const itemsByOrder = {};
    allItems.forEach((item) => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    });

    const headers = [
      "Order Number",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Payment Method",
      "Payment Status",
      "Product Name",
      "Brand",
      "Unit Price",
      "Quantity",
      "Product Subtotal",
      "Order Subtotal",
      "Tax",
      "Discount",
      "Total Amount",
      "Coupon Code",
      "Created At",
    ];

    let csv = headers.join(",") + "\n";

    transactions.forEach((t) => {
      const items = itemsByOrder[t.order_id] || [];

      if (items.length === 0) {
        // If no items, still show the transaction
        const row = [
          `"${t.order_number || ""}"`,
          `"${t.customer_name || ""}"`,
          `"${t.customer_phone || ""}"`,
          `"${t.customer_email || ""}"`,
          `"${t.payment_method || ""}"`,
          `"${t.payment_status || ""}"`,
          `"No items"`,
          `""`,
          0,
          0,
          0,
          t.subtotal || 0,
          t.tax_amount || 0,
          t.discount_amount || 0,
          t.total_amount || 0,
          `"${t.coupon_code || ""}"`,
          `"${t.created_at || ""}"`,
        ];
        csv += row.join(",") + "\n";
      } else {
        // Show each product in separate row
        items.forEach((item, index) => {
          const row = [
            `"${t.order_number || ""}"`,
            `"${t.customer_name || ""}"`,
            `"${t.customer_phone || ""}"`,
            `"${t.customer_email || ""}"`,
            `"${t.payment_method || ""}"`,
            `"${t.payment_status || ""}"`,
            `"${item.product_name || ""}"`,
            `"${item.brand || ""}"`,
            item.product_price || 0,
            item.quantity || 0,
            item.subtotal || 0,
            index === 0 ? t.subtotal || 0 : "", // Only show on first item
            index === 0 ? t.tax_amount || 0 : "",
            index === 0 ? t.discount_amount || 0 : "",
            index === 0 ? t.total_amount || 0 : "",
            index === 0 ? `"${t.coupon_code || ""}"` : '""',
            index === 0 ? `"${t.created_at || ""}"` : '""',
          ];
          csv += row.join(",") + "\n";
        });
      }
    });

    console.log("✅ [AutoSalesReport] CSV generated with product details");
    return csv;
  } catch (error) {
    console.error("❌ [AutoSalesReport] Error generating CSV:", error.message);
    throw error;
  }
}

/**
 * Generate JSON export data with product details
 */
async function generateJSON(report, transactions, lowStock) {
  console.log(
    "📄 [AutoSalesReport] Generating JSON export with product details"
  );

  try {
    // Fetch all order items for all transactions
    const orderIds = transactions.map((t) => t.order_id);

    const itemsQuery = `
      SELECT 
        oi.order_id,
        oi.order_item_id,
        oi.product_id,
        oi.product_name,
        oi.product_price,
        oi.quantity,
        oi.subtotal,
        p.brand,
        p.main_image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ANY($1::int[])
      ORDER BY oi.order_id, oi.order_item_id
    `;

    const { rows: allItems } = await pool.query(itemsQuery, [orderIds]);

    // Group items by order_id
    const itemsByOrder = {};
    allItems.forEach((item) => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    });

    // Add items to each transaction
    const transactionsWithItems = transactions.map((t) => ({
      ...t,
      items: itemsByOrder[t.order_id] || [],
      items_count: (itemsByOrder[t.order_id] || []).length,
      items_total_quantity: (itemsByOrder[t.order_id] || []).reduce(
        (sum, item) => sum + parseInt(item.quantity),
        0
      ),
    }));

    const data = {
      generated_at: new Date().toISOString(),
      summary: report,
      transactions: transactionsWithItems,
      total_transactions: transactionsWithItems.length,
      total_items: transactionsWithItems.reduce(
        (sum, t) => sum + t.items_count,
        0
      ),
      low_stock_products: lowStock,
    };

    console.log("✅ [AutoSalesReport] JSON generated with product details");
    return data;
  } catch (error) {
    console.error("❌ [AutoSalesReport] Error generating JSON:", error.message);
    throw error;
  }
}

module.exports = {
  generateSalesReport,
  getLowStockProducts,
  getCompletedTransactions,
  getTransactionDetails,
  generateCSV,
  generateJSON,
};
