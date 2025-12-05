// Development server untuk testing API secara lokal
const app = require("../index.js");

const PORT = process.env.PORT || 3001;

// Setup Archive Scheduler (Optional - only in production)
if (process.env.NODE_ENV === "production") {
  try {
    const { setupCronJob } = require("../scripts/archiveScheduler");
    console.log("📅 Setting up archive cleanup scheduler...");
    setupCronJob("0 2 * * *"); // Daily at 2 AM
    console.log("✅ Archive scheduler active (runs daily at 2:00 AM)");
  } catch (error) {
    console.warn("⚠️  Archive scheduler not available:", error.message);
    console.warn("   Install node-cron: npm install node-cron");
  }
}

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
  console.log(`\n   Cart (Auth Required):`);
  console.log(`   - GET    http://localhost:${PORT}/api/cart`);
  console.log(`   - POST   http://localhost:${PORT}/api/cart`);
  console.log(`   - PUT    http://localhost:${PORT}/api/cart/:productId`);
  console.log(`   - DELETE http://localhost:${PORT}/api/cart/:productId`);
  console.log(`   - DELETE http://localhost:${PORT}/api/cart`);
  console.log(`   - GET    http://localhost:${PORT}/api/cart/saved`);
  console.log(`   - POST   http://localhost:${PORT}/api/cart/save-for-later`);
  console.log(`   - POST   http://localhost:${PORT}/api/cart/move-to-cart`);
  console.log(`   - DELETE http://localhost:${PORT}/api/cart/saved/:productId`);
  console.log(`\n   Coupons (Auth Required):`);
  console.log(`   - GET    http://localhost:${PORT}/api/coupons`);
  console.log(`   - POST   http://localhost:${PORT}/api/coupons/validate`);
  console.log(`   - GET    http://localhost:${PORT}/api/coupons/history`);
  console.log(`\n   Payment:`);
  console.log(`   - POST http://localhost:${PORT}/api/create-transaction\n`);
});
