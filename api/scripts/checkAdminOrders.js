const axios = require('axios');

(async () => {
  const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
    email: 'admin@pharmahub.com',
    password: 'admin123'
  });
  
  const ordersRes = await axios.get('http://localhost:3001/api/orders', {
    headers: { Authorization: `Bearer ${loginRes.data.token}` }
  });
  
  console.log('Admin orders by status:');
  const orders = ordersRes.data.orders;
  orders.forEach(o => {
    console.log(`  Order ${o.order_id}: ${o.order_number} - ${o.order_status}`);
  });
  
  process.exit(0);
})();
