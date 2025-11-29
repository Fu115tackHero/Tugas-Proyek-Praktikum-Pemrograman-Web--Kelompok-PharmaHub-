/**
 * Authentication Service
 * Handles user registration and login business logic
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

// JWT configuration
const JWT_SECRET =
  process.env.JWT_SECRET || "pharmahub_secret_key_change_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - Full name
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Plain text password
 * @param {string} userData.phone - Phone number (optional)
 * @param {string} userData.address - Address (optional)
 * @returns {Promise<{success: boolean, user: Object, token: string}>}
 */
async function registerUser(userData) {
  const { name, email, password, phone, address } = userData;

  // Validation
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Password strength validation (min 6 characters)
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  try {
    // Check if email already exists
    const checkEmailQuery = "SELECT user_id FROM users WHERE email = $1";
    const existingUser = await pool.query(checkEmailQuery, [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const insertQuery = `
      INSERT INTO users (name, email, password_hash, phone, address, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, name, email, phone, address, role, created_at;
    `;

    const values = [
      name,
      email.toLowerCase(),
      hashedPassword,
      phone || null,
      address || null,
      "customer", // Default role
    ];

    const result = await pool.query(insertQuery, values);
    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("✅ User registered successfully:", user.email);

    return {
      success: true,
      message: "Registration successful",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.created_at,
      },
      token,
    };
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    throw error;
  }
}

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Plain text password
 * @returns {Promise<{success: boolean, user: Object, token: string}>}
 */
async function loginUser(credentials) {
  const { email, password } = credentials;

  // Validation
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    // Find user by email
    const query = `
      SELECT user_id, name, email, password_hash, phone, address, role, created_at
      FROM users
      WHERE email = $1;
    `;

    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("✅ User logged in successfully:", user.email);

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.created_at,
      },
      token,
    };
  } catch (error) {
    console.error("❌ Login error:", error.message);
    throw error;
  }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Decoded token payload
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Get user by ID
 * @param {number} userId - User ID (Integer)
 * @returns {Promise<Object>} - User data
 */
async function getUserById(userId) {
  try {
    const query = `
      SELECT user_id, name, email, phone, address, role, profile_photo_url, created_at
      FROM users
      WHERE user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    throw error;
  }
}

/**
 * Update user profile
 * @param {number} userId - User ID (Integer)
 * @param {Object} userData - Updated user data
 * @param {string} userData.name - Full name (optional)
 * @param {string} userData.phone - Phone number (optional)
 * @param {string} userData.address - Address (optional)
 * @param {string} userData.profile_photo_url - Profile photo URL (optional)
 * @returns {Promise<Object>} - Updated user data
 */
async function updateProfile(userId, userData) {
  try {
    // Build dynamic update query based on provided fields
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (userData.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(userData.name);
    }

    if (userData.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(userData.phone);
    }

    if (userData.address !== undefined) {
      fields.push(`address = $${paramIndex++}`);
      values.push(userData.address);
    }

    if (userData.profile_photo_url !== undefined) {
      fields.push(`profile_photo_url = $${paramIndex++}`);
      values.push(userData.profile_photo_url);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    // Add userId to values
    values.push(userId);

    const query = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING user_id, name, email, phone, address, profile_photo_url, role, created_at, updated_at;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    console.log("✅ Profile updated successfully:", result.rows[0].email);

    return result.rows[0];
  } catch (error) {
    console.error("❌ Error updating profile:", error.message);
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
  updateProfile,
};
