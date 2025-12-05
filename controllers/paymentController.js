const paymentService = require("../services/paymentService");

/**
 * Create new transaction
 * POST /api/create-transaction
 */
const createTransaction = async (req, res) => {
  try {
    const { order_id, gross_amount, items, customer } = req.body;

    const result = await paymentService.createTransaction({
      order_id,
      gross_amount,
      items,
      customer,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error creating transaction:", error.message);

    // Handle Midtrans specific errors
    if (error.ApiResponse) {
      console.error("Midtrans API Error:", error.ApiResponse);
      return res.status(error.ApiResponse.status_code || 500).json({
        success: false,
        message: error.ApiResponse.error_description || error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create transaction",
    });
  }
};

/**
 * Handle Midtrans notification webhook
 * POST /api/midtrans-notification
 */
const handleNotification = async (req, res) => {
  try {
    const notification = req.body;

    const result = await paymentService.processNotification(notification);

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error processing notification:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process notification",
    });
  }
};

module.exports = {
  createTransaction,
  handleNotification,
};
