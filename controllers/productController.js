const productService = require("../services/productService");

/**
 * Get all products
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,

  /** Create product handler */
  async createProduct(req, res) {
    try {
      const payload = req.body;
      console.log("📝 Creating product:", payload.name);
      console.log("📊 Important Info array:", payload.important_info);
      console.log("📊 Important Info length:", payload.important_info?.length);
      const created = await productService.createProduct(payload);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error("❌ Error creating product:", error.message);

      // Send detailed error message to frontend
      const statusCode =
        error.message.includes("required") ||
        error.message.includes("must be") ||
        error.message.includes("Invalid")
          ? 400
          : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to create product",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  /** Update product handler */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const payload = req.body;
      console.log(`🔄 Updating product ID:`, id);
      const updated = await productService.updateProduct(id, payload);

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error("❌ Error updating product:", error.message);

      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("required") ||
          error.message.includes("Invalid")
        ? 400
        : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update product",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  /** Delete product handler (soft delete) */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️  Archiving product ID:`, id);
      const deleted = await productService.deleteProduct(id);

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Product archived successfully", data: deleted });
    } catch (error) {
      console.error("❌ Error archiving product:", error.message);

      const statusCode = error.message.includes("not found") ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to archive product",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  /** Get deleted products handler */
  async getDeletedProducts(req, res) {
    try {
      console.log("📦 Fetching deleted products");
      const deletedProducts = await productService.getDeletedProducts();

      res.status(200).json({
        success: true,
        data: deletedProducts,
        count: deletedProducts.length,
      });
    } catch (error) {
      console.error("❌ Error fetching deleted products:", error.message);

      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch deleted products",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  /** Restore deleted product handler */
  async restoreProduct(req, res) {
    try {
      const { id } = req.params;
      console.log(`♻️  Restoring product ID:`, id);
      const restored = await productService.restoreProduct(id);

      res.status(200).json({
        success: true,
        message: "Product restored successfully",
        data: restored,
      });
    } catch (error) {
      console.error("❌ Error restoring product:", error.message);

      const statusCode = error.message.includes("not found") ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to restore product",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
};
