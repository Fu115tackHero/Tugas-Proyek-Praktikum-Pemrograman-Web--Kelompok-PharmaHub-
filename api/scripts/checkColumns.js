const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

async function checkColumns() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `);

    console.log("\n📋 Products Table Columns:\n");
    result.rows.forEach((row) => {
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : "";
      console.log(`  - ${row.column_name}: ${row.data_type}${length}`);
    });
    console.log();
  } finally {
    client.release();
    await pool.end();
  }
}

checkColumns();
