const pool = require('../config/database');

async function checkForeignKeys() {
  try {
    const query = `
      SELECT 
        tc.table_name, 
        tc.constraint_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name, 
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema 
      LEFT JOIN information_schema.constraint_column_usage AS ccu 
        ON ccu.constraint_name = tc.constraint_name 
        AND ccu.table_schema = tc.table_schema 
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (ccu.table_name = 'products' 
          OR ccu.table_name = 'product_categories' 
          OR ccu.table_name = 'users') 
      ORDER BY tc.table_name, tc.constraint_name;
    `;
    
    const result = await pool.query(query);
    console.log('🔑 Foreign Keys Found:\n');
    console.log(JSON.stringify(result.rows, null, 2));
    console.log(`\nTotal: ${result.rows.length} foreign keys`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkForeignKeys();
