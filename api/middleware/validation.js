/**
 * Validation Middleware
 * Validasi input data dari client
 */

const { AppError } = require("./errorHandler");

/**
 * Validate Product Data
 */
const validateProduct = (req, res, next) => {
  const { name, price, stock, category } = req.body;

  // Required fields
  if (!name || !price || stock === undefined) {
    throw new AppError("Name, price, and stock are required", 400);
  }

  // Price validation
  if (isNaN(price) || parseFloat(price) < 0) {
    throw new AppError("Price must be a positive number", 400);
  }

  // Stock validation
  if (isNaN(stock) || parseInt(stock) < 0) {
    throw new AppError("Stock must be a positive number", 400);
  }

  // Name length validation
  if (name.length < 3 || name.length > 255) {
    throw new AppError("Product name must be between 3 and 255 characters", 400);
  }

  next();
};

/**
 * Validate Image Data
 */
const validateImage = (req, res, next) => {
  const { image } = req.body;

  if (!image) {
    return next(); // Image is optional
  }

  // Check if it's a valid base64 image
  if (!image.startsWith("data:image/")) {
    throw new AppError("Invalid image format. Must be base64 encoded image", 400);
  }

  // Check image size (approximate, base64 is ~33% larger than binary)
  const base64Length = image.length;
  const sizeInBytes = (base64Length * 3) / 4;
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (sizeInBytes > maxSize) {
    throw new AppError("Image size too large. Maximum 5MB allowed", 400);
  }

  next();
};

/**
 * Validate User Registration
 */
const validateUserRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  // Required fields
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Password validation
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  // Name validation
  if (name.length < 2 || name.length > 255) {
    throw new AppError("Name must be between 2 and 255 characters", 400);
  }

  next();
};

/**
 * Validate User Login
 */
const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  next();
};

/**
 * Validate ID Parameter
 */
const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id) || parseInt(id) < 1) {
    throw new AppError("Invalid ID parameter", 400);
  }

  next();
};

/**
 * Sanitize Input
 * Remove potentially dangerous characters
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        // Remove script tags and trim
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .trim();
      }
    });
  }

  // Sanitize query
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .trim();
      }
    });
  }

  next();
};

module.exports = {
  validateProduct,
  validateImage,
  validateUserRegistration,
  validateUserLogin,
  validateId,
  sanitizeInput,
};
