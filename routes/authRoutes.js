/**
 * Authentication Routes
 * Defines endpoints for user authentication
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * POST /api/auth/register
 * Register new user
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", authController.login);

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get("/me", authController.getProfile);

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post("/verify", authController.verifyToken);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put("/profile", authController.updateProfile);

module.exports = router;
