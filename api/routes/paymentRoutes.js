const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

/**
 * POST /api/create-transaction
 * Create new Midtrans transaction
 */
router.post("/create-transaction", paymentController.createTransaction);

/**
 * POST /api/midtrans-notification
 * Webhook dari Midtrans untuk payment status updates
 */
router.post("/midtrans-notification", paymentController.handleNotification);

module.exports = router;
