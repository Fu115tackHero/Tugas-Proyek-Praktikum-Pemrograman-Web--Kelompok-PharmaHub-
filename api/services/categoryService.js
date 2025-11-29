const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

async function getAllCategories() {
  const query = "SELECT * FROM product_categories ORDER BY category_name ASC";
  const { rows } = await pool.query(query);
  return rows;
}

module.exports = {
  getAllCategories,
};
