/**
 * Generic API client
 * Base wrapper for fetch requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Handle API responses
 */
async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return data;
}

/**
 * Get authorization headers
 */
function getAuthHeaders() {
  const token = localStorage.getItem("pharmahub_token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Generic GET request
 */
export async function get(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * Generic POST request
 */
export async function post(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Generic PUT request
 */
export async function put(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Generic DELETE request
 */
export async function del(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export default {
  get,
  post,
  put,
  delete: del,
};
