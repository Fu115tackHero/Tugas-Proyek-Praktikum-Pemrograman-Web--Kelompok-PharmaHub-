// Setup Cart-related tables and seed coupons
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pharmahub_db",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

async function setupCartTables() {
  const client = await pool.connect();

  try {
    console.log("🚀 Setting up Cart-related tables...\n");
    console.log("=".repeat(80));

    await client.query("BEGIN");

    // 1. Create coupon_usage table (yang belum ada)
    console.log("📊 Creating coupon_usage table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        usage_id SERIAL PRIMARY KEY,
        coupon_id INTEGER NOT NULL REFERENCES coupons(coupon_id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(order_id) ON DELETE SET NULL,
        discount_amount DECIMAL(12, 2) NOT NULL,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usage(order_id);
    `);

    console.log("✅ coupon_usage table created with indexes\n");

    // 2. Seed demo coupons yang match dengan frontend
    console.log("🎫 Seeding demo coupons...\n");

    const coupons = [
      {
        code: "SEHAT10",
        description: "Diskon 10% untuk semua produk",
        discount_type: "percentage",
        discount_value: 10,
        min_purchase: 0,
        max_discount: null,
        usage_limit: null, // unlimited
        usage_per_user: 5,
        start_date: "2025-01-01",
        end_date: "2025-12-31",
      },
      {
        code: "SEHAT50K",
        description: "Diskon Rp 50.000 untuk pembelian minimal Rp 200.000",
        discount_type: "fixed",
        discount_value: 50000,
        min_purchase: 200000,
        max_discount: null,
        usage_limit: 100,
        usage_per_user: 3,
        start_date: "2025-01-01",
        end_date: "2025-12-31",
      },
      {
        code: "NEWUSER",
        description: "Diskon 15% untuk pengguna baru",
        discount_type: "percentage",
        discount_value: 15,
        min_purchase: 50000,
        max_discount: 100000,
        usage_limit: 500,
        usage_per_user: 1,
        start_date: "2025-01-01",
        end_date: "2025-12-31",
      },
      {
        code: "GRATIS20K",
        description: "Gratis Rp 20.000 untuk pembelian minimal Rp 100.000",
        discount_type: "fixed",
        discount_value: 20000,
        min_purchase: 100000,
        max_discount: null,
        usage_limit: 200,
        usage_per_user: 2,
        start_date: "2025-01-01",
        end_date: "2025-12-31",
      },
    ];

    for (const coupon of coupons) {
      const existingCoupon = await client.query(
        "SELECT coupon_id FROM coupons WHERE code = $1",
        [coupon.code]
      );

      if (existingCoupon.rows.length > 0) {
        console.log(`   ⏭️  Coupon ${coupon.code} already exists, skipping...`);
      } else {
        await client.query(
          `INSERT INTO coupons (
            code, description, discount_type, discount_value,
            min_purchase, max_discount, usage_limit, usage_per_user,
            start_date, end_date, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            coupon.code,
            coupon.description,
            coupon.discount_type,
            coupon.discount_value,
            coupon.min_purchase,
            coupon.max_discount,
            coupon.usage_limit,
            coupon.usage_per_user,
            coupon.start_date,
            coupon.end_date,
            true,
          ]
        );

        const discountDisplay =
          coupon.discount_type === "percentage"
            ? `${coupon.discount_value}%`
            : `Rp ${coupon.discount_value.toLocaleString()}`;

        console.log(
          `   ✅ ${coupon.code}: ${discountDisplay} - ${coupon.description}`
        );
      }
    }

    await client.query("COMMIT");

    console.log("\n" + "=".repeat(80));
    console.log("✅ Cart tables setup complete!\n");

    // Verify
    console.log("📊 Verification:\n");

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('cart_items', 'saved_for_later', 'coupons', 'coupon_usage')
      ORDER BY table_name
    `);

    tablesResult.rows.forEach((row) => {
      console.log(`   ✅ ${row.table_name}`);
    });

    const couponsResult = await client.query(`
      SELECT code, discount_type, discount_value, is_active 
      FROM coupons 
      WHERE is_active = TRUE
      ORDER BY code
    `);

    console.log(`\n🎫 Active Coupons: ${couponsResult.rows.length}\n`);
    couponsResult.rows.forEach((coupon) => {
      const discount =
        coupon.discount_type === "percentage"
          ? `${coupon.discount_value}%`
          : `Rp ${coupon.discount_value.toLocaleString()}`;
      console.log(`   ✅ ${coupon.code}: ${discount}`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("🎉 Setup complete! Ready for cart API implementation.\n");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error setting up cart tables:", error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup
setupCartTables();
