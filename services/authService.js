const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not set in environment variables!");
  console.error(
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
  );
  process.exit(1);
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const BASE_USER_QUERY = `
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
`;

async function registerUser(userData) {
  const { name, email, password, phone, address } = userData;

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const checkEmailQuery = "SELECT user_id FROM users WHERE email = $1";
    const existingUser = await client.query(checkEmailQuery, [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

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
      "customer",
    ];

    const result = await client.query(insertQuery, values);
    const user = result.rows[0];

    if (address && address.trim() !== "") {
      await client.query(
        `INSERT INTO user_addresses (user_id, full_address, is_default) VALUES ($1, $2, $3)`,
        [user.id, address.trim(), true]
      );
      user.address = address.trim();
    } else {
      user.address = null;
    }

    await client.query("COMMIT");

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      success: true,
      message: "Registration successful",
      user,
      token,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Registration error:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function loginUser(credentials) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
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

    delete user.password_hash;

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      success: true,
      message: "Login successful",
      user,
      token,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

async function loginWithGoogle(googleToken) {
  if (!googleClient || !GOOGLE_CLIENT_ID) {
    throw new Error("Google client ID is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const email = payload?.email?.toLowerCase();
  const name = payload?.name;
  const picture = payload?.picture;

  if (!email) {
    throw new Error("Google token missing email");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const findQuery = `
      ${BASE_USER_QUERY}
      WHERE u.email = $1
      ORDER BY ua.created_at DESC
      LIMIT 1;
    `;
    const existing = await client.query(findQuery, [email]);
    let user = existing.rows[0];

    if (!user) {
      const dummyPassword = await bcrypt.hash(`${Date.now()}_${email}`, SALT_ROUNDS);
      const insertQuery = `
        INSERT INTO users (name, email, password_hash, role, profile_photo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id AS id, name, email, phone, role, profile_photo_url AS "profile_photo_url", created_at AS "createdAt";
      `;
      const insertRes = await client.query(insertQuery, [
        name || email.split("@")[0],
        email,
        dummyPassword,
        "customer",
        picture || null,
      ]);
      user = insertRes.rows[0];
    } else if (picture && !user.profile_photo_url) {
      await client.query(`UPDATE users SET profile_photo_url = $1 WHERE user_id = $2`, [
        picture,
        user.id,
      ]);
      user.profile_photo_url = picture;
    }

    await client.query("COMMIT");

    const refreshed = await pool.query(
      `${BASE_USER_QUERY} WHERE u.user_id = $1 LIMIT 1;`,
      [user.id]
    );
    const finalUser = refreshed.rows[0] || user;

    const token = jwt.sign(
      { userId: finalUser.id, email: finalUser.email, role: finalUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      success: true,
      message: "Google login successful",
      user: finalUser,
      token,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Google login error:", error.message);
    throw new Error("Google login failed");
  } finally {
    client.release();
  }
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

async function getUserById(userId) {
  try {
    const query = `
      ${BASE_USER_QUERY}
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
    console.error("Error fetching user:", error.message);
    throw error;
  }
}

async function updateProfile(userId, userData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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

    if (userData.address !== undefined) {
      const checkAddressQuery = `SELECT address_id FROM user_addresses WHERE user_id = $1 AND is_default = true`;
      const addressCheck = await client.query(checkAddressQuery, [userId]);

      if (addressCheck.rows.length > 0) {
        await client.query(
          `UPDATE user_addresses SET full_address = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND is_default = true`,
          [userData.address, userId]
        );
      } else {
        await client.query(
          `INSERT INTO user_addresses (user_id, full_address, is_default) VALUES ($1, $2, $3)`,
          [userId, userData.address, true]
        );
      }
    }

    const finalQuery = `
      ${BASE_USER_QUERY}
      WHERE u.user_id = $1
      ORDER BY ua.created_at DESC
      LIMIT 1;
    `;

    const result = await client.query(finalQuery, [userId]);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating profile:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
  verifyToken,
  getUserById,
  updateProfile,
};
