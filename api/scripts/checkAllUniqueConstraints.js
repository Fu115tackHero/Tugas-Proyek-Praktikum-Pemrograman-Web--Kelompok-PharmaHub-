/**
 * Check all UNIQUE constraints in product-related tables
 */

const pool = require("../config/database");

async function checkAllUniqueConstraints() {
  const client = await pool.connect();
  try {
    console.log("🔍 Checking all UNIQUE constraints in product-related tables...\n");
    
    const tables = ['products', 'product_details', 'product_images', 'product_ingredients', 
                    'product_important_info', 'product_side_effects', 'product_precautions',
                    'product_interactions', 'product_indications'];
    
    for (const table of tables) {
      const query = `
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1
          AND tc.constraint_type = 'UNIQUE'
          AND tc.table_schema = 'public'
        ORDER BY tc.constraint_name;
      `;
      
      const result = await client.query(query, [table]);
      
      if (result.rows.length > 0) {
        console.log(`\n📋 Table: ${table}`);
        console.table(result.rows);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAllUniqueConstraints();
