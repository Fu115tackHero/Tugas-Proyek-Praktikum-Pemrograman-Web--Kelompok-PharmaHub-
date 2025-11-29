/**
 * Authentication Controller
 * Handles HTTP requests for user authentication
 */

const authService = require("../services/authService");

/**
 * Register new user
 * POST /api/auth/register
 *
 * Request body:
 * {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "password123",
 *   phone: "08123456789",
 *   address: "Jl. Example No. 123"
 * }
 */
async function register(req, res) {
  try {
    const { name, email, password, phone, address } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    console.log("📝 Registering new user:", email);

    const result = await authService.registerUser({
      name,
      email,
      password,
      phone,
      address,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Registration error:", error.message);

    // Handle specific errors
    if (error.message === "Email already registered") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("Invalid email") ||
      error.message.includes("Password must")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 *
 * Request body:
 * {
 *   email: "john@example.com",
 *   password: "password123"
 * }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    console.log("🔐 Login attempt:", email);

    const result = await authService.loginUser({
      email,
      password,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Login error:", error.message);

    // Handle specific errors
    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 * Requires: Authorization header with Bearer token
 */
async function getProfile(req, res) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user data
    const user = await authService.getUserById(decoded.userId);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profile_photo_url: user.profile_photo_url,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Profile fetch error:", error.message);

    if (error.message === "Invalid or expired token") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
}

/**
 * Verify token (for client-side token validation)
 * POST /api/auth/verify
 *
 * Request body:
 * {
 *   token: "jwt_token_here"
 * }
 */
async function verifyToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const decoded = authService.verifyToken(token);

    res.status(200).json({
      success: true,
      message: "Token is valid",
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.error("❌ Token verification error:", error.message);

    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 *
 * Request body:
 * {
 *   userId: 1,
 *   name: "Updated Name",
 *   phone: "08123456789",
 *   address: "Updated Address",
 *   profile_photo_url: "https://..."
 * }
 */
async function updateProfile(req, res) {
  try {
    const { userId, name, phone, address, profile_photo_url } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    console.log("🔄 Updating profile for user ID:", userId);

    const userData = {};
    if (name !== undefined) userData.name = name;
    if (phone !== undefined) userData.phone = phone;
    if (address !== undefined) userData.address = address;
    if (profile_photo_url !== undefined)
      userData.profile_photo_url = profile_photo_url;

    const updatedUser = await authService.updateProfile(userId, userData);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profile_photo_url: updatedUser.profile_photo_url,
        role: updatedUser.role,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Update profile error:", error.message);

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  verifyToken,
  updateProfile,
};
