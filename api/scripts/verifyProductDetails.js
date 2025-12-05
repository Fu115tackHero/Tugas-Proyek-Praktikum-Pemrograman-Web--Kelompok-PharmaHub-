/**
 * Verify product details in database
 */

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

async function verifyProductDetails() {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.brand,
        p.description,
        p.price,
        p.stock,
        p.prescription_required,
        c.category_name,
        pd.generic_name,
        pd.uses,
        array_length(pd.ingredients, 1) as ingredient_count,
        array_length(pd.side_effects, 1) as side_effect_count,
        array_length(pd.precaution, 1) as precaution_count,
        array_length(pd.interactions, 1) as interaction_count,
        array_length(pd.indication, 1) as indication_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      WHERE p.is_active = true
      ORDER BY p.product_id;
    `;
    
    const result = await client.query(query);
    
    console.log("\n📋 Product Details Summary:\n");
    console.log("=" .repeat(100));
    
    result.rows.forEach(product => {
      const hasDetails = product.generic_name !== null;
      const status = hasDetails ? "✅" : "❌";
      
      console.log(`\n${status} ID: ${product.product_id} | ${product.name}`);
      console.log(`   Brand: ${product.brand || 'N/A'}`);
      console.log(`   Category: ${product.category_name || 'N/A'}`);
      console.log(`   Description: ${product.description ? product.description.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   Generic Name: ${product.generic_name || 'N/A'}`);
      console.log(`   Uses: ${product.uses ? product.uses.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   Details: Ingredients(${product.ingredient_count || 0}), Side Effects(${product.side_effect_count || 0}), Precautions(${product.precaution_count || 0}), Interactions(${product.interaction_count || 0}), Indications(${product.indication_count || 0})`);
    });
    
    console.log("\n" + "=".repeat(100));
    console.log(`\n✅ Total products: ${result.rows.length}`);
    
    const withDetails = result.rows.filter(p => p.generic_name !== null).length;
    const withoutDetails = result.rows.length - withDetails;
    
    console.log(`✅ Products with details: ${withDetails}`);
    if (withoutDetails > 0) {
      console.log(`❌ Products missing details: ${withoutDetails}`);
    }
    
    console.log("\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyProductDetails();
