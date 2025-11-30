// Development server untuk testing API secara lokal
const app = require("./index.js");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`\n   Auth:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   - PUT  http://localhost:${PORT}/api/auth/profile`);
  console.log(`\n   Products (CRUD):`);
  console.log(`   - GET    http://localhost:${PORT}/api/products`);
  console.log(`   - POST   http://localhost:${PORT}/api/products`);
  console.log(`   - GET    http://localhost:${PORT}/api/products/:id`);
  console.log(`   - PUT    http://localhost:${PORT}/api/products/:id`);
  console.log(`   - DELETE http://localhost:${PORT}/api/products/:id`);
  console.log(`\n   Categories:`);
  console.log(`   - GET    http://localhost:${PORT}/api/categories`);
  console.log(`\n   Payment:`);
  console.log(`   - POST http://localhost:${PORT}/api/create-transaction\n`);
});
