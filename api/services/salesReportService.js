const pool = require("../config/database");

/**
 * Get all sales reports with optional date filtering
 */
async function getAllSalesReports(startDate = null, endDate = null) {
  console.log("📊 [SalesReportService] Fetching all sales reports");
  console.log("   Start date:", startDate);
  console.log("   End date:", endDate);

  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected successfully");

    let query = `
      SELECT 
        sr.report_id,
        sr.report_date,
        sr.total_orders,
        sr.completed_orders,
        sr.cancelled_orders,
        sr.total_revenue,
        sr.total_tax,
        sr.total_discount,
        sr.net_revenue,
        sr.top_selling_product_id,
        sr.top_selling_quantity,
        sr.generated_at,
        sr.updated_at,
        p.name as top_selling_product_name
      FROM sales_reports sr
      LEFT JOIN products p ON sr.top_selling_product_id = p.product_id
    `;

    const params = [];
    const conditions = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`sr.report_date >= $${params.length}`);
    }

    if (endDate) {
      params.push(endDate);
      conditions.push(`sr.report_date <= $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY sr.report_date DESC`;

    console.log("   Query:", query);
    console.log("   Params:", params);

    const { rows } = await pool.query(query, params);

    console.log(`✅ Found ${rows.length} sales reports`);
    return rows;
  } catch (error) {
    console.error("❌ Error fetching sales reports:", error.message);
    throw error;
  }
}

/**
 * Get sales report by ID
 */
async function getSalesReportById(id) {
  console.log(`📊 [SalesReportService] Fetching sales report ID: ${id}`);

  try {
    const query = `
      SELECT 
        sr.report_id,
        sr.report_date,
        sr.total_orders,
        sr.completed_orders,
        sr.cancelled_orders,
        sr.total_revenue,
        sr.total_tax,
        sr.total_discount,
        sr.net_revenue,
        sr.top_selling_product_id,
        sr.top_selling_quantity,
        sr.generated_at,
        sr.updated_at,
        p.name as top_selling_product_name
      FROM sales_reports sr
      LEFT JOIN products p ON sr.top_selling_product_id = p.product_id
      WHERE sr.report_id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      console.log("   Report not found");
      return null;
    }

    console.log("✅ Sales report retrieved");
    return rows[0];
  } catch (error) {
    console.error("❌ Error fetching sales report:", error.message);
    throw error;
  }
}

/**
 * Create new sales report
 */
async function createSalesReport(data) {
  console.log("📊 [SalesReportService] Creating new sales report");
  console.log("   Data:", JSON.stringify(data, null, 2));

  const {
    report_date,
    total_orders = 0,
    completed_orders = 0,
    cancelled_orders = 0,
    total_revenue = 0,
    total_tax = 0,
    total_discount = 0,
    net_revenue = 0,
    top_selling_product_id = null,
    top_selling_quantity = 0,
  } = data;

  try {
    const query = `
      INSERT INTO sales_reports (
        report_date,
        total_orders,
        completed_orders,
        cancelled_orders,
        total_revenue,
        total_tax,
        total_discount,
        net_revenue,
        top_selling_product_id,
        top_selling_quantity
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      report_date,
      total_orders,
      completed_orders,
      cancelled_orders,
      total_revenue,
      total_tax,
      total_discount,
      net_revenue,
      top_selling_product_id,
      top_selling_quantity,
    ];

    console.log("   Values:", values);

    const { rows } = await pool.query(query, values);

    console.log("✅ Sales report created:", rows[0].report_id);
    return rows[0];
  } catch (error) {
    console.error("❌ Error creating sales report:", error.message);
    throw error;
  }
}

/**
 * Update sales report
 */
async function updateSalesReport(id, data) {
  console.log(`📊 [SalesReportService] Updating sales report ID: ${id}`);
  console.log("   Data:", JSON.stringify(data, null, 2));

  const {
    report_date,
    total_orders,
    completed_orders,
    cancelled_orders,
    total_revenue,
    total_tax,
    total_discount,
    net_revenue,
    top_selling_product_id,
    top_selling_quantity,
  } = data;

  try {
    const query = `
      UPDATE sales_reports
      SET
        report_date = COALESCE($1, report_date),
        total_orders = COALESCE($2, total_orders),
        completed_orders = COALESCE($3, completed_orders),
        cancelled_orders = COALESCE($4, cancelled_orders),
        total_revenue = COALESCE($5, total_revenue),
        total_tax = COALESCE($6, total_tax),
        total_discount = COALESCE($7, total_discount),
        net_revenue = COALESCE($8, net_revenue),
        top_selling_product_id = COALESCE($9, top_selling_product_id),
        top_selling_quantity = COALESCE($10, top_selling_quantity),
        updated_at = CURRENT_TIMESTAMP
      WHERE report_id = $11
      RETURNING *
    `;

    const values = [
      report_date,
      total_orders,
      completed_orders,
      cancelled_orders,
      total_revenue,
      total_tax,
      total_discount,
      net_revenue,
      top_selling_product_id,
      top_selling_quantity,
      id,
    ];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      console.log("   Report not found");
      return null;
    }

    console.log("✅ Sales report updated");
    return rows[0];
  } catch (error) {
    console.error("❌ Error updating sales report:", error.message);
    throw error;
  }
}

/**
 * Delete sales report
 */
async function deleteSalesReport(id) {
  console.log(`📊 [SalesReportService] Deleting sales report ID: ${id}`);

  try {
    const query = `
      DELETE FROM sales_reports
      WHERE report_id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      console.log("   Report not found");
      return null;
    }

    console.log("✅ Sales report deleted");
    return rows[0];
  } catch (error) {
    console.error("❌ Error deleting sales report:", error.message);
    throw error;
  }
}

/**
 * Get summary statistics
 */
async function getSalesSummary(startDate = null, endDate = null) {
  console.log("📊 [SalesReportService] Fetching sales summary");
  console.log("   Start date:", startDate);
  console.log("   End date:", endDate);

  try {
    let query = `
      SELECT 
        COUNT(*) as total_reports,
        SUM(total_orders) as total_orders,
        SUM(completed_orders) as total_completed,
        SUM(cancelled_orders) as total_cancelled,
        SUM(total_revenue) as total_revenue,
        SUM(total_tax) as total_tax,
        SUM(total_discount) as total_discount,
        SUM(net_revenue) as total_net_revenue,
        AVG(net_revenue) as avg_daily_revenue
      FROM sales_reports
    `;

    const params = [];
    const conditions = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`report_date >= $${params.length}`);
    }

    if (endDate) {
      params.push(endDate);
      conditions.push(`report_date <= $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const { rows } = await pool.query(query, params);

    console.log("✅ Sales summary retrieved");
    return rows[0];
  } catch (error) {
    console.error("❌ Error fetching sales summary:", error.message);
    throw error;
  }
}

module.exports = {
  getAllSalesReports,
  getSalesReportById,
  createSalesReport,
  updateSalesReport,
  deleteSalesReport,
  getSalesSummary,
};
