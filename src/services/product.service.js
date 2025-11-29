/**
 * Product Service
 * Handles product data operations
 */

import apiClient, { get, post, put, del } from "./api";

/**
 * Retrieve all products
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function getAllProducts() {
  try {
    const response = await get("/api/products");
    return response;
  } catch (error) {
    console.error("Product service error:", error);
    throw error;
  }
}

/**
 * Retrieve specific product by ID
 * @param {string} id - Product ID
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function getProductById(id) {
  try {
    const response = await get(`/api/products/${id}`);
    return response;
  } catch (error) {
    console.error("Product service error:", error);
    throw error;
  }
}

/** Get categories */
export async function getCategories() {
  try {
    const response = await get(`/api/categories`);
    return response;
  } catch (error) {
    console.error("Product service error:", error);
    throw error;
  }
}

/** Create category */
export async function createCategory(data) {
  try {
    const response = await post(`/api/categories`, data);
    return response;
  } catch (error) {
    console.error("Category creation error:", error);
    throw error;
  }
}

/** Update category */
export async function updateCategory(id, data) {
  try {
    const response = await put(`/api/categories/${id}`, data);
    return response;
  } catch (error) {
    console.error("Category update error:", error);
    throw error;
  }
}

/** Delete category */
export async function deleteCategory(id) {
  try {
    const response = await del(`/api/categories/${id}`);
    return response;
  } catch (error) {
    console.error("Category delete error:", error);
    throw error;
  }
}

/** Create product */
export async function createProduct(data) {
  try {
    const response = await post(`/api/products`, data);
    return response;
  } catch (error) {
    console.error("Product creation error:", error);
    throw error;
  }
}

/** Update product */
export async function updateProduct(id, data) {
  try {
    const response = await put(`/api/products/${id}`, data);
    return response;
  } catch (error) {
    console.error("Product update error:", error);
    throw error;
  }
}

/** Delete product */
export async function deleteProduct(id) {
  try {
    const response = await del(`/api/products/${id}`);
    return response;
  } catch (error) {
    console.error("Product delete error:", error);
    throw error;
  }
}

export default {
  getAllProducts,
  getProductById,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};
