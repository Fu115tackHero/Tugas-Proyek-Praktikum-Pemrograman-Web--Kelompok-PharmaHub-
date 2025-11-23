/**
 * Product Controller
 * Handle semua business logic untuk products
 */

const { query } = require("../config/database");
const {
  mapProductFromDB,
  mapProductToDB,
  base64ToBuffer,
  extractMimeType,
} = require("../utils/dataMapper");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

/**
 * @desc    Get all products (LISTING - quick load, no details)
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { category, search, prescription, active } = req.query;

  let queryText = `
    SELECT 
      p.product_id,
      p.name,
      p.brand,
      p.category_id,
      p.price,
      p.description,
      p.stock,
      p.prescription_required,
      p.featured,
      p.view_count,
      p.sold_count,
      p.is_active,
      p.created_at,
      p.updated_at,
      c.category_name,
      CASE WHEN p.main_image IS NOT NULL THEN true ELSE false END as main_image,
      p.main_image_mime_type,
      p.main_image_filename,
      pd.generic_name,
      pd.uses,
      pd.how_it_works,
      pd.important_info,
      pd.ingredients,
      pd.precaution,
      pd.side_effects,
      pd.interactions,
      pd.indication
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.category_id
    LEFT JOIN product_details pd ON p.product_id = pd.product_id
    WHERE 1=1
  `;
  const queryParams = [];
  let paramIndex = 1;

  // Filter by category
  if (category) {
    queryText += ` AND c.category_name = $${paramIndex}`;
    queryParams.push(category);
    paramIndex++;
  }

  // Search by name or description
  if (search) {
    queryText += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  // Filter by prescription requirement
  if (prescription !== undefined) {
    queryText += ` AND p.prescription_required = $${paramIndex}`;
    queryParams.push(prescription === "true");
    paramIndex++;
  }

  // Filter by active status
  if (active !== undefined) {
    queryText += ` AND p.is_active = $${paramIndex}`;
    queryParams.push(active === "true");
    paramIndex++;
  } else {
    // Default: only show active products
    queryText += ` AND p.is_active = true`;
  }

  queryText += ` ORDER BY p.name ASC`;

  const result = await query(queryText, queryParams);

  // Map to frontend format
  const products = result.rows.map(mapProductFromDB);

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

/**
 * @desc    Get single product with full details
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `
    SELECT 
      p.product_id,
      p.name,
      p.brand,
      p.category_id,
      p.price,
      p.description,
      p.stock,
      p.prescription_required,
      p.featured,
      p.view_count,
      p.sold_count,
      p.is_active,
      p.created_at,
      p.updated_at,
      c.category_name,
      pd.generic_name,
      pd.uses,
      pd.how_it_works,
      pd.important_info,
      pd.ingredients,
      pd.precaution,
      pd.side_effects,
      pd.interactions,
      pd.indication
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.category_id
    LEFT JOIN product_details pd ON p.product_id = pd.product_id
    WHERE p.product_id = $1
  `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError("Product not found", 404);
  }

  // Increment view count
  await query(
    "UPDATE products SET view_count = view_count + 1 WHERE product_id = $1",
    [id]
  );

  const product = mapProductFromDB(result.rows[0]);

  res.json({
    success: true,
    data: product,
  });
});

/**
 * @desc    Get product image
 * @route   GET /api/products/:id/image
 * @access  Public
 */
const getProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    "SELECT main_image, main_image_mime_type FROM products WHERE product_id = $1",
    [id]
  );

  if (result.rows.length === 0 || !result.rows[0].main_image) {
    throw new AppError("Image not found", 404);
  }

  const { main_image, main_image_mime_type } = result.rows[0];

  res.set("Content-Type", main_image_mime_type || "image/jpeg");
  res.set("Cache-Control", "public, max-age=86400"); // Cache 1 day
  res.send(main_image);
});

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  console.log('📥 Received product data:', {
    body_keys: Object.keys(req.body),
    hasFile: !!req.file,
    hasProcessedImage: !!req.processedImage,
    sample_fields: {
      name: req.body.name,
      genericName: req.body.genericName,
      howItWorks: req.body.howItWorks,
      uses: req.body.uses,
      ingredients: req.body.ingredients,
      importantInfo: req.body.importantInfo,
    }
  });

  const productData = mapProductToDB(req.body);

  console.log('📦 Mapped product data:', {
    name: productData.name,
    generic_name: productData.generic_name,
    uses: productData.uses,
    how_it_works: productData.how_it_works,
    ingredients: productData.ingredients,
    important_info: productData.important_info,
  });

  // Handle image upload - support both multer dan base64
  let imageBuffer = null;
  let imageMimeType = null;
  let imageFilename = null;

  // Check if multer processed the image
  if (req.processedImage) {
    imageBuffer = req.processedImage.buffer;
    imageMimeType = req.processedImage.mimeType;
    imageFilename = req.processedImage.filename;
  } else if (req.body.image) {
    // Fallback to base64 if provided
    imageBuffer = base64ToBuffer(req.body.image);
    imageMimeType = extractMimeType(req.body.image);
    imageFilename = req.body.imageFilename || "product-image";
  }

  // Start transaction - Insert to products table
  const productResult = await query(
    `
    INSERT INTO products (
      name, brand, category_id, price, stock,
      description, prescription_required,
      main_image, main_image_mime_type, main_image_filename,
      min_stock, is_active, featured
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    )
    RETURNING product_id
  `,
    [
      productData.name,
      productData.brand,
      productData.category_id,
      productData.price,
      productData.stock,
      productData.description,
      productData.prescription_required,
      imageBuffer,
      imageMimeType,
      imageFilename,
      productData.min_stock || 10,
      productData.is_active !== false,
      productData.featured === true,
    ]
  );

  const newProductId = productResult.rows[0].product_id;

  // Insert to product_details table - always insert even if fields are empty
  await query(
    `
    INSERT INTO product_details (
      product_id, generic_name, uses, how_it_works,
      important_info, ingredients, precaution, side_effects,
      interactions, indication
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    )
  `,
    [
      newProductId,
      productData.generic_name || null,
      productData.uses || null,
      productData.how_it_works || null,
      productData.important_info || null,
      productData.ingredients || null,
      productData.precaution || null,
      productData.side_effects || null,
      productData.interactions || null,
      productData.indication || null,
    ]
  );

  console.log(`✅ Product created with ID ${newProductId}:`, {
    name: productData.name,
    has_details: !!(productData.generic_name || productData.uses || productData.how_it_works),
    detail_fields: {
      generic_name: !!productData.generic_name,
      uses: !!productData.uses,
      how_it_works: !!productData.how_it_works,
      important_info: Array.isArray(productData.important_info) ? productData.important_info.length : 0,
      ingredients: Array.isArray(productData.ingredients) ? productData.ingredients.length : 0,
    }
  });

  // Fetch the newly created product to return in response
  const createdProduct = await query(
    `
    SELECT 
      p.product_id,
      p.name,
      p.brand,
      p.category_id,
      p.price,
      p.description,
      p.stock,
      p.prescription_required,
      p.featured,
      p.view_count,
      p.sold_count,
      p.is_active,
      p.created_at,
      p.updated_at,
      c.category_name,
      CASE WHEN p.main_image IS NOT NULL THEN true ELSE false END as main_image,
      p.main_image_mime_type,
      p.main_image_filename,
      pd.generic_name,
      pd.uses,
      pd.how_it_works,
      pd.important_info,
      pd.ingredients,
      pd.precaution,
      pd.side_effects,
      pd.interactions,
      pd.indication
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.category_id
    LEFT JOIN product_details pd ON p.product_id = pd.product_id
    WHERE p.product_id = $1
  `,
    [newProductId]
  );

  const product = createdProduct.rows.length > 0 ? mapProductFromDB(createdProduct.rows[0]) : { id: newProductId };

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = mapProductToDB(req.body);

  // Check if product exists
  const checkResult = await query(
    "SELECT product_id FROM products WHERE product_id = $1",
    [id]
  );

  if (checkResult.rows.length === 0) {
    throw new AppError("Product not found", 404);
  }

  // Handle image upload - support both multer dan base64
  let imageBuffer = null;
  let imageMimeType = null;
  let imageFilename = null;
  let imageUpdate = "";
  const params = [];
  let paramIndex = 1;

  if (req.processedImage) {
    imageBuffer = req.processedImage.buffer;
    imageMimeType = req.processedImage.mimeType;
    imageFilename = req.processedImage.filename;
    imageUpdate = `, main_image = $${paramIndex}, main_image_mime_type = $${
      paramIndex + 1
    }, main_image_filename = $${paramIndex + 2}`;
    params.push(imageBuffer, imageMimeType, imageFilename);
    paramIndex += 3;
  } else if (req.body.image) {
    imageBuffer = base64ToBuffer(req.body.image);
    imageMimeType = extractMimeType(req.body.image);
    imageFilename = req.body.imageFilename || "product-image";
    imageUpdate = `, main_image = $${paramIndex}, main_image_mime_type = $${
      paramIndex + 1
    }, main_image_filename = $${paramIndex + 2}`;
    params.push(imageBuffer, imageMimeType, imageFilename);
    paramIndex += 3;
  }

  // Build update query for products table
  const updateQuery = `
    UPDATE products SET
      name = $${paramIndex++},
      brand = $${paramIndex++},
      category_id = $${paramIndex++},
      price = $${paramIndex++},
      stock = $${paramIndex++},
      description = $${paramIndex++},
      prescription_required = $${paramIndex++},
      min_stock = $${paramIndex++},
      is_active = $${paramIndex++},
      featured = $${paramIndex++},
      updated_at = CURRENT_TIMESTAMP
      ${imageUpdate}
    WHERE product_id = $${paramIndex}
  `;

  params.push(
    productData.name,
    productData.brand,
    productData.category_id,
    productData.price,
    productData.stock,
    productData.description,
    productData.prescription_required,
    productData.min_stock || 10,
    productData.is_active !== false,
    productData.featured === true,
    id
  );

  await query(updateQuery, params);

  // Always update/insert product_details
  // Try to update, if not found then insert
  const detailCheck = await query(
    "SELECT detail_id FROM product_details WHERE product_id = $1",
    [id]
  );

  if (detailCheck.rows.length > 0) {
    // Update existing detail
    await query(
      `
      UPDATE product_details SET
        generic_name = $1,
        uses = $2,
        how_it_works = $3,
        important_info = $4,
        ingredients = $5,
        precaution = $6,
        side_effects = $7,
        interactions = $8,
        indication = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $10
    `,
      [
        productData.generic_name || null,
        productData.uses || null,
        productData.how_it_works || null,
        productData.important_info || null,
        productData.ingredients || null,
        productData.precaution || null,
        productData.side_effects || null,
        productData.interactions || null,
        productData.indication || null,
        id,
      ]
    );
  } else {
    // Insert new detail
    await query(
      `
      INSERT INTO product_details (
        product_id, generic_name, uses, how_it_works,
        important_info, ingredients, precaution, side_effects,
        interactions, indication
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
      [
        id,
        productData.generic_name || null,
        productData.uses || null,
        productData.how_it_works || null,
        productData.important_info || null,
        productData.ingredients || null,
        productData.precaution || null,
        productData.side_effects || null,
        productData.interactions || null,
        productData.indication || null,
      ]
    );
  }

  console.log(`✅ Product ${id} updated:`, {
    name: productData.name,
    has_details: !!(productData.generic_name || productData.uses || productData.how_it_works),
    detail_fields: {
      generic_name: !!productData.generic_name,
      uses: !!productData.uses,
      how_it_works: !!productData.how_it_works,
      important_info: Array.isArray(productData.important_info) ? productData.important_info.length : 0,
      ingredients: Array.isArray(productData.ingredients) ? productData.ingredients.length : 0,
    }
  });

  // Fetch the updated product to return in response
  const updatedProduct = await query(
    `
    SELECT 
      p.product_id,
      p.name,
      p.brand,
      p.category_id,
      p.price,
      p.description,
      p.stock,
      p.prescription_required,
      p.featured,
      p.view_count,
      p.sold_count,
      p.is_active,
      p.created_at,
      p.updated_at,
      c.category_name,
      CASE WHEN p.main_image IS NOT NULL THEN true ELSE false END as main_image,
      p.main_image_mime_type,
      p.main_image_filename,
      pd.generic_name,
      pd.uses,
      pd.how_it_works,
      pd.important_info,
      pd.ingredients,
      pd.precaution,
      pd.side_effects,
      pd.interactions,
      pd.indication
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.category_id
    LEFT JOIN product_details pd ON p.product_id = pd.product_id
    WHERE p.product_id = $1
  `,
    [id]
  );

  const product = updatedProduct.rows.length > 0 ? mapProductFromDB(updatedProduct.rows[0]) : { id };

  res.json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    "DELETE FROM products WHERE product_id = $1 RETURNING product_id",
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError("Product not found", 404);
  }

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});

module.exports = {
  getAllProducts,
  getProduct,
  getProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
};
