/**
 * Migration Script: Update Payment Status to Indonesian
 *
 * Changes:
 * 1. Update database constraint to support Indonesian status
 * 2. Migrate existing data from English to Indonesian
 * 3. Ensure completed orders are marked as 'dibayar'
 */

const pool = require("../config/database");

async function migratePaymentStatus() {
  const client = await pool.connect();

  try {
    console.log("🔍 Step 1: Checking current payment_status values...\n");

    // Check current data
    const checkQuery = `
      SELECT 
        payment_status, 
        payment_method,
        order_status,
        COUNT(*) as count 
      FROM orders 
      GROUP BY payment_status, payment_method, order_status
      ORDER BY payment_status, payment_method, order_status
    `;

    const currentData = await client.query(checkQuery);
    console.log("📊 Current payment status distribution:");
    console.table(currentData.rows);

    console.log("\n🔄 Step 2: Starting migration...\n");

    await client.query("BEGIN");

    // Drop old constraint
    console.log("   ✓ Dropping old payment_status constraint...");
    await client.query(`
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_payment_status
    `);

    // Add new constraint with Indonesian values
    console.log(
      "   ✓ Adding new payment_status constraint with Indonesian values..."
    );
    await client.query(`
      ALTER TABLE orders ADD CONSTRAINT check_payment_status 
      CHECK (payment_status IN (
        'pending', 
        'dibayar', 
        'belum_dibayar', 
        'failed', 
        'refunded',
        'paid',    -- for backward compatibility
        'unpaid'   -- for backward compatibility
      ))
    `);

    // Migrate data: 'paid' -> 'dibayar'
    console.log("   ✓ Converting 'paid' to 'dibayar'...");
    const paidUpdate = await client.query(`
      UPDATE orders 
      SET payment_status = 'dibayar',
          updated_at = NOW()
      WHERE payment_status = 'paid'
      RETURNING order_id, order_number, payment_method, order_status
    `);
    console.log(
      `     → Updated ${paidUpdate.rowCount} orders from 'paid' to 'dibayar'`
    );

    // Migrate data: 'unpaid' -> 'belum_dibayar'
    console.log("   ✓ Converting 'unpaid' to 'belum_dibayar'...");
    const unpaidUpdate = await client.query(`
      UPDATE orders 
      SET payment_status = 'belum_dibayar',
          updated_at = NOW()
      WHERE payment_status = 'unpaid'
      RETURNING order_id, order_number, payment_method, order_status
    `);
    console.log(
      `     → Updated ${unpaidUpdate.rowCount} orders from 'unpaid' to 'belum_dibayar'`
    );

    // Auto-mark completed orders as 'dibayar'
    console.log("   ✓ Auto-marking completed orders as 'dibayar'...");
    const completedUpdate = await client.query(`
      UPDATE orders
      SET payment_status = 'dibayar',
          updated_at = NOW()
      WHERE order_status = 'completed'
        AND payment_status != 'dibayar'
      RETURNING order_id, order_number, payment_method, order_status
    `);
    console.log(
      `     → Updated ${completedUpdate.rowCount} completed orders to 'dibayar'`
    );

    // Set bayar_ditempat pending orders to 'belum_dibayar'
    console.log(
      "   ✓ Setting bayar_ditempat pending orders to 'belum_dibayar'..."
    );
    const bayarDitempatUpdate = await client.query(`
      UPDATE orders
      SET payment_status = 'belum_dibayar',
          updated_at = NOW()
      WHERE payment_method = 'bayar_ditempat'
        AND order_status != 'completed'
        AND payment_status NOT IN ('dibayar', 'belum_dibayar')
      RETURNING order_id, order_number, payment_method, order_status
    `);
    console.log(
      `     → Updated ${bayarDitempatUpdate.rowCount} bayar_ditempat orders to 'belum_dibayar'`
    );

    await client.query("COMMIT");

    console.log("\n✅ Step 3: Migration completed successfully!\n");

    // Show final state
    console.log("📊 Final payment status distribution:");
    const finalData = await client.query(checkQuery);
    console.table(finalData.rows);

    console.log("\n🎉 Migration Summary:");
    console.log(`   • 'paid' → 'dibayar': ${paidUpdate.rowCount} orders`);
    console.log(
      `   • 'unpaid' → 'belum_dibayar': ${unpaidUpdate.rowCount} orders`
    );
    console.log(
      `   • Completed orders auto-marked 'dibayar': ${completedUpdate.rowCount} orders`
    );
    console.log(
      `   • Bayar_ditempat orders marked 'belum_dibayar': ${bayarDitempatUpdate.rowCount} orders`
    );
    console.log("\n✅ Database migration complete!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
migratePaymentStatus()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Script failed:", err);
    process.exit(1);
  });
