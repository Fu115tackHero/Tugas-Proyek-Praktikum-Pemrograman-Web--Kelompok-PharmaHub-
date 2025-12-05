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

async function checkSync() {
  console.log("\n=== CHECKING ORDER & ORDER_STATUS_HISTORY SYNC ===\n");

  try {
    // 1. Check all orders
    console.log("1️⃣ Checking all orders...");
    const ordersResult = await pool.query(`
      SELECT order_id, order_number, user_id, order_status, is_archived, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log(`✅ Found ${ordersResult.rows.length} recent orders`);
    ordersResult.rows.forEach((o) => {
      console.log(
        `   - Order ${o.order_number} (ID: ${o.order_id}, User: ${o.user_id}, Status: ${o.order_status}, Archived: ${o.is_archived})`
      );
    });

    // 2. Check order_status_history
    console.log("\n2️⃣ Checking order_status_history...");
    const historyResult = await pool.query(`
      SELECT 
        osh.history_id,
        osh.order_id,
        o.order_number,
        osh.old_status,
        osh.new_status,
        osh.is_hidden_from_user,
        osh.notes,
        osh.changed_at
      FROM order_status_history osh
      LEFT JOIN orders o ON osh.order_id = o.order_id
      ORDER BY osh.changed_at DESC
      LIMIT 10
    `);
    console.log(`✅ Found ${historyResult.rows.length} history entries`);
    historyResult.rows.forEach((h) => {
      console.log(
        `   - Order ${h.order_number || "N/A"} (ID: ${h.order_id}): ${
          h.old_status
        } → ${h.new_status}, Hidden: ${h.is_hidden_from_user}, Notes: ${
          h.notes || "N/A"
        }`
      );
    });

    // 3. Check for orders WITHOUT history entry
    console.log("\n3️⃣ Checking orders without status history...");
    const noHistoryResult = await pool.query(`
      SELECT o.order_id, o.order_number, o.order_status
      FROM orders o
      WHERE NOT EXISTS (
        SELECT 1 FROM order_status_history osh
        WHERE osh.order_id = o.order_id
      )
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    if (noHistoryResult.rows.length > 0) {
      console.log(
        `⚠️  Found ${noHistoryResult.rows.length} orders WITHOUT status history:`
      );
      noHistoryResult.rows.forEach((o) => {
        console.log(
          `   - Order ${o.order_number} (ID: ${o.order_id}, Status: ${o.order_status})`
        );
      });
      console.log("\n💡 These orders need initial history entries");
    } else {
      console.log("✅ All orders have status history");
    }

    // 4. Create missing history entries
    if (noHistoryResult.rows.length > 0) {
      console.log("\n4️⃣ Creating missing history entries...");
      for (const order of noHistoryResult.rows) {
        await pool.query(
          `
          INSERT INTO order_status_history (
            order_id, old_status, new_status, notes, is_hidden_from_user
          )
          VALUES ($1, NULL, $2, 'Initial status', FALSE)
        `,
          [order.order_id, order.order_status]
        );
        console.log(`   ✅ Created history for Order ${order.order_number}`);
      }
      console.log("✅ All missing history entries created");
    }

    // 5. Check specific order (order_id = 19 & 22 from error)
    console.log("\n5️⃣ Checking specific orders from error...");
    const specificOrders = await pool.query(`
      SELECT 
        o.order_id,
        o.order_number,
        o.user_id,
        o.order_status,
        o.is_archived,
        EXISTS(
          SELECT 1 FROM order_status_history osh
          WHERE osh.order_id = o.order_id
        ) as has_history,
        EXISTS(
          SELECT 1 FROM order_status_history osh
          WHERE osh.order_id = o.order_id AND osh.is_hidden_from_user = TRUE
        ) as is_hidden
      FROM orders o
      WHERE o.order_id IN (19, 22)
    `);

    if (specificOrders.rows.length > 0) {
      specificOrders.rows.forEach((o) => {
        console.log(`\n   Order ID: ${o.order_id}`);
        console.log(`   Number: ${o.order_number}`);
        console.log(`   User: ${o.user_id}`);
        console.log(`   Status: ${o.order_status}`);
        console.log(`   Has History: ${o.has_history}`);
        console.log(`   Is Hidden: ${o.is_hidden}`);
      });
    } else {
      console.log("   ⚠️  Orders 19 and 22 not found");
    }

    console.log("\n=== SYNC CHECK COMPLETE ===");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkSync();
