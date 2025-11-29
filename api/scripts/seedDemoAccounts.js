/**
 * Seed Demo Accounts
 * Creates demo admin and customer accounts
 * Run: node api/scripts/seedDemoAccounts.js
 */

const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const SALT_ROUNDS = 10;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

async function seedDemoAccounts() {
  console.log("🌱 Seeding demo accounts...\n");

  try {
    // Demo accounts data
    const demoAccounts = [
      {
        name: "Demo Customer",
        email: "customer@pharmahub.com",
        password: "customer123",
        phone: "081234567890",
        address: "Jl. Demo Customer No. 123, Jakarta",
        role: "customer",
      },
      {
        name: "Demo Admin",
        email: "admin@pharmahub.com",
        password: "admin123",
        phone: "081234567891",
        address: "Jl. Demo Admin No. 456, Jakarta",
        role: "admin",
      },
    ];

    for (const account of demoAccounts) {
      // Check if account already exists
      const checkQuery = "SELECT id FROM users WHERE email = $1";
      const existing = await pool.query(checkQuery, [account.email]);

      if (existing.rows.length > 0) {
        console.log(
          `⏭️  ${account.role} account already exists: ${account.email}`
        );
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, SALT_ROUNDS);

      // Insert account
      const insertQuery = `
        INSERT INTO users (name, email, password, phone, address, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, role;
      `;

      const values = [
        account.name,
        account.email,
        hashedPassword,
        account.phone,
        account.address,
        account.role,
      ];

      const result = await pool.query(insertQuery, values);
      const user = result.rows[0];

      console.log(`✅ Created ${user.role} account:`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   ID: ${user.id}\n`);
    }

    console.log("🎉 Demo accounts seeded successfully!\n");
    console.log("📋 Login credentials:");
    console.log("   Customer: customer@pharmahub.com / customer123");
    console.log("   Admin: admin@pharmahub.com / admin123");
  } catch (error) {
    console.error("❌ Error seeding demo accounts:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDemoAccounts().catch((error) => {
  console.error(error);
  process.exit(1);
});
