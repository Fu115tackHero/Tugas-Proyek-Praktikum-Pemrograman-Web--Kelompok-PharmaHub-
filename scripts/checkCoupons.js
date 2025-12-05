/**
 * Quick test script to check if coupons exist and are properly configured
 * Run with: node api/scripts/checkCoupons.js
 */

const pool = require("../config/database");

async function checkCoupons() {
  try {
    console.log("🎫 Checking coupons in database...\n");

    const query = `
      SELECT 
        coupon_id,
        code,
        description,
        discount_type,
        discount_value,
        min_purchase,
        max_discount,
        usage_limit,
        usage_per_user,
        start_date,
        end_date,
        is_active,
        created_at
      FROM coupons
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      console.log("❌ No coupons found in database!");
      console.log("\n💡 You need to create coupons first.");
      console.log("   Example SQL:");
      console.log(`   INSERT INTO coupons (
     code, description, discount_type, discount_value, 
     min_purchase, start_date, end_date, is_active
   ) VALUES (
     'WELCOME10', 'Diskon 10% untuk pelanggan baru', 
     'percentage', 10, 50000, NOW(), NOW() + INTERVAL '30 days', TRUE
   );`);
    } else {
      console.log(`✅ Found ${result.rows.length} coupon(s):\n`);

      // Get usage counts for each coupon
      const usageQuery = `
        SELECT coupon_id, COUNT(*) as usage_count
        FROM coupon_usage
        GROUP BY coupon_id;
      `;
      const usageResult = await pool.query(usageQuery);
      const usageMap = {};
      usageResult.rows.forEach((row) => {
        usageMap[row.coupon_id] = parseInt(row.usage_count);
      });

      result.rows.forEach((coupon, index) => {
        const now = new Date();
        const startDate = new Date(coupon.start_date);
        const endDate = new Date(coupon.end_date);
        const isExpired = endDate < now;
        const notStarted = startDate > now;
        const usageCount = usageMap[coupon.coupon_id] || 0;
        const isMaxedOut =
          coupon.usage_limit !== null && usageCount >= coupon.usage_limit;

        console.log(`${index + 1}. Coupon: ${coupon.code}`);
        console.log(`   ID: ${coupon.coupon_id}`);
        if (coupon.description) {
          console.log(`   Description: ${coupon.description}`);
        }
        console.log(
          `   Discount: ${coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `Rp ${coupon.discount_value}`}`
        );
        if (coupon.max_discount) {
          console.log(`   Max Discount: Rp ${coupon.max_discount}`);
        }
        console.log(`   Min Purchase: Rp ${coupon.min_purchase || 0}`);
        console.log(
          `   Usage: ${usageCount}/${coupon.usage_limit || "unlimited"} (${coupon.usage_per_user} per user)`
        );
        console.log(`   Active: ${coupon.is_active ? "✅ Yes" : "❌ No"}`);
        console.log(`   Not Started: ${notStarted ? "❌ Yes" : "✅ No"}`);
        console.log(`   Expired: ${isExpired ? "❌ Yes" : "✅ No"}`);
        console.log(`   Maxed Out: ${isMaxedOut ? "❌ Yes" : "✅ No"}`);
        console.log(
          `   Valid Period: ${startDate.toLocaleDateString("id-ID")} - ${endDate.toLocaleDateString("id-ID")}`
        );

        // Check if coupon is usable
        const isUsable =
          coupon.is_active && !isExpired && !notStarted && !isMaxedOut;
        console.log(
          `   ${isUsable ? "🟢 USABLE" : "🔴 NOT USABLE"}`
        );
        console.log("");
      });

      // Summary
      const activeCoupons = result.rows.filter((c) => {
        const now = new Date();
        const startDate = new Date(c.start_date);
        const endDate = new Date(c.end_date);
        const isExpired = endDate < now;
        const notStarted = startDate > now;
        const usageCount = usageMap[c.coupon_id] || 0;
        const isMaxedOut = c.usage_limit !== null && usageCount >= c.usage_limit;
        return c.is_active && !isExpired && !notStarted && !isMaxedOut;
      });

      console.log("📊 SUMMARY:");
      console.log(`   Total coupons: ${result.rows.length}`);
      console.log(`   Active & usable: ${activeCoupons.length}`);
      console.log(`   Not usable: ${result.rows.length - activeCoupons.length}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking coupons:", error.message);
    process.exit(1);
  }
}

checkCoupons();
