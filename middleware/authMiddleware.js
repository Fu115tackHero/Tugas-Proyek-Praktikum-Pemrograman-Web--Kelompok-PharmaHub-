// Authentication Middleware - JWT verification
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
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
