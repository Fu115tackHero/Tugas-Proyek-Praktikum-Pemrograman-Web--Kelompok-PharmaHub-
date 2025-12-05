const autoSalesReportService = require("../services/autoSalesReportService");

/**
 * ============================================
 * AUTO SALES REPORT CONTROLLER
 * ============================================
 * Handles auto-generated sales reports from orders
 */

/**
 * GET /api/auto-sales-reports/generate
 * Auto-generate sales report from completed orders
 */
async function generateReport(req, res) {
  console.log("📊 [AutoSalesReportController] GET generate report");
  console.log("   Query params:", JSON.stringify(req.query, null, 2));

  try {
    const { startDate, endDate } = req.query;

    const report = await autoSalesReportService.generateSalesReport(
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("❌ [AutoSalesReportController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/auto-sales-reports/low-stock
 * Get products with stock < 10
 */
async function getLowStock(req, res) {
  console.log("📊 [AutoSalesReportController] GET low stock products");

  try {
    const products = await autoSalesReportService.getLowStockProducts();

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("❌ [AutoSalesReportController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/auto-sales-reports/transactions
 * Get completed transactions
 */
async function getTransactions(req, res) {
  console.log("📊 [AutoSalesReportController] GET transactions");
  console.log("   Query params:", JSON.stringify(req.query, null, 2));

  try {
    const { startDate, endDate, limit } = req.query;

    const transactions = await autoSalesReportService.getCompletedTransactions(
      startDate,
      endDate,
      limit ? parseInt(limit) : 100
    );

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("❌ [AutoSalesReportController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/auto-sales-reports/transactions/:orderId
 * Get transaction details (order items)
 */
async function getTransactionDetails(req, res) {
  console.log("📊 [AutoSalesReportController] GET transaction details");
  console.log("   Order ID:", req.params.orderId);

  try {
    const { orderId } = req.params;

    const items = await autoSalesReportService.getTransactionDetails(orderId);

    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    console.error("❌ [AutoSalesReportController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/auto-sales-reports/export/csv
 * Export transactions as CSV with product details
 */
async function exportCSV(req, res) {
  console.log("📄 [AutoSalesReportController] Export CSV with product details");
  console.log("   Query params:", JSON.stringify(req.query, null, 2));

  try {
    const { startDate, endDate, limit } = req.query;

    const transactions = await autoSalesReportService.getCompletedTransactions(
      startDate,
      endDate,
      limit ? parseInt(limit) : 1000
    );

    const csv = await autoSalesReportService.generateCSV(transactions);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-report-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("❌ [AutoSalesReportController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/auto-sales-reports/export/json
 * Export full report as JSON with product details
 */
async function exportJSON(req, res) {
  console.log(
    "📄 [AutoSalesReportController] Export JSON with product details"
  );
  console.log("   Query params:", JSON.stringify(req.query, null, 2));

  try {
    const { startDate, endDate, limit } = req.query;

    const report = await autoSalesReportService.generateSalesReport(
      startDate,
      endDate
    );
    const transactions = await autoSalesReportService.getCompletedTransactions(
      startDate,
      endDate,
      limit ? parseInt(limit) : 1000
    );
    const lowStock = await autoSalesReportService.getLowStockProducts();

    const data = await autoSalesReportService.generateJSON(
      report,
      transactions,
      lowStock
    );

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-report-${
        new Date().toISOString().split("T")[0]
      }.json`
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ [AutoSalesReportController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  generateReport,
  getLowStock,
  getTransactions,
  getTransactionDetails,
  exportCSV,
  exportJSON,
};
