/**
 * Authentication Service
 * Handles user registration and login business logic
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Use centralized database configuration
const pool = require("../config/database");


// JWT configuration - MUST be set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ FATAL ERROR: JWT_SECRET is not set in environment variables!");
  console.error("   Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
  process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - Full name
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Plain text password
 * @param {string} userData.phone - Phone number (optional)
 * @param {string} userData.address - Address (optional) - Will be saved to user_addresses table
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if email already exists
    const checkEmailQuery = "SELECT user_id FROM users WHERE email = $1";
    const existingUser = await client.query(checkEmailQuery, [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user (WITHOUT address column) - Use aliases for consistency
    const insertQuery = `
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        user_id AS id, 
        name, 
        email, 
        phone, 
        role,
        profile_photo_url AS "profile_photo_url",
        created_at AS "createdAt";
    `;

    const values = [
      name,
      email.toLowerCase(),
      hashedPassword,
      phone || null,
      "customer", // Default role
    ];

    const result = await client.query(insertQuery, values);
    const user = result.rows[0];

    // If address is provided, insert into user_addresses table with is_default = true
    if (address && address.trim() !== "") {
      await client.query(
        `INSERT INTO user_addresses (user_id, full_address, is_default) VALUES ($1, $2, $3)`,
        [user.id, address.trim(), true]
      );
      // Add address to user object for response
      user.address = address.trim();
    } else {
      user.address = null;
    }

    await client.query("COMMIT");

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
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
      user,
      token,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Registration error:", error.message);
    throw error;
  } finally {
    client.release();
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
    // Find user by email and LEFT JOIN with default address - Use aliases for consistency
    const query = `
      SELECT 
        u.user_id AS id, 
        u.name, 
        u.email, 
        u.password_hash, 
        u.phone, 
        u.role, 
        u.is_active,
        u.profile_photo_url AS "profile_photo_url",
        u.created_at AS "createdAt",
        ua.full_address AS address
      FROM users u
      LEFT JOIN user_addresses ua ON u.user_id = ua.user_id AND ua.is_default = true
      WHERE u.email = $1
      ORDER BY ua.created_at DESC
      LIMIT 1;
    `;

    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      throw new Error("Account has been suspended. Please contact administrator.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Remove password_hash from user object before returning
    delete user.password_hash;

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("✅ User logged in successfully:", user.email);
    console.log("📸 Profile photo URL returned:", user.profile_photo_url);

    return {
      success: true,
      message: "Login successful",
      user,
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
      SELECT 
        u.user_id AS id, 
        u.name, 
        u.email, 
        u.phone, 
        u.role, 
        u.profile_photo_url AS "profile_photo_url", 
        u.created_at AS "createdAt",
        ua.full_address AS address
      FROM users u
      LEFT JOIN user_addresses ua ON u.user_id = ua.user_id AND ua.is_default = true
      WHERE u.user_id = $1
      ORDER BY ua.created_at DESC
      LIMIT 1;
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
 * @param {string} userData.address - Address (optional) - Will update user_addresses table
 * @param {string} userData.profile_photo_url - Profile photo URL (optional)
 * @returns {Promise<Object>} - Updated user data
 */
async function updateProfile(userId, userData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Build dynamic update query based on provided fields (excluding address)
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

    if (userData.profile_photo_url !== undefined) {
      fields.push(`profile_photo_url = $${paramIndex++}`);
      values.push(userData.profile_photo_url);
    }

    // Update users table if there are fields to update
    if (fields.length > 0) {
      values.push(userId);

      const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE user_id = $${paramIndex}
        RETURNING user_id AS id, name, email, phone, profile_photo_url AS "profile_photo_url", role, created_at AS "createdAt", updated_at AS "updatedAt";
      `;

      await client.query(query, values);
    }

    // Update or insert address in user_addresses table if provided
    if (userData.address !== undefined) {
      // Check if default address exists
      const checkAddressQuery = `SELECT address_id FROM user_addresses WHERE user_id = $1 AND is_default = true`;
      const addressCheck = await client.query(checkAddressQuery, [userId]);

      if (addressCheck.rows.length > 0) {
        // Update existing default address
        await client.query(
          `UPDATE user_addresses SET full_address = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND is_default = true`,
          [userData.address, userId]
        );
      } else {
        // Insert new default address
        await client.query(
          `INSERT INTO user_addresses (user_id, full_address, is_default) VALUES ($1, $2, $3)`,
          [userId, userData.address, true]
        );
      }
    }

    // Fetch updated user with address using aliases
    const finalQuery = `
      SELECT 
        u.user_id AS id, 
        u.name, 
        u.email, 
        u.phone, 
        u.profile_photo_url AS "profile_photo_url", 
        u.role, 
        u.created_at AS "createdAt", 
        u.updated_at AS "updatedAt",
        ua.full_address AS address
      FROM users u
      LEFT JOIN user_addresses ua ON u.user_id = ua.user_id AND ua.is_default = true
      WHERE u.user_id = $1
      ORDER BY ua.created_at DESC
      LIMIT 1;
    `;

    const result = await client.query(finalQuery, [userId]);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    await client.query("COMMIT");

    console.log("✅ Profile updated successfully:", result.rows[0].email);

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error updating profile:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
  updateProfile,
};
