/**
 * Image Upload Middleware
 * Handle file uploads dengan multer dan image processing dengan sharp
 */

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Configure multer storage (in memory)
const storage = multer.memoryStorage();

// File filter untuk hanya accept images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type tidak didukung. Gunakan JPG, PNG, atau WEBP.'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

/**
 * Process and optimize image
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {String} fileName - Original filename
 * @returns {Promise<Object>} { buffer, mimeType, filename }
 */
const processImage = async (fileBuffer, fileName) => {
  try {
    // Get file extension
    const ext = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, ext);
    
    // Process dengan sharp (optimize, resize jika perlu)
    const processedBuffer = await sharp(fileBuffer)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 },
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    return {
      buffer: processedBuffer,
      mimeType: 'image/jpeg',
      filename: `${baseName}-${Date.now()}.jpg`,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Gagal memproses gambar');
  }
};

/**
 * Middleware untuk upload single image
 */
const uploadSingleImage = upload.single('image');

/**
 * Middleware untuk handle image upload dan processing
 */
const handleImageUpload = async (req, res, next) => {
  // Jika tidak ada file, lanjut ke next
  if (!req.file) {
    return next();
  }

  try {
    const processedImage = await processImage(
      req.file.buffer,
      req.file.originalname
    );

    // Store di request object
    req.processedImage = processedImage;
    next();
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal upload gambar',
    });
  }
};

module.exports = {
  upload,
  uploadSingleImage,
  handleImageUpload,
  processImage,
};
