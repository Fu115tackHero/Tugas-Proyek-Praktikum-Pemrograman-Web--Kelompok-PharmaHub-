// Development server untuk testing API secara lokal
const app = require("./index.js");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api`);
  console.log(`   - POST http://localhost:${PORT}/api/create-transaction`);
});
