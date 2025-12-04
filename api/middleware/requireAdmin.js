/**
 * Admin Authorization Middleware
 * Requires user to be authenticated AND have admin role
 * MUST be used after authMiddleware
 */

const requireAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user) {
      console.log("⚠️ [RequireAdmin] No user in request. authMiddleware not applied?");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      console.log(
        `⚠️ [RequireAdmin] User ${req.user.email} (${req.user.role}) attempted admin action`
      );
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    console.log(`✅ [RequireAdmin] Admin access granted to ${req.user.email}`);
    next();
  } catch (error) {
    console.error("❌ [RequireAdmin] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

module.exports = requireAdmin;
