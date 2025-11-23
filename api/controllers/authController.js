/**
 * Auth Controller
 * Handle authentication and user management
 */

const { query } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const bcrypt = require("bcrypt");

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validate email
  const emailLower = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await query(
    "SELECT user_id FROM users WHERE email = $1",
    [emailLower]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError("Email sudah terdaftar", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user (no address column, address is in separate table)
  const result = await query(
    `
    INSERT INTO users (
      name, email, password_hash, phone, role, is_active, email_verified
    ) VALUES ($1, $2, $3, $4, 'customer', TRUE, FALSE)
    RETURNING user_id, name, email, phone, role, is_active, email_verified, created_at
  `,
    [name, emailLower, hashedPassword, phone]
  );

  const user = result.rows[0];

  res.status(201).json({
    success: true,
    message: "Registrasi berhasil",
    data: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email
  const emailLower = email.toLowerCase().trim();

  // Find user by email
  const result = await query(
    `
    SELECT user_id, name, email, password_hash, phone, role, is_active, email_verified
    FROM users
    WHERE email = $1
  `,
    [emailLower]
  );

  if (result.rows.length === 0) {
    throw new AppError("Email atau password salah", 401);
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw new AppError("Akun Anda telah dinonaktifkan", 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError("Email atau password salah", 401);
  }

  // Update last login
  await query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1", [
    user.user_id,
  ]);

  res.json({
    success: true,
    message: "Login berhasil",
    data: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      emailVerified: user.email_verified,
    },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const { userId } = req.query; // Temporary, should use JWT token

  if (!userId) {
    throw new AppError("User ID diperlukan", 400);
  }

  const result = await query(
    `
    SELECT user_id, name, email, phone, address, role, created_at, last_login
    FROM users
    WHERE user_id = $1 AND is_active = true
  `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError("User tidak ditemukan", 404);
  }

  const user = result.rows[0];

  res.json({
    success: true,
    data: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { userId, name, phone, address } = req.body;

  if (!userId) {
    throw new AppError("User ID diperlukan", 400);
  }

  // Check if user exists
  const checkUser = await query(
    "SELECT user_id FROM users WHERE user_id = $1",
    [userId]
  );

  if (checkUser.rows.length === 0) {
    throw new AppError("User tidak ditemukan", 404);
  }

  // Update profile
  const result = await query(
    `
    UPDATE users
    SET name = $1, phone = $2, address = $3, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $4
    RETURNING user_id, name, email, phone, address, role
  `,
    [name, phone, address, userId]
  );

  const user = result.rows[0];

  res.json({
    success: true,
    message: "Profil berhasil diperbarui",
    data: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId) {
    throw new AppError("User ID diperlukan", 400);
  }

  // Get user
  const result = await query(
    "SELECT password_hash FROM users WHERE user_id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError("User tidak ditemukan", 404);
  }

  const user = result.rows[0];

  // Verify current password
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new AppError("Password lama tidak sesuai", 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await query(
    "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
    [hashedPassword, userId]
  );

  res.json({
    success: true,
    message: "Password berhasil diubah",
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
