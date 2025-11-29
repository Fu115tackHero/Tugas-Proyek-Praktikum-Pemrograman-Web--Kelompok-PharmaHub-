const { supabase, isSupabaseConfigured } = require("../config/supabase");

/**
 * Get all products from database
 * @returns {Promise<Array>} List of products
 */
const getAllProducts = async () => {
  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured, returning empty array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching products:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("❌ Error in productService.getAllProducts:", error);
    throw error;
  }
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object|null>} Product data or null
 */
const getProductById = async (id) => {
  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Error fetching product:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("❌ Error in productService.getProductById:", error);
    throw error;
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
