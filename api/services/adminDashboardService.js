const pool = require("../config/database");

/**
 * ============================================
 * ADMIN DASHBOARD SERVICE
 * ============================================
 * Service for admin dashboard statistics and data
 * Uses database VIEWs for optimized queries
 */

/**
 * Get dashboard statistics from admin_dashboard_stats VIEW
 */
async function getDashboardStats() {
  console.log("📊 [AdminDashboardService] Fetching dashboard statistics");

  try {
    const query = `
      SELECT 
        total_active_products,
        low_stock_products,
        today_orders,
        pending_orders,
        today_revenue,
        monthly_revenue,
        total_customers,
        new_customers_today
      FROM admin_dashboard_stats
    `;

    const { rows } = await pool.query(query);
    const stats = rows[0];

    console.log("✅ [AdminDashboardService] Stats retrieved:", stats);
    return {
      totalDrugs: parseInt(stats.total_active_products) || 0,
      lowStockDrugs: parseInt(stats.low_stock_products) || 0,
      todayOrders: parseInt(stats.today_orders) || 0,
      pendingOrders: parseInt(stats.pending_orders) || 0,
      todayRevenue: parseFloat(stats.today_revenue) || 0,
      monthlyRevenue: parseFloat(stats.monthly_revenue) || 0,
      totalCustomers: parseInt(stats.total_customers) || 0,
      newCustomersToday: parseInt(stats.new_customers_today) || 0,
    };
  } catch (error) {
    console.error(
      "❌ [AdminDashboardService] Error fetching stats:",
      error.message
    );
    throw error;
  }
}

/**
 * Get top selling products from top_selling_products VIEW
 */
async function getTopSellingProducts(limit = 10) {
  console.log("📊 [AdminDashboardService] Fetching top selling products");
  console.log("   Limit:", limit);

  try {
    const query = `
      SELECT 
        product_id,
        name,
        brand,
        price,
        stock,
        sold_count,
        total_orders,
        total_quantity_sold,
        total_revenue
      FROM top_selling_products
      WHERE total_quantity_sold > 0
      LIMIT $1
    `;

    const { rows } = await pool.query(query, [limit]);
    console.log(
      `✅ [AdminDashboardService] Found ${rows.length} top selling products`
    );
    return rows;
  } catch (error) {
    console.error(
      "❌ [AdminDashboardService] Error fetching top products:",
      error.message
    );
    throw error;
  }
}

/**
 * Get recent activity (orders, product changes, etc.)
 */
async function getRecentActivity(limit = 10) {
  console.log("📊 [AdminDashboardService] Fetching recent activity");
  console.log("   Limit:", limit);

  try {
    const query = `
      SELECT 
        aal.log_id,
        aal.action_type,
        aal.entity_type,
        aal.entity_name,
        aal.description,
        aal.created_at,
        u.name AS admin_name
      FROM admin_activity_logs aal
      LEFT JOIN users u ON u.user_id = aal.admin_id
      ORDER BY aal.created_at DESC
      LIMIT $1
    `;

    const { rows } = await pool.query(query, [limit]);

    const colorByAction = {
      CREATE: "green",
      UPDATE: "blue",
      DELETE: "red",
    };

    const activities = rows.map((row) => ({
      id: `activity-${row.log_id}`,
      type: row.action_type?.toLowerCase() || "info",
      message: buildActivityMessage(row),
      time: formatTimeAgo(row.created_at),
      color: colorByAction[row.action_type] || "gray",
      timestamp: row.created_at,
    }));

    console.log(
      `✅ [AdminDashboardService] Found ${activities.length} recent activities`
    );
    return activities;
  } catch (error) {
    console.error(
      "❌ [AdminDashboardService] Error fetching activity:",
      error.message
    );
    throw error;
  }
}

function buildActivityMessage(row) {
  const actor = row.admin_name ? `oleh ${row.admin_name}` : "oleh Admin";
  const entity = row.entity_type ? `${row.entity_type}` : "ENTITAS";
  const name = row.entity_name ? ` \u2014 ${row.entity_name}` : "";
  const actionMap = {
    CREATE: "Menambahkan",
    UPDATE: "Mengubah",
    DELETE: "Menghapus",
  };
  const action = actionMap[row.action_type] || "Aksi";
  const desc = row.description ? ` (${row.description})` : "";
  return `${action} ${entity}${name} ${actor}${desc}`;
}

/**
 * Get low stock products alert
 */
async function getLowStockAlerts() {
  console.log("📊 [AdminDashboardService] Fetching low stock alerts");

  try {
    const query = `
      SELECT 
        product_id,
        name,
        brand,
        stock,
        min_stock,
        price,
        main_image_url
      FROM products
      WHERE stock < min_stock AND is_active = TRUE
      ORDER BY stock ASC, name ASC
      LIMIT 20
    `;

    const { rows } = await pool.query(query);
    console.log(
      `✅ [AdminDashboardService] Found ${rows.length} low stock products`
    );
    return rows;
  } catch (error) {
    console.error(
      "❌ [AdminDashboardService] Error fetching low stock:",
      error.message
    );
    throw error;
  }
}

// Helper functions
function getActivityType(orderStatus) {
  const statusMap = {
    completed: "success",
    cancelled: "error",
    pending: "warning",
    preparing: "info",
    ready: "success",
  };
  return statusMap[orderStatus] || "info";
}

function getActivityColor(orderStatus) {
  const colorMap = {
    completed: "green",
    cancelled: "red",
    pending: "yellow",
    preparing: "blue",
    ready: "green",
  };
  return colorMap[orderStatus] || "gray";
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function formatTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  return past.toLocaleDateString("id-ID");
}

module.exports = {
  getDashboardStats,
  getTopSellingProducts,
  getRecentActivity,
  getLowStockAlerts,
};
