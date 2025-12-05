const pool = require('../config/database');

(async () => {
  const res = await pool.query(`
    SELECT order_id, order_status, user_id FROM orders WHERE user_id IN (1, 2) ORDER BY user_id, order_id
  `);
  console.log('Orders for users 1-2:');
  console.table(res.rows);
  process.exit(0);
})();
