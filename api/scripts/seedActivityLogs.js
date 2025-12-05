const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/database");

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const adminRes = await client.query(
      "SELECT user_id, name, email FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1"
    );
    if (adminRes.rows.length === 0) {
      console.log("No admin user found. Using any user as admin for seed.");
    }
    const adminId = adminRes.rows[0]?.user_id || (await client.query("SELECT user_id FROM users ORDER BY user_id ASC LIMIT 1")).rows[0]?.user_id;
    if (!adminId) {
      throw new Error("No users found to associate with activity logs");
    }

    const now = new Date();
    const values = [
      {
        action_type: "CREATE",
        entity_type: "PRODUCT",
        entity_id: 0,
        entity_name: "Contoh Obat A",
        description: "Created product: Contoh Obat A",
      },
      {
        action_type: "UPDATE",
        entity_type: "PRODUCT",
        entity_id: 0,
        entity_name: "Contoh Obat A",
        description: "Updated product price: Contoh Obat A",
      },
      {
        action_type: "DELETE",
        entity_type: "PRODUCT",
        entity_id: 0,
        entity_name: "Contoh Obat B",
        description: "Deleted product: Contoh Obat B",
      },
    ];

    for (const v of values) {
      await client.query(
        `INSERT INTO admin_activity_logs (admin_id, action_type, entity_type, entity_id, entity_name, description, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [adminId, v.action_type, v.entity_type, v.entity_id, v.entity_name, v.description, "127.0.0.1", "seed-script"]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seeded 3 admin activity logs for admin_id:", adminId);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Seed error:", e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
