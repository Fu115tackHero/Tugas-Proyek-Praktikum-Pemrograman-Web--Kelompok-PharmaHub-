// Authentication Middleware - JWT verification
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("⚠️ [AuthMiddleware] No authorization header");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      console.log("⚠️ [AuthMiddleware] No token in authorization header");
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request (support both userId and user_id payloads)
    req.user = {
      userId: decoded.userId || decoded.user_id || decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    if (!req.user.userId) {
      console.log("⚠️ [AuthMiddleware] Missing userId in token payload");
    }

    // Check if user account is still active (not suspended)
    const userCheck = await pool.query(
      "SELECT is_active FROM users WHERE user_id = $1",
      [req.user.userId]
    );

    if (userCheck.rows.length === 0) {
      console.log(`⚠️ [AuthMiddleware] User ${req.user.userId} not found`);
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (!userCheck.rows[0].is_active) {
      console.log(
        `⚠️ [AuthMiddleware] User ${req.user.userId} account is suspended`
      );
      return res.status(403).json({
        success: false,
        message: "Account has been suspended. Please contact administrator.",
      });
    }

    console.log(
      `✅ [AuthMiddleware] Authenticated user ${decoded.userId} (${decoded.email})`
    );

    next();
  } catch (error) {
    console.error(
      "❌ [AuthMiddleware] Token verification failed:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication error.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = authMiddleware;
