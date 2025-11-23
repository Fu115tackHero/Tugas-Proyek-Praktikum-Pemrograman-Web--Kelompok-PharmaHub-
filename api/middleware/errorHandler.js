/**
 * Error Handler Middleware
 * Centralized error handling untuk aplikasi
 */

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async Error Handler Wrapper
 * Wrap async functions untuk catch errors otomatis
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Handler
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

/**
 * Global Error Handler
 * Handle semua errors yang terjadi di aplikasi
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error untuk development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Stack:", err.stack);
    console.error("Error Details:", {
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // PostgreSQL Errors
  if (err.code === "23505") {
    // Duplicate key error
    error.message = "Duplicate entry. Record already exists.";
    error.statusCode = 400;
  }

  if (err.code === "23503") {
    // Foreign key violation
    error.message = "Invalid reference. Related record not found.";
    error.statusCode = 400;
  }

  if (err.code === "23502") {
    // Not null violation
    error.message = "Required field is missing.";
    error.statusCode = 400;
  }

  if (err.code === "22P02") {
    // Invalid text representation
    error.message = "Invalid data format.";
    error.statusCode = 400;
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error.message = "File size too large. Maximum 5MB allowed.";
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token. Please login again.";
    error.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired. Please login again.";
    error.statusCode = 401;
  }

  // Response
  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  });
};

module.exports = {
  AppError,
  asyncHandler,
  notFound,
  errorHandler,
};
