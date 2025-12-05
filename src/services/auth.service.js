import { post, get, put } from "./api";

export async function register(userData) {
  const response = await post("/auth/register", userData);

  if (response.success && response.token) {
    localStorage.setItem("pharmahub_token", response.token);
    localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
  }

  return response;
}

export async function login(email, password) {
  const response = await post("/auth/login", { email, password });

  if (response.success && response.token) {
    localStorage.setItem("pharmahub_token", response.token);
    localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
  }

  return response;
}

export async function loginGoogle(googleCredential) {
  const response = await post("/auth/google", { googleToken: googleCredential });

  if (response.success && response.token) {
    localStorage.setItem("pharmahub_token", response.token);
    localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
  }

  return response;
}

export async function getProfile() {
  const token = localStorage.getItem("pharmahub_token");
  if (!token) throw new Error("No token found");

  const response = await get("/auth/me");

  if (response.success && response.user) {
    localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
  }

  return response;
}

export function logout() {
  localStorage.removeItem("pharmahub_token");
  localStorage.removeItem("pharmahub_user");
}

export function isAuthenticated() {
  return !!localStorage.getItem("pharmahub_token");
}

export function getStoredUser() {
  const userStr = localStorage.getItem("pharmahub_user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

export async function updateProfile(userId, userData) {
  const payload = { userId, ...userData };
  const response = await put("/auth/profile", payload);

  if (response.success && response.user) {
    localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
  }

  return response;
}

export default {
  register,
  login,
  loginGoogle,
  getProfile,
  logout,
  isAuthenticated,
  getStoredUser,
  updateProfile,
};
