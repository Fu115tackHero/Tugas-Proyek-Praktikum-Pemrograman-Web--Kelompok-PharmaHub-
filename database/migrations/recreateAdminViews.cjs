require("dotenv").config({ path: "./api/.env" });
require("dotenv").config({ path: "./.env" });

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Lavotsirc534231",
  database: process.env.DB_NAME || "pharmahub_db",
});

async function recreateAdminViews() {
  console.log("\n🔧 Recreating Admin Dashboard VIEWs...\n");

  try {
    // Drop existing views
    console.log("1️⃣ Dropping existing views...");
    await pool.query(`DROP VIEW IF EXISTS admin_dashboard_stats CASCADE;`);
    await pool.query(`DROP VIEW IF EXISTS top_selling_products CASCADE;`);
    console.log("✅ Old views dropped");

    // Create admin_dashboard_stats VIEW
    console.log("\n2️⃣ Creating admin_dashboard_stats VIEW...");
    await pool.query(`
      CREATE VIEW admin_dashboard_stats AS
      SELECT 
        (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as total_active_products,
        (SELECT COUNT(*) FROM products WHERE stock < min_stock) as low_stock_products,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as today_orders,
        (SELECT COUNT(*) FROM orders WHERE order_status IN ('pending', 'confirmed', 'preparing')) as pending_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND order_status = 'completed') as today_revenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND order_status = 'completed') as monthly_revenue,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE) as new_customers_today;
    `);
    console.log("✅ admin_dashboard_stats VIEW created");

    // Create top_selling_products VIEW
    console.log("\n3️⃣ Creating top_selling_products VIEW...");
    await pool.query(`
      CREATE VIEW top_selling_products AS
      SELECT 
        p.product_id,
        p.name,
        p.brand,
        p.price,
        p.stock,
        p.sold_count,
        COUNT(DISTINCT oi.order_id) as total_orders,
        SUM(oi.quantity) as total_quantity_sold,
        SUM(oi.subtotal) as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.order_id AND o.order_status = 'completed'
      WHERE p.is_active = TRUE
      GROUP BY p.product_id, p.name, p.brand, p.price, p.stock, p.sold_count
      ORDER BY total_quantity_sold DESC NULLS LAST;
    `);
    console.log("✅ top_selling_products VIEW created");

    // Verify views
    console.log("\n4️⃣ Verifying views...");
    const viewsCheck = await pool.query(`
      SELECT viewname, definition 
      FROM pg_views 
      WHERE viewname IN ('admin_dashboard_stats', 'top_selling_products')
      ORDER BY viewname;
    `);

    console.log(`✅ Found ${viewsCheck.rows.length} views:`);
    viewsCheck.rows.forEach((view) => {
      console.log(`   - ${view.viewname}`);
    });

    // Test query
    console.log("\n5️⃣ Testing admin_dashboard_stats query...");
    const testResult = await pool.query(`SELECT * FROM admin_dashboard_stats;`);
    console.log("✅ Query successful:");
    console.log("   Stats:", testResult.rows[0]);

    console.log("\n✅ All VIEWs recreated successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("   Details:", error.detail || "No additional details");
  } finally {
    await pool.end();
  }
}

recreateAdminViews();
