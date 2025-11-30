require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkOrderConstraints() {
  console.log("\n🔍 Checking orders table constraints...\n");

  try {
    const query = `
      SELECT 
        con.conname AS constraint_name,
        pg_get_constraintdef(con.oid) AS constraint_definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE rel.relname = 'orders'
        AND con.contype = 'c'
      ORDER BY con.conname;
    `;

    const result = await pool.query(query);

    console.log("Check Constraints on orders table:\n");
    result.rows.forEach((row) => {
      console.log(`Constraint: ${row.constraint_name}`);
      console.log(`Definition: ${row.constraint_definition}\n`);
    });

    console.log("✅ Check complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkOrderConstraints();
