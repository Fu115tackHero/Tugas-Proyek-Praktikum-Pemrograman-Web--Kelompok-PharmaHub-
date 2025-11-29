/**
 * Product Service
 * Handles product data operations
 */

import apiClient, { get, post } from "./api";

/**
 * Retrieve all products
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function getAllProducts() {
  try {
    const response = await get("/products");
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
    const response = await get(`/products/${id}`);
    return response;
  } catch (error) {
    console.error("Product service error:", error);
    throw error;
  }
}

/** Get categories */
export async function getCategories() {
  try {
    const response = await get(`/categories`);
    return response;
  } catch (error) {
    console.error("Product service error:", error);
    throw error;
  }
}

/** Create product */
export async function createProduct(data) {
  try {
    const response = await post(`/products`, data);
    return response;
  } catch (error) {
    console.error("Product creation error:", error);
    throw error;
  }
}

export default {
  getAllProducts,
  getProductById,
  getCategories,
  createProduct,
};
