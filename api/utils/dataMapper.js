/**
 * Data Mapper Utilities
 * Convert between frontend (camelCase) and database (snake_case) formats
 */

// Category Mapping
const CATEGORIES = {
  1: "Obat Nyeri & Demam",
  2: "Obat Pencernaan",
  3: "Obat Alergi",
  4: "Obat Pernapasan",
  5: "Antiseptik",
  6: "Vitamin & Suplemen",
  7: "Antibiotik",
  8: "Obat Jantung & Hipertensi",
};

const CATEGORY_IDS = {
  "Obat Nyeri & Demam": 1,
  "Obat Pencernaan": 2,
  "Obat Alergi": 3,
  "Obat Pernapasan": 4,
  "Antiseptik": 5,
  "Vitamin & Suplemen": 6,
  "Antibiotik": 7,
  "Obat Jantung & Hipertensi": 8,
};

/**
 * Convert database product to frontend format
 * @param {Object} dbProduct - Product from database (snake_case)
 * @returns {Object} - Product in frontend format (camelCase)
 */
const mapProductFromDB = (dbProduct) => {
  if (!dbProduct) return null;

  return {
    id: dbProduct.product_id,
    name: dbProduct.name,
    brand: dbProduct.brand,
    category: dbProduct.category_name || CATEGORIES[dbProduct.category_id] || "",
    categoryId: dbProduct.category_id,
    genericName: dbProduct.generic_name,
    price: parseFloat(dbProduct.price),
    stock: dbProduct.stock,
    description: dbProduct.description,
    uses: dbProduct.uses,
    howItWorks: dbProduct.how_it_works,
    prescriptionRequired: dbProduct.prescription_required,

    // Image - akan diset sebagai URL endpoint
    image: dbProduct.main_image
      ? `/api/products/${dbProduct.product_id}/image`
      : null,
    imageFilename: dbProduct.main_image_filename,
    imageMimeType: dbProduct.main_image_mime_type,

    // Arrays (PostgreSQL TEXT[] otomatis jadi array di Node.js)
    importantInfo: dbProduct.important_info || [],
    ingredients: dbProduct.ingredients || [],
    precaution: dbProduct.precaution || [],
    sideEffects: dbProduct.side_effects || [],
    interactions: dbProduct.interactions || [],
    indication: dbProduct.indication || [],

    // Metadata
    minStock: dbProduct.min_stock,
    isActive: dbProduct.is_active,
    featured: dbProduct.featured,
    viewCount: dbProduct.view_count,
    soldCount: dbProduct.sold_count,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
};

/**
 * Convert frontend product to database format
 * @param {Object} frontendProduct - Product from frontend (camelCase)
 * @returns {Object} - Product in database format (snake_case)
 */
const mapProductToDB = (frontendProduct) => {
  if (!frontendProduct) return null;

  // Helper function to parse array fields that might be JSON strings
  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    
    // If it's a string, try to parse it as JSON
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn(`Failed to parse array field: ${field}`);
        return [];
      }
    }
    
    return [];
  };

  return {
    name: frontendProduct.name,
    brand: frontendProduct.brand || null,
    category_id:
      frontendProduct.categoryId ||
      CATEGORY_IDS[frontendProduct.category] ||
      null,
    generic_name: frontendProduct.genericName || null,
    price: parseFloat(frontendProduct.price),
    stock: parseInt(frontendProduct.stock) || 0,
    description: frontendProduct.description || null,
    uses: frontendProduct.uses || null,
    how_it_works: frontendProduct.howItWorks || null,
    prescription_required: frontendProduct.prescriptionRequired === 'true' || frontendProduct.prescriptionRequired === true,

    // Arrays - parse if they're JSON strings
    important_info: parseArrayField(frontendProduct.importantInfo),
    ingredients: parseArrayField(frontendProduct.ingredients),
    precaution: parseArrayField(frontendProduct.precaution),
    side_effects: parseArrayField(frontendProduct.sideEffects),
    interactions: parseArrayField(frontendProduct.interactions),
    indication: parseArrayField(frontendProduct.indication),

    // Metadata (optional)
    min_stock: frontendProduct.minStock || 10,
    is_active:
      frontendProduct.isActive !== undefined ? frontendProduct.isActive : true,
    featured: frontendProduct.featured || false,
  };
};

/**
 * Convert Base64 image to Buffer for database
 * @param {String} base64String - Base64 encoded image
 * @returns {Buffer} - Image buffer
 */
const base64ToBuffer = (base64String) => {
  if (!base64String) return null;

  // Remove data URL prefix if exists (e.g., "data:image/jpeg;base64,")
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
};

/**
 * Extract MIME type from Base64 data URL
 * @param {String} base64String - Base64 data URL
 * @returns {String} - MIME type (e.g., "image/jpeg")
 */
const extractMimeType = (base64String) => {
  if (!base64String) return null;

  const match = base64String.match(/^data:([^;]+);base64,/);
  return match ? match[1] : "image/jpeg"; // default to jpeg
};

/**
 * Convert database user to frontend format
 * @param {Object} dbUser - User from database
 * @returns {Object} - User in frontend format
 */
const mapUserFromDB = (dbUser) => {
  if (!dbUser) return null;

  return {
    id: dbUser.user_id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    role: dbUser.role,
    profilePhoto: dbUser.profile_photo
      ? `/api/users/${dbUser.user_id}/photo`
      : null,
    isActive: dbUser.is_active,
    emailVerified: dbUser.email_verified,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    lastLogin: dbUser.last_login,
  };
};

/**
 * Convert frontend user to database format
 * @param {Object} frontendUser - User from frontend
 * @returns {Object} - User in database format
 */
const mapUserToDB = (frontendUser) => {
  if (!frontendUser) return null;

  return {
    name: frontendUser.name,
    email: frontendUser.email,
    phone: frontendUser.phone || null,
    role: frontendUser.role || "customer",
    is_active:
      frontendUser.isActive !== undefined ? frontendUser.isActive : true,
    email_verified: frontendUser.emailVerified || false,
  };
};

module.exports = {
  CATEGORIES,
  CATEGORY_IDS,
  mapProductFromDB,
  mapProductToDB,
  base64ToBuffer,
  extractMimeType,
  mapUserFromDB,
  mapUserToDB,
};
