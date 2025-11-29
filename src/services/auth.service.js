/**
 * Authentication Service (Frontend)
 * Handles authentication API calls
 */

import { post, get } from "./api";

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<{success: boolean, user: Object, token: string}>}
 */
export async function register(userData) {
  try {
    const response = await post("/auth/register", userData);

    // Save token to localStorage
    if (response.success && response.token) {
      localStorage.setItem("pharmahub_token", response.token);
      localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user: Object, token: string}>}
 */
export async function login(email, password) {
  try {
    const response = await post("/auth/login", { email, password });

    // Save token to localStorage
    if (response.success && response.token) {
      localStorage.setItem("pharmahub_token", response.token);
      localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Get current user profile
 * @returns {Promise<{success: boolean, user: Object}>}
 */
export async function getProfile() {
  try {
    const token = localStorage.getItem("pharmahub_token");

    if (!token) {
      throw new Error("No token found");
    }

    // Make request with token in header (handled by api.js)
    const response = await get("/auth/me");

    // Update user in localStorage
    if (response.success && response.user) {
      localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem("pharmahub_token");
  localStorage.removeItem("pharmahub_user");
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem("pharmahub_token");
  return !!token;
}

/**
 * Get stored user data
 * @returns {Object|null}
 */
export function getStoredUser() {
  const userStr = localStorage.getItem("pharmahub_user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
}

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<{success: boolean, user: Object}>}
 */
export async function updateProfile(userId, userData) {
  try {
    const payload = {
      userId,
      ...userData,
    };

    const response = await put("/auth/profile", payload);

    // Update user in localStorage
    if (response.success && response.user) {
      localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}

export default {
  register,
  login,
  getProfile,
  logout,
  isAuthenticated,
  getStoredUser,
  updateProfile,
};
