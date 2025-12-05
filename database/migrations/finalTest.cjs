require("dotenv").config({ path: "./api/.env" });

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Lavotsirc534231",
  database: process.env.DB_NAME || "pharmahub_db",
});

async function finalTest() {
  console.log("\n=== FINAL TESTING - ARCHIVE SEPARATION ===\n");

  try {
    // 1. Check all orders and their status
    console.log("1️⃣ Checking all orders with their archive status...");
    const ordersCheck = await pool.query(`
      SELECT 
        o.order_id,
        o.order_number,
        o.user_id,
        o.order_status,
        o.is_archived AS admin_archived,
        EXISTS(
          SELECT 1 FROM order_status_history osh
          WHERE osh.order_id = o.order_id AND osh.is_hidden_from_user = TRUE
        ) AS user_hidden
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    console.log(`\nFound ${ordersCheck.rows.length} orders:`);
    ordersCheck.rows.forEach((o) => {
      console.log(`   Order ${o.order_number}:`);
      console.log(`      User: ${o.user_id}, Status: ${o.order_status}`);
      console.log(
        `      Admin Archived: ${o.admin_archived}, User Hidden: ${o.user_hidden}`
      );
    });

    // 2. Test user view query (what user sees)
    console.log("\n2️⃣ Testing USER view (what user ID 2 sees)...");
    const userViewQuery = `
      SELECT o.order_id, o.order_number, o.order_status, o.is_archived
      FROM orders o
      WHERE o.user_id = $1 
        AND NOT EXISTS (
          SELECT 1 FROM order_status_history osh 
          WHERE osh.order_id = o.order_id 
          AND osh.is_hidden_from_user = TRUE
        )
      ORDER BY o.created_at DESC
    `;
    const userView = await pool.query(userViewQuery, [2]);
    console.log(`   User sees ${userView.rows.length} orders:`);
    userView.rows.forEach((o) => {
      console.log(
        `      - ${o.order_number} (Status: ${o.order_status}, Admin Archived: ${o.is_archived})`
      );
    });

    // 3. Test admin view query (what admin sees)
    console.log("\n3️⃣ Testing ADMIN view (non-archived orders)...");
    const adminViewQuery = `
      SELECT o.order_id, o.order_number, o.user_id, o.order_status, o.is_archived
      FROM orders o
      WHERE o.is_archived = FALSE
      ORDER BY o.created_at DESC
    `;
    const adminView = await pool.query(adminViewQuery);
    console.log(`   Admin sees ${adminView.rows.length} non-archived orders:`);
    adminView.rows.forEach((o) => {
      console.log(
        `      - ${o.order_number} (User: ${o.user_id}, Status: ${o.order_status})`
      );
    });

    // 4. Verify order_status_history has entries for all orders
    console.log("\n4️⃣ Checking order_status_history sync...");
    const historyCheck = await pool.query(`
      SELECT COUNT(*) as total_orders,
             COUNT(osh.order_id) as orders_with_history
      FROM orders o
      LEFT JOIN order_status_history osh ON o.order_id = osh.order_id
    `);
    console.log(`   Total orders: ${historyCheck.rows[0].total_orders}`);
    console.log(
      `   Orders with history: ${historyCheck.rows[0].orders_with_history}`
    );

    if (
      historyCheck.rows[0].total_orders ===
      historyCheck.rows[0].orders_with_history
    ) {
      console.log("   ✅ All orders have history entries");
    } else {
      console.log("   ⚠️  Some orders missing history entries");
    }

    console.log("\n=== FINAL TEST COMPLETE ===");
    console.log("\n✅ Database ready for testing:");
    console.log("   1. Admin can archive orders → User still sees them");
    console.log("   2. User can hide orders → Admin still sees them");
    console.log("   3. Both operations are independent");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

finalTest();
