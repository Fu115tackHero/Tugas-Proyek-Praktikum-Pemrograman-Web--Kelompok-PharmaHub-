/**
 * Authentication Middleware
 * Protect routes yang memerlukan authentication
 */

const { AppError } = require("./errorHandler");

/**
 * Protect Route - Require Authentication
 * Note: Authentication belum diimplementasi, ini untuk future use
 */
const protect = (req, res, next) => {
  // TODO: Implement JWT authentication
  // For now, just pass through
  
  // Example implementation:
  /*
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AppError('Not authorized. Please login.', 401);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Invalid token. Please login again.', 401);
  }
  */
  
  next();
};

/**
 * Restrict to Roles
 * Check if user has required role
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // TODO: Implement role checking
    // For now, just pass through
    
    // Example implementation:
    /*
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403
      );
    }
    */
    
    next();
  };
};

/**
 * Admin Only
 * Shortcut for admin-only routes
 */
const adminOnly = restrictTo("admin");

/**
 * Pharmacist or Admin
 * Allow pharmacist and admin roles
 */
const pharmacistOrAdmin = restrictTo("admin", "pharmacist");

module.exports = {
  protect,
  restrictTo,
  adminOnly,
  pharmacistOrAdmin,
};
