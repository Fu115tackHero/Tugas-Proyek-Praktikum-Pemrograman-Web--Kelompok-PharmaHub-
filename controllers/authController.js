const authService = require("../services/authService");

async function register(req, res) {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const result = await authService.registerUser({
      name,
      email,
      password,
      phone,
      address,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error.message === "Email already registered") {
      return res.status(409).json({ success: false, message: error.message });
    }

    if (
      error.message.includes("Invalid email") ||
      error.message.includes("Password must")
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await authService.loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Invalid email or password") {
      return res.status(401).json({ success: false, message: error.message });
    }

    // Handle suspended account
    if (error.message.includes("suspended")) {
      return res.status(403).json({
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

async function googleLogin(req, res) {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    const result = await authService.loginWithGoogle(googleToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Google login failed: ${error.message}`,
    });
  }
}

async function getProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
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
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.message === "Invalid or expired token") {
      return res.status(401).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
}

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
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

async function updateProfile(req, res) {
  try {
    const { userId, name, phone, address, profile_photo_url } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const userData = {};
    if (name !== undefined) userData.name = name;
    if (phone !== undefined) userData.phone = phone;
    if (address !== undefined) userData.address = address;
    if (profile_photo_url !== undefined) userData.profile_photo_url = profile_photo_url;

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
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ success: false, message: error.message });
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
  googleLogin,
  getProfile,
  verifyToken,
  updateProfile,
};
