const express = require("express");
const router = express.Router();
const autoSalesReportController = require("../controllers/autoSalesReportController");

/**
 * ============================================
 * AUTO SALES REPORT ROUTES
 * ============================================
 * Auto-generated sales reports from orders
 */

// Generate report from completed orders
router.get("/generate", autoSalesReportController.generateReport);

// Get low stock products
router.get("/low-stock", autoSalesReportController.getLowStock);

// Get completed transactions
router.get("/transactions", autoSalesReportController.getTransactions);

// Get transaction details
router.get(
  "/transactions/:orderId",
  autoSalesReportController.getTransactionDetails
);

// Export endpoints
router.get("/export/csv", autoSalesReportController.exportCSV);
router.get("/export/json", autoSalesReportController.exportJSON);

module.exports = router;
