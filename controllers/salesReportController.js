const salesReportService = require("../services/salesReportService");

/**
 * Get all sales reports
 * GET /api/sales-reports
 * Query params: startDate, endDate
 */
async function getAllSalesReports(req, res) {
  console.log("📊 [SalesReportController] GET all sales reports");
  console.log("   Query:", req.query);

  try {
    const { startDate, endDate } = req.query;

    const reports = await salesReportService.getAllSalesReports(
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("❌ Error fetching sales reports:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales reports",
      error: error.message,
    });
  }
}

/**
 * Get sales report by ID
 * GET /api/sales-reports/:id
 */
async function getSalesReportById(req, res) {
  console.log("📊 [SalesReportController] GET sales report by ID");
  console.log("   ID:", req.params.id);

  try {
    const { id } = req.params;
    const report = await salesReportService.getSalesReportById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Sales report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("❌ Error fetching sales report:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales report",
      error: error.message,
    });
  }
}

/**
 * Create new sales report
 * POST /api/sales-reports
 */
async function createSalesReport(req, res) {
  console.log("📊 [SalesReportController] POST create sales report");
  console.log("   Body:", JSON.stringify(req.body, null, 2));

  try {
    const payload = req.body;

    // Validation
    if (!payload.report_date) {
      return res.status(400).json({
        success: false,
        message: "report_date is required",
      });
    }

    const report = await salesReportService.createSalesReport(payload);

    res.status(201).json({
      success: true,
      data: report,
      message: "Sales report created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating sales report:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create sales report",
      error: error.message,
    });
  }
}

/**
 * Update sales report
 * PUT /api/sales-reports/:id
 */
async function updateSalesReport(req, res) {
  console.log("📊 [SalesReportController] PUT update sales report");
  console.log("   ID:", req.params.id);
  console.log("   Body:", JSON.stringify(req.body, null, 2));

  try {
    const { id } = req.params;
    const payload = req.body;

    const report = await salesReportService.updateSalesReport(id, payload);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Sales report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
      message: "Sales report updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating sales report:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update sales report",
      error: error.message,
    });
  }
}

/**
 * Delete sales report
 * DELETE /api/sales-reports/:id
 */
async function deleteSalesReport(req, res) {
  console.log("📊 [SalesReportController] DELETE sales report");
  console.log("   ID:", req.params.id);

  try {
    const { id } = req.params;
    const report = await salesReportService.deleteSalesReport(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Sales report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
      message: "Sales report deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting sales report:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete sales report",
      error: error.message,
    });
  }
}

/**
 * Get sales summary
 * GET /api/sales-reports/summary
 */
async function getSalesSummary(req, res) {
  console.log("📊 [SalesReportController] GET sales summary");
  console.log("   Query:", req.query);

  try {
    const { startDate, endDate } = req.query;
    const summary = await salesReportService.getSalesSummary(
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("❌ Error fetching sales summary:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales summary",
      error: error.message,
    });
  }
}

module.exports = {
  getAllSalesReports,
  getSalesReportById,
  createSalesReport,
  updateSalesReport,
  deleteSalesReport,
  getSalesSummary,
};
