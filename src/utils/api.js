/**
 * API Utility
 * Centralized API calls untuk PharmaHub
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Generic fetch wrapper dengan error handling
 * Support JSON dan FormData
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
    };

    // Hanya set Content-Type jika bukan FormData
    if (!(options.body instanceof FormData)) {
      config.headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ============================================
// PRODUCT API
// ============================================

/**
 * Get all products
 * @param {Object} filters - { category, search, prescription, active }
 * @returns {Promise<Array>} Array of products
 */
export const getProducts = async (filters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.category) queryParams.append("category", filters.category);
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.prescription !== undefined)
    queryParams.append("prescription", filters.prescription);
  if (filters.active !== undefined) queryParams.append("active", filters.active);

  const query = queryParams.toString();
  const endpoint = `/api/products${query ? `?${query}` : ""}`;

  const response = await fetchAPI(endpoint);
  
  // Map products to include full image URL
  const products = (response.data || []).map(product => {
    let imageUrl = product.image;
    
    if (imageUrl) {
      // If already full URL, keep it
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        // If relative path, add base URL
        imageUrl = imageUrl.startsWith('/') 
          ? `${API_BASE_URL}${imageUrl}`
          : `${API_BASE_URL}/${imageUrl}`;
      }
    } else if (product.id) {
      // Fallback: if no image but has ID, use image endpoint
      imageUrl = `${API_BASE_URL}/api/products/${product.id}/image`;
    }
    
    return {
      ...product,
      image: imageUrl || null
    };
  });
  
  return products;
};

/**
 * Get single product by ID
 * @param {Number} id - Product ID
 * @returns {Promise<Object>} Product object
 */
export const getProductById = async (id) => {
  const response = await fetchAPI(`/api/products/${id}`);
  const product = response.data;
  
  // Map product image to include full URL
  if (product) {
    if (product.image) {
      // If image is already a full URL, keep it
      if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
        product.image = product.image;
      } else if (product.image.startsWith('/')) {
        // If image is relative path like /api/products/1/image, add base URL
        product.image = `${API_BASE_URL}${product.image}`;
      }
    } else if (product.id) {
      // Fallback: if no image URL but product has ID, use image endpoint
      product.image = `${API_BASE_URL}/api/products/${product.id}/image`;
    }
  }
  
  return product;
};

/**
 * Create new product with image
 * @param {Object} productData - Product data
 * @param {File} imageFile - Image file (optional)
 * @returns {Promise<Object>} Created product info
 */
export const createProduct = async (productData, imageFile = null) => {
  const formData = new FormData();
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  // Add all productData fields directly to formData
  Object.keys(productData).forEach(key => {
    const value = productData[key];
    
    if (Array.isArray(value)) {
      // Send arrays as JSON string
      formData.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      // Send other values as-is
      formData.append(key, value);
    }
  });

  const response = await fetchAPI("/api/products", {
    method: "POST",
    body: formData,
  });
  return response;
};

/**
 * Update existing product with image
 * @param {Number} id - Product ID
 * @param {Object} productData - Updated product data
 * @param {File} imageFile - Image file (optional)
 * @returns {Promise<Object>} Update result
 */
export const updateProduct = async (id, productData, imageFile = null) => {
  const formData = new FormData();
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  // Add all productData fields directly to formData
  Object.keys(productData).forEach(key => {
    const value = productData[key];
    
    if (Array.isArray(value)) {
      // Send arrays as JSON string
      formData.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      // Send other values as-is
      formData.append(key, value);
    }
  });

  const response = await fetchAPI(`/api/products/${id}`, {
    method: "PUT",
    body: formData,
  });
  return response;
};

/**
 * Delete product
 * @param {Number} id - Product ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteProduct = async (id) => {
  const response = await fetchAPI(`/api/products/${id}`, {
    method: "DELETE",
  });
  return response;
};

/**
 * Get product image URL
 * @param {Number} id - Product ID
 * @returns {String} Image URL
 */
export const getProductImageUrl = (id) => {
  return `${API_BASE_URL}/api/products/${id}/image`;
};

// ============================================
// CATEGORY API
// ============================================

/**
 * Get all categories
 * @returns {Promise<Array>} Array of categories
 */
export const getCategories = async () => {
  const response = await fetchAPI("/api/categories");
  return response.data || [];
};

// ============================================
// USER API (untuk future implementation)
// ============================================

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
  const response = await fetchAPI("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return response;
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user info
 */
export const register = async (userData) => {
  const response = await fetchAPI("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  return response;
};

// ============================================
// CART API
// ============================================

/**
 * Get user's cart from database
 * @param {Number} userId - User ID
 * @returns {Promise<Object>} Cart items
 */
export const getCart = async (userId) => {
  const response = await fetchAPI(`/api/cart/${userId}`);
  return response;
};

/**
 * Add item to cart in database
 * @param {Object} data - { userId, productId, quantity }
 * @returns {Promise<Object>} Response
 */
export const addToCartDB = async (data) => {
  const response = await fetchAPI("/api/cart", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
};

/**
 * Update cart item quantity
 * @param {Number} cartId - Cart item ID
 * @param {Number} quantity - New quantity
 * @returns {Promise<Object>} Response
 */
export const updateCartItem = async (cartId, quantity) => {
  const response = await fetchAPI(`/api/cart/${cartId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
  return response;
};

/**
 * Remove item from cart
 * @param {Number} cartId - Cart item ID
 * @returns {Promise<Object>} Response
 */
export const removeFromCartDB = async (cartId) => {
  const response = await fetchAPI(`/api/cart/${cartId}`, {
    method: "DELETE",
  });
  return response;
};

/**
 * Clear user's cart
 * @param {Number} userId - User ID
 * @returns {Promise<Object>} Response
 */
export const clearCartDB = async (userId) => {
  const response = await fetchAPI(`/api/cart/clear/${userId}`, {
    method: "DELETE",
  });
  return response;
};

/**
 * Sync cart from localStorage to database
 * @param {Number} userId - User ID
 * @param {Array} cartItems - Cart items from localStorage
 * @returns {Promise<Object>} Response
 */
export const syncCart = async (userId, cartItems) => {
  const response = await fetchAPI("/api/cart/sync", {
    method: "POST",
    body: JSON.stringify({ userId, cartItems }),
  });
  return response;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert image file to Base64
 * @param {File} file - Image file
 * @returns {Promise<String>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - Image file
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImage = (file) => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Format file tidak valid. Gunakan JPG, PNG, GIF, atau WEBP.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Ukuran file terlalu besar. Maksimal 5MB.",
    };
  }

  return { valid: true, error: null };
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductImageUrl,
  getCategories,
  login,
  register,
  getCart,
  addToCartDB,
  updateCartItem,
  removeFromCartDB,
  clearCartDB,
  syncCart,
  fileToBase64,
  validateImage,
};
