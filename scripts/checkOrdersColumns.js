const pool = require('../config/database');

async function checkOrdersColumns() {
  try {
    const res = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'orders' 
       ORDER BY ordinal_position`
    );
    console.log('Orders table columns:');
    console.log(res.rows.map(r => r.column_name).join(', '));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrdersColumns();
