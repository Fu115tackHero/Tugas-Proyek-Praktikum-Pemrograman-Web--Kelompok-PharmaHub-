// Check if cart-related tables exist in database
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pharmahub_db",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

async function checkCartTables() {
  try {
    console.log("🔍 Checking Cart-Related Tables in Database...\n");
    console.log("=".repeat(80));

    // Query to check if tables exist
    const tableCheckQuery = `
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_name IN ('cart_items', 'saved_for_later', 'coupons', 'coupon_usage')
      ORDER BY table_name;
    `;

    const result = await pool.query(tableCheckQuery);

    if (result.rows.length === 0) {
      console.log("❌ No cart-related tables found in database!");
      console.log(
        "\n📋 Required tables: cart_items, saved_for_later, coupons, coupon_usage"
      );
      console.log("💡 Run the schema.sql to create these tables.");
      return false;
    }

    console.log("✅ Found Tables:\n");
    result.rows.forEach((row) => {
      console.log(`   📊 ${row.table_name} (${row.column_count} columns)`);
    });

    // Check each table structure
    console.log("\n" + "=".repeat(80));
    console.log("📋 Table Details:\n");

    for (const table of [
      "cart_items",
      "saved_for_later",
      "coupons",
      "coupon_usage",
    ]) {
      const columnQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `;

      const columns = await pool.query(columnQuery, [table]);

      if (columns.rows.length > 0) {
        console.log(`\n📊 ${table.toUpperCase()}:`);
        columns.rows.forEach((col) => {
          const nullable =
            col.is_nullable === "YES" ? "(nullable)" : "(NOT NULL)";
          console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}`);
        });
      } else {
        console.log(`\n❌ ${table.toUpperCase()}: NOT FOUND`);
      }
    }

    // Check sample data counts
    console.log("\n" + "=".repeat(80));
    console.log("📊 Data Counts:\n");

    for (const table of [
      "cart_items",
      "saved_for_later",
      "coupons",
      "coupon_usage",
    ]) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ${table}: ${countResult.rows[0].count} rows`);
      } catch (err) {
        console.log(`   ${table}: Table not found`);
      }
    }

    // Check for coupons data
    console.log("\n" + "=".repeat(80));
    console.log("🎫 Active Coupons:\n");

    try {
      const couponsResult = await pool.query(`
        SELECT code, description, discount_type, discount_value, 
               min_purchase, start_date, end_date, is_active
        FROM coupons 
        WHERE is_active = TRUE
        ORDER BY code
      `);

      if (couponsResult.rows.length === 0) {
        console.log("   ⚠️  No active coupons found in database");
      } else {
        couponsResult.rows.forEach((coupon) => {
          const discount =
            coupon.discount_type === "percentage"
              ? `${coupon.discount_value}%`
              : `Rp ${coupon.discount_value.toLocaleString()}`;
          console.log(
            `   ✅ ${coupon.code}: ${discount} - ${coupon.description}`
          );
          console.log(
            `      Valid: ${coupon.start_date.toISOString().split("T")[0]} to ${
              coupon.end_date.toISOString().split("T")[0]
            }`
          );
        });
      }
    } catch (err) {
      console.log("   ❌ Coupons table not found");
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ Cart tables verification complete!\n");

    return true;
  } catch (error) {
    console.error("❌ Error checking cart tables:", error.message);
    console.error(error.stack);
    return false;
  } finally {
    await pool.end();
  }
}

// Run the check
checkCartTables();
