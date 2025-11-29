const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./authRoutes");
const paymentRoutes = require("./paymentRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");

/**
 * Health check endpoint
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PharmaHub API is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Mount route modules
 */
router.use("/auth", authRoutes);
router.use(paymentRoutes);
router.use(productRoutes);
router.use(categoryRoutes);

module.exports = router;
