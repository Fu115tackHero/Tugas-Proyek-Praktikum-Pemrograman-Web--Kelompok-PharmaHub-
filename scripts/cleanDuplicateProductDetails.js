const pool = require("../config/database");

/**
 * Script to clean duplicate entries in product detail tables
 * Run this with: node api/scripts/cleanDuplicateProductDetails.js
 */

async function cleanDuplicates() {
  const client = await pool.connect();
  
  try {
    console.log("🧹 Starting cleanup of duplicate product details...\n");

    // 1. Clean product_important_info duplicates
    console.log("📋 Cleaning product_important_info...");
    const importantInfoResult = await client.query(`
      DELETE FROM product_important_info
      WHERE info_id IN (
        SELECT info_id
        FROM (
          SELECT info_id,
                 ROW_NUMBER() OVER (
                   PARTITION BY detail_id, LOWER(TRIM(info_text))
                   ORDER BY info_id
                 ) as rnum
          FROM product_important_info
        ) t
        WHERE rnum > 1
      )
      RETURNING info_id
    `);
    console.log(`  ✅ Removed ${importantInfoResult.rowCount} duplicate important_info entries`);

    // 2. Clean product_ingredients duplicates
    console.log("\n📋 Cleaning product_ingredients...");
    const ingredientsResult = await client.query(`
      DELETE FROM product_ingredients
      WHERE ingredient_id IN (
        SELECT ingredient_id
        FROM (
          SELECT ingredient_id,
                 ROW_NUMBER() OVER (
                   PARTITION BY detail_id, LOWER(TRIM(ingredient))
                   ORDER BY ingredient_id
                 ) as rnum
          FROM product_ingredients
        ) t
        WHERE rnum > 1
      )
      RETURNING ingredient_id
    `);
    console.log(`  ✅ Removed ${ingredientsResult.rowCount} duplicate ingredient entries`);

    // 3. Clean product_side_effects duplicates
    console.log("\n📋 Cleaning product_side_effects...");
    const sideEffectsResult = await client.query(`
      DELETE FROM product_side_effects
      WHERE side_effect_id IN (
        SELECT side_effect_id
        FROM (
          SELECT side_effect_id,
                 ROW_NUMBER() OVER (
                   PARTITION BY detail_id, LOWER(TRIM(side_effect_text))
                   ORDER BY side_effect_id
                 ) as rnum
          FROM product_side_effects
        ) t
        WHERE rnum > 1
      )
      RETURNING side_effect_id
    `);
    console.log(`  ✅ Removed ${sideEffectsResult.rowCount} duplicate side_effects entries`);

    // 4. Clean product_precautions duplicates
    console.log("\n📋 Cleaning product_precautions...");
    const precautionsResult = await client.query(`
      DELETE FROM product_precautions
      WHERE precaution_id IN (
        SELECT precaution_id
        FROM (
          SELECT precaution_id,
                 ROW_NUMBER() OVER (
                   PARTITION BY detail_id, LOWER(TRIM(precaution_text))
                   ORDER BY precaution_id
                 ) as rnum
          FROM product_precautions
        ) t
        WHERE rnum > 1
      )
      RETURNING precaution_id
    `);
    console.log(`  ✅ Removed ${precautionsResult.rowCount} duplicate precautions entries`);

    // 5. Clean product_interactions duplicates
    console.log("\n📋 Cleaning product_interactions...");
    const interactionsResult = await client.query(`
      DELETE FROM product_interactions
      WHERE interaction_id IN (
        SELECT interaction_id
        FROM (
          SELECT interaction_id,
                 ROW_NUMBER() OVER (
                   PARTITION BY detail_id, LOWER(TRIM(interaction_text))
                   ORDER BY interaction_id
                 ) as rnum
          FROM product_interactions
        ) t
        WHERE rnum > 1
      )
      RETURNING interaction_id
    `);
    console.log(`  ✅ Removed ${interactionsResult.rowCount} duplicate interactions entries`);

    // 6. Clean product_indications duplicates
    console.log("\n📋 Cleaning product_indications...");
    const indicationsResult = await client.query(`
      DELETE FROM product_indications
      WHERE indication_id IN (
        SELECT indication_id
        FROM (
          SELECT indication_id,
                 ROW_NUMBER() OVER (
                   PARTITION BY detail_id, LOWER(TRIM(indication_text))
                   ORDER BY indication_id
                 ) as rnum
          FROM product_indications
        ) t
        WHERE rnum > 1
      )
      RETURNING indication_id
    `);
    console.log(`  ✅ Removed ${indicationsResult.rowCount} duplicate indications entries`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 CLEANUP SUMMARY:");
    console.log("=".repeat(50));
    console.log(`Important Info: ${importantInfoResult.rowCount} duplicates removed`);
    console.log(`Ingredients: ${ingredientsResult.rowCount} duplicates removed`);
    console.log(`Side Effects: ${sideEffectsResult.rowCount} duplicates removed`);
    console.log(`Precautions: ${precautionsResult.rowCount} duplicates removed`);
    console.log(`Interactions: ${interactionsResult.rowCount} duplicates removed`);
    console.log(`Indications: ${indicationsResult.rowCount} duplicates removed`);
    console.log("=".repeat(50));
    
    const totalRemoved = 
      importantInfoResult.rowCount +
      ingredientsResult.rowCount +
      sideEffectsResult.rowCount +
      precautionsResult.rowCount +
      interactionsResult.rowCount +
      indicationsResult.rowCount;
    
    console.log(`\n✨ Total duplicates removed: ${totalRemoved}`);
    console.log("✅ Cleanup completed successfully!\n");

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the cleanup
cleanDuplicates()
  .then(() => {
    console.log("🎉 Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("💥 Fatal error:", err);
    process.exit(1);
  });
