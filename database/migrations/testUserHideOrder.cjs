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

async function testUserHide() {
  console.log("\n=== TESTING USER HIDE ORDER ===\n");

  try {
    const orderId = 19;
    const userId = 2;

    console.log(`1️⃣ Testing hide order ${orderId} for user ${userId}...`);

    // Verify order exists
    const verifyQuery = `
      SELECT order_id, order_status FROM orders WHERE order_id = $1 AND user_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [orderId, userId]);

    if (verifyResult.rows.length === 0) {
      console.log("❌ Order not found or does not belong to user");
      return;
    }

    console.log(`✅ Order found: ${verifyResult.rows[0].order_status}`);
    const orderStatus = verifyResult.rows[0].order_status;

    // Check if already hidden
    const checkQuery = `
      SELECT history_id, is_hidden_from_user 
      FROM order_status_history 
      WHERE order_id = $1 
      ORDER BY changed_at DESC 
      LIMIT 1
    `;
    const checkResult = await pool.query(checkQuery, [orderId]);

    console.log(`\n2️⃣ Current status in history:`);
    if (checkResult.rows.length > 0) {
      console.log(`   History ID: ${checkResult.rows[0].history_id}`);
      console.log(`   Is Hidden: ${checkResult.rows[0].is_hidden_from_user}`);

      if (checkResult.rows[0].is_hidden_from_user) {
        console.log("   ⚠️  Already hidden");
        return;
      }
    } else {
      console.log("   ⚠️  No history entry found");
    }

    // Try to hide
    console.log(`\n3️⃣ Attempting to hide order...`);
    const hideQuery = `
      INSERT INTO order_status_history (
        order_id, 
        old_status, 
        new_status, 
        notes, 
        is_hidden_from_user
      )
      VALUES ($1, $2, $2, 'Hidden from user history view', TRUE)
      RETURNING *
    `;

    try {
      const result = await pool.query(hideQuery, [orderId, orderStatus]);
      console.log("✅ Order hidden successfully!");
      console.log("   History ID:", result.rows[0].history_id);
      console.log("   Order ID:", result.rows[0].order_id);
      console.log("   Is Hidden:", result.rows[0].is_hidden_from_user);
    } catch (err) {
      console.log("❌ Error hiding order:");
      console.log("   Message:", err.message);
      console.log("   Code:", err.code);
      console.log("   Detail:", err.detail);
    }

    // Verify hide worked
    console.log(`\n4️⃣ Verifying hide...`);
    const verifyHideQuery = `
      SELECT o.order_id, o.order_number
      FROM orders o
      WHERE o.user_id = $1 
        AND o.order_id = $2
        AND NOT EXISTS (
          SELECT 1 FROM order_status_history osh 
          WHERE osh.order_id = o.order_id 
          AND osh.is_hidden_from_user = TRUE
        )
    `;
    const verifyHideResult = await pool.query(verifyHideQuery, [
      userId,
      orderId,
    ]);

    if (verifyHideResult.rows.length === 0) {
      console.log("✅ Order successfully hidden from user view");
    } else {
      console.log("❌ Order still visible (hide failed)");
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
    console.error("   Stack:", error.stack);
  } finally {
    await pool.end();
  }
}

testUserHide();
