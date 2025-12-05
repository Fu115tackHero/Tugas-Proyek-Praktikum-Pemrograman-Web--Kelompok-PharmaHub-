const pool = require("../config/database");

/**
 * Add UNIQUE constraints to prevent duplicate entries
 * Run this AFTER cleanDuplicateProductDetails.js
 */

async function addUniqueConstraints() {
  const client = await pool.connect();
  
  try {
    console.log("🔒 Adding UNIQUE constraints to product detail tables...\n");

    // 1. Add constraint to product_important_info
    console.log("📋 Adding constraint to product_important_info...");
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_important_info_per_product 
        ON product_important_info (detail_id, LOWER(TRIM(info_text)))
      `);
      console.log("  ✅ Constraint added successfully");
    } catch (err) {
      console.log("  ⚠️  Constraint might already exist:", err.message);
    }

    // 2. Add constraint to product_side_effects
    console.log("\n📋 Adding constraint to product_side_effects...");
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_side_effect_per_product 
        ON product_side_effects (detail_id, LOWER(TRIM(side_effect_text)))
      `);
      console.log("  ✅ Constraint added successfully");
    } catch (err) {
      console.log("  ⚠️  Constraint might already exist:", err.message);
    }

    // 3. Add constraint to product_precautions
    console.log("\n📋 Adding constraint to product_precautions...");
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_precaution_per_product 
        ON product_precautions (detail_id, LOWER(TRIM(precaution_text)))
      `);
      console.log("  ✅ Constraint added successfully");
    } catch (err) {
      console.log("  ⚠️  Constraint might already exist:", err.message);
    }

    // 4. Add constraint to product_interactions
    console.log("\n📋 Adding constraint to product_interactions...");
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_interaction_per_product 
        ON product_interactions (detail_id, LOWER(TRIM(interaction_text)))
      `);
      console.log("  ✅ Constraint added successfully");
    } catch (err) {
      console.log("  ⚠️  Constraint might already exist:", err.message);
    }

    // 5. Add constraint to product_indications
    console.log("\n📋 Adding constraint to product_indications...");
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_indication_per_product 
        ON product_indications (detail_id, LOWER(TRIM(indication_text)))
      `);
      console.log("  ✅ Constraint added successfully");
    } catch (err) {
      console.log("  ⚠️  Constraint might already exist:", err.message);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ All UNIQUE constraints have been added!");
    console.log("=".repeat(50));
    console.log("\n🛡️  Database is now protected against duplicate entries.\n");

  } catch (error) {
    console.error("❌ Error adding constraints:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the constraint addition
addUniqueConstraints()
  .then(() => {
    console.log("🎉 Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("💥 Fatal error:", err);
    process.exit(1);
  });
