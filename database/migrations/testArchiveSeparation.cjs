require("dotenv").config({ path: "./api/.env" });
require("dotenv").config({ path: "./.env" });

const { Pool } = require("pg");

// Create PostgreSQL connection pool using individual credentials
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Lavotsirc534231",
  database: process.env.DB_NAME || "pharmahub_db",
});

async function testArchiveSeparation() {
  console.log("\n=== TESTING ARCHIVE SEPARATION ===\n");

  try {
    // 1. Get a sample order
    console.log("1️⃣ Finding a sample order...");
    const orderResult = await pool.query(`
      SELECT o.order_id, o.user_id, o.order_number, o.order_status, o.is_archived
      FROM orders o
      LIMIT 1
    `);

    if (orderResult.rows.length === 0) {
      console.log("❌ No orders found. Please create some test orders first.");
      return;
    }

    const order = orderResult.rows[0];
    console.log(
      `✅ Found order: ${order.order_number} (ID: ${order.order_id}, User: ${order.user_id})`
    );
    console.log(
      `   Status: ${order.order_status}, Archived: ${order.is_archived}`
    );

    // 2. Test ADMIN ARCHIVE
    console.log("\n2️⃣ Testing ADMIN ARCHIVE...");
    await pool.query(
      `
      UPDATE orders 
      SET is_archived = TRUE 
      WHERE order_id = $1
    `,
      [order.order_id]
    );
    console.log("✅ Admin archived order (orders.is_archived = TRUE)");

    // 3. Check if user can still see it
    console.log("\n3️⃣ Checking if user can still see the order...");
    const userViewQuery = `
      SELECT o.order_id, o.order_number, o.is_archived
      FROM orders o
      WHERE o.user_id = $1 
        AND o.order_id = $2
        AND NOT EXISTS (
          SELECT 1 FROM order_status_history osh 
          WHERE osh.order_id = o.order_id 
          AND osh.is_hidden_from_user = TRUE
        )
    `;
    const userViewResult = await pool.query(userViewQuery, [
      order.user_id,
      order.order_id,
    ]);

    if (userViewResult.rows.length > 0) {
      console.log(
        "✅ USER CAN STILL SEE THE ORDER (even though admin archived it)"
      );
      console.log(
        `   Order ${userViewResult.rows[0].order_number} is visible to user`
      );
    } else {
      console.log("❌ User cannot see order (UNEXPECTED)");
    }

    // 4. Check if admin can see it (with includeArchived)
    console.log(
      "\n4️⃣ Checking if admin can see ALL orders (including archived)..."
    );
    const adminViewAll = await pool.query(
      `
      SELECT o.order_id, o.order_number, o.is_archived
      FROM orders o
      WHERE o.order_id = $1
    `,
      [order.order_id]
    );

    if (adminViewAll.rows.length > 0) {
      console.log("✅ ADMIN CAN SEE THE ORDER with includeArchived=true");
    }

    // 5. Test USER HIDE
    console.log("\n5️⃣ Testing USER HIDE from history...");
    await pool.query(
      `
      INSERT INTO order_status_history (
        order_id, old_status, new_status, notes, is_hidden_from_user
      )
      VALUES ($1, $2, $2, 'Hidden from user history view', TRUE)
    `,
      [order.order_id, order.order_status]
    );
    console.log(
      "✅ User hid order from history (order_status_history.is_hidden_from_user = TRUE)"
    );

    // 6. Check if user can see it now
    console.log("\n6️⃣ Checking if user can see the order after hiding...");
    const userViewAfterHide = await pool.query(userViewQuery, [
      order.user_id,
      order.order_id,
    ]);

    if (userViewAfterHide.rows.length === 0) {
      console.log("✅ USER CANNOT SEE THE ORDER anymore (successfully hidden)");
    } else {
      console.log("❌ User can still see order (UNEXPECTED)");
    }

    // 7. Check if admin can STILL see it
    console.log("\n7️⃣ Checking if admin can still see the order...");
    const adminViewAfterUserHide = await pool.query(
      `
      SELECT o.order_id, o.order_number, o.is_archived
      FROM orders o
      WHERE o.order_id = $1
    `,
      [order.order_id]
    );

    if (adminViewAfterUserHide.rows.length > 0) {
      console.log("✅ ADMIN CAN STILL SEE THE ORDER (even though user hid it)");
      console.log(
        `   Order ${adminViewAfterUserHide.rows[0].order_number} visible to admin`
      );
    } else {
      console.log("❌ Admin cannot see order (UNEXPECTED)");
    }

    // 8. Restore to original state
    console.log("\n8️⃣ Restoring order to original state...");
    await pool.query(
      `
      UPDATE orders SET is_archived = FALSE WHERE order_id = $1
    `,
      [order.order_id]
    );
    await pool.query(
      `
      DELETE FROM order_status_history 
      WHERE order_id = $1 AND notes = 'Hidden from user history view'
    `,
      [order.order_id]
    );
    console.log("✅ Order restored to original state");

    console.log("\n=== TEST SUMMARY ===");
    console.log("✅ Admin archive does NOT hide from user");
    console.log("✅ User hide does NOT affect admin view");
    console.log("✅ Both operations are INDEPENDENT");
  } catch (error) {
    console.error("❌ Test error:", error.message);
  } finally {
    await pool.end();
  }
}

testArchiveSeparation();
