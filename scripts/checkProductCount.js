const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

(async () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
  });
  try {
    const res = await pool.query(
      "SELECT COUNT(*)::int AS count, SUM((main_image_url LIKE 'https://%')::int)::int AS supabase_count FROM products"
    );
    const row = res.rows[0];
    console.log(`Products: ${row.count}`);
    console.log(`Supabase URLs: ${row.supabase_count}`);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
