/**
 * Check if products table has UNIQUE constraint on name column
 */

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = require("../config/database");

async function checkConstraints() {
  const client = await pool.connect();
  try {
    console.log("🔍 Checking constraints on products table...\n");
    
    // Check all constraints
    const query = `
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_name = 'products'
        AND tc.table_schema = 'public'
      ORDER BY tc.constraint_type, tc.constraint_name;
    `;
    
    const result = await client.query(query);
    
    console.log("📋 Constraints found:");
    console.table(result.rows);
    
    // Check specifically for UNIQUE constraint on name
    const uniqueOnName = result.rows.find(
      row => row.constraint_type === 'UNIQUE' && row.column_name === 'name'
    );
    
    if (uniqueOnName) {
      console.log("\n⚠️  FOUND: UNIQUE constraint on 'name' column");
      console.log(`   Constraint name: ${uniqueOnName.constraint_name}`);
      console.log("\n💡 This prevents duplicate product names.");
      console.log("   To fix: Remove the constraint or change error message in frontend.\n");
    } else {
      console.log("\n✅ No UNIQUE constraint on 'name' column");
      console.log("   The error might be coming from application logic.\n");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkConstraints();
