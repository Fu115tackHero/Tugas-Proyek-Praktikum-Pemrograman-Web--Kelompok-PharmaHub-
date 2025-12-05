const express = require("express");
const router = express.Router();
const salesReportController = require("../controllers/salesReportController");

// Public routes (or protect with auth middleware if needed)
router.get("/summary", salesReportController.getSalesSummary); // Must be before /:id
router.get("/", salesReportController.getAllSalesReports);
router.get("/:id", salesReportController.getSalesReportById);
router.post("/", salesReportController.createSalesReport);
router.put("/:id", salesReportController.updateSalesReport);
router.delete("/:id", salesReportController.deleteSalesReport);

module.exports = router;
