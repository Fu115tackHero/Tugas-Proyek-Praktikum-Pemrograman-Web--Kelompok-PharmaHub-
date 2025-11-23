/**
 * Script untuk insert product images ke database
 * Baca gambar dari file system dan save as BYTEA
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Product images mapping (sesuai dengan data di products.js)
const PRODUCT_IMAGES = [
  { product_id: 1, filename: 'paracetamol-500mg.jpg' },
  { product_id: 2, filename: 'ibuprofen-400mg.jpg' },
  { product_id: 3, filename: 'promag.jpg' },
  { product_id: 4, filename: 'loperamide-imodium.jpg' },
  { product_id: 5, filename: 'cetirizine.jpg' },
  { product_id: 6, filename: 'salbutamol-inhaler.jpg' },
  { product_id: 7, filename: 'betadine.jpg' },
  { product_id: 8, filename: 'oralit.jpg' },
  { product_id: 9, filename: 'vitamin-c-500mg.jpg' },
  { product_id: 10, filename: 'amoxicillin-500mg.jpg' },
  { product_id: 11, filename: 'omeprazole-20mg.jpg' },
  { product_id: 12, filename: 'vitamin-d3-1000-iu.jpg' },
  { product_id: 13, filename: 'multivitamin-complete.jpg' },
  { product_id: 14, filename: 'alcohol-70-percent.jpg' },
  { product_id: 15, filename: 'captopril-25mg.jpg' },
];

async function insertProductImages() {
  try {
    console.log('🖼️  Starting to insert product images...\n');

    const imagePath = path.join(__dirname, '../../public/images/allproducts');
    let successCount = 0;
    let errorCount = 0;

    for (const imageData of PRODUCT_IMAGES) {
      try {
        const filePath = path.join(imagePath, imageData.filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.error(`❌ File not found: ${imageData.filename}`);
          errorCount++;
          continue;
        }

        // Read file as buffer
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = 'image/jpeg';

        // Update database
        const updateQuery = `
          UPDATE products 
          SET main_image = $1, 
              main_image_mime_type = $2, 
              main_image_filename = $3
          WHERE product_id = $4
        `;

        const result = await pool.query(updateQuery, [
          fileBuffer,
          mimeType,
          imageData.filename,
          imageData.product_id,
        ]);

        if (result.rowCount > 0) {
          const fileSizeKB = (fileBuffer.length / 1024).toFixed(2);
          console.log(
            `✅ Product ${imageData.product_id}: ${imageData.filename} (${fileSizeKB}KB)`
          );
          successCount++;
        } else {
          console.error(`❌ Product ${imageData.product_id} not found in database`);
          errorCount++;
        }
      } catch (err) {
        console.error(
          `❌ Error processing ${imageData.filename}:`,
          err.message
        );
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully inserted: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📈 Total: ${successCount + errorCount}`);

    // Verify images in database
    const verifyQuery = `
      SELECT product_id, name, 
             length(main_image) as image_size_bytes,
             main_image_mime_type
      FROM products 
      WHERE main_image IS NOT NULL
      ORDER BY product_id
    `;

    const verifyResult = await pool.query(verifyQuery);

    console.log(`\n✅ Verification - Images stored in database:`);
    console.log('━'.repeat(70));

    verifyResult.rows.forEach((row) => {
      const sizeKB = (row.image_size_bytes / 1024).toFixed(2);
      console.log(
        `ID ${row.product_id}: ${row.name.padEnd(25)} | ${sizeKB.padStart(8)}KB | ${row.main_image_mime_type}`
      );
    });

    console.log('━'.repeat(70));
    console.log(`\nTotal images in database: ${verifyResult.rows.length}`);

    // Total size
    const totalSize = verifyResult.rows.reduce(
      (sum, row) => sum + row.image_size_bytes,
      0
    );
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`Total storage: ${totalSizeMB}MB\n`);

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
insertProductImages();
