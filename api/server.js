// Development server untuk testing API secara lokal
const app = require("./index.js");

const PORT = process.env.PORT || 3001;

// Setup Archive Scheduler (Optional - only in production)
if (process.env.NODE_ENV === "production") {
  try {
    const { setupCronJob } = require("./scripts/archiveScheduler");
    console.log("Setting up archive cleanup scheduler...");
    setupCronJob("0 2 * * *"); // Daily at 2 AM
    console.log("Archive scheduler active (runs daily at 2:00 AM)");
  } catch (error) {
    console.warn("Archive scheduler not available:", error.message);
    console.warn("Install node-cron: npm install node-cron");
  }
}

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/google`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   - PUT  http://localhost:${PORT}/api/auth/profile`);
});
