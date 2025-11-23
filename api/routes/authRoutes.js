/**
 * Auth Routes
 * Authentication and user management endpoints
 */

const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../middleware/validation");

// Public routes
router.post("/register", validateUserRegistration, register);
router.post("/login", validateUserLogin, login);

// Private routes (should use protect middleware when JWT is implemented)
router.get("/me", getMe);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

module.exports = router;
