const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function checkImages() {
  try {
    const result = await pool.query(`
      SELECT 
        product_id, 
        name, 
        main_image IS NOT NULL as has_image, 
        main_image_mime_type,
        length(main_image) as image_size
      FROM products 
      LIMIT 5
    `);

    console.log('\n📊 Image Check:');
    console.log('─'.repeat(60));
    result.rows.forEach(row => {
      console.log(`ID ${row.product_id}: ${row.name}`);
      console.log(`  Has Image: ${row.has_image}`);
      console.log(`  MIME Type: ${row.main_image_mime_type || 'NULL'}`);
      console.log(`  Size: ${row.image_size ? (row.image_size / 1024).toFixed(2) + 'KB' : 'N/A'}`);
    });
    console.log('─'.repeat(60));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkImages();
