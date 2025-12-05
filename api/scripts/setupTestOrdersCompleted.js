const pool = require('../config/database');

(async () => {
  try {
    console.log('🔄 Updating some orders to completed status for testing...\n');
    
    // Update first 2 pending orders to completed
    const updateRes = await pool.query(`
      UPDATE orders 
      SET order_status = 'completed'
      WHERE order_id IN (
        SELECT order_id FROM orders
        WHERE user_id = 2 AND order_status = 'pending'
        ORDER BY order_id
        LIMIT 2
      )
      RETURNING order_id, order_number, order_status
    `);
    
    console.log(`✓ Updated ${updateRes.rows.length} orders to completed status:`);
    updateRes.rows.forEach(row => {
      console.log(`  - Order ${row.order_id} (${row.order_number})`);
    });
    
    // Check how many completed orders user 2 has now
    const checkRes = await pool.query(`
      SELECT COUNT(*) as count FROM orders WHERE user_id = 2 AND order_status = 'completed'
    `);
    console.log(`\n✓ User 2 now has ${checkRes.rows[0].count} completed orders`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
