const pool = require('../config/database');

/**
 * Check dependencies for a product before deletion
 */
async function checkProductDependencies(productId) {
  console.log(`\n🔍 Checking dependencies for Product ID: ${productId}\n`);
  
  try {
    // Check in cart
    const cartCheck = await pool.query(
      `SELECT COUNT(*) as count, 
       json_agg(json_build_object('user_id', user_id, 'quantity', quantity)) as users
       FROM cart_items WHERE product_id = $1`,
      [productId]
    );
    
    // Check in saved for later
    const savedCheck = await pool.query(
      `SELECT COUNT(*) as count,
       json_agg(json_build_object('user_id', user_id)) as users
       FROM saved_for_later WHERE product_id = $1`,
      [productId]
    );
    
    // Check in active orders
    const activeOrderCheck = await pool.query(
      `SELECT COUNT(*) as count,
       json_agg(json_build_object('order_id', o.order_id, 'order_status', o.order_status, 'order_number', o.order_number)) as orders
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.product_id = $1 AND o.order_status IN ('pending', 'processing', 'shipped')`,
      [productId]
    );
    
    // Check in completed orders (historical)
    const completedOrderCheck = await pool.query(
      `SELECT COUNT(*) as count
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.product_id = $1 AND o.order_status IN ('delivered', 'cancelled')`,
      [productId]
    );
    
    // Check reviews
    const reviewCheck = await pool.query(
      `SELECT COUNT(*) as count FROM product_reviews WHERE product_id = $1`,
      [productId]
    );
    
    // Check notifications
    const notifCheck = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE related_product_id = $1`,
      [productId]
    );
    
    // Check sales reports
    const salesReportCheck = await pool.query(
      `SELECT COUNT(*) as count FROM sales_reports WHERE top_selling_product_id = $1`,
      [productId]
    );
    
    // Get product info
    const productInfo = await pool.query(
      `SELECT product_id, name, is_available FROM products WHERE product_id = $1`,
      [productId]
    );
    
    // Print results
    console.log('📦 Product Info:');
    if (productInfo.rows.length > 0) {
      console.log(`   Name: ${productInfo.rows[0].name}`);
      console.log(`   Available: ${productInfo.rows[0].is_available}`);
    } else {
      console.log('   ❌ Product not found!');
      return;
    }
    
    console.log('\n🚨 BLOCKING Dependencies (Cannot delete):');
    let canDelete = true;
    
    const cartCount = parseInt(cartCheck.rows[0].count);
    if (cartCount > 0) {
      console.log(`   ❌ In ${cartCount} user cart(s)`);
      canDelete = false;
    } else {
      console.log(`   ✅ Not in any cart`);
    }
    
    const savedCount = parseInt(savedCheck.rows[0].count);
    if (savedCount > 0) {
      console.log(`   ❌ Saved by ${savedCount} user(s)`);
      canDelete = false;
    } else {
      console.log(`   ✅ Not saved by any user`);
    }
    
    const activeOrderCount = parseInt(activeOrderCheck.rows[0].count);
    if (activeOrderCount > 0) {
      console.log(`   ❌ In ${activeOrderCount} active order(s)`);
      if (activeOrderCheck.rows[0].orders) {
        console.log('      Orders:', JSON.stringify(activeOrderCheck.rows[0].orders, null, 2));
      }
      canDelete = false;
    } else {
      console.log(`   ✅ Not in any active orders`);
    }
    
    console.log('\n📊 Non-Blocking Dependencies (Will be handled):');
    
    const completedOrderCount = parseInt(completedOrderCheck.rows[0].count);
    console.log(`   ℹ️  In ${completedOrderCount} completed order(s) (historical - kept)`);
    
    const reviewCount = parseInt(reviewCheck.rows[0].count);
    console.log(`   ℹ️  Has ${reviewCount} review(s) (will be deleted)`);
    
    const notifCount = parseInt(notifCheck.rows[0].count);
    console.log(`   ℹ️  Referenced in ${notifCount} notification(s) (will be set NULL)`);
    
    const salesReportCount = parseInt(salesReportCheck.rows[0].count);
    console.log(`   ℹ️  In ${salesReportCount} sales report(s) (will be set NULL)`);
    
    console.log('\n' + '='.repeat(60));
    if (canDelete) {
      console.log('✅ SAFE TO DELETE');
    } else {
      console.log('❌ CANNOT DELETE - Resolve blocking dependencies first');
    }
    console.log('='.repeat(60) + '\n');
    
    return {
      canDelete,
      blocking: {
        carts: cartCount,
        saved: savedCount,
        activeOrders: activeOrderCount
      },
      nonBlocking: {
        completedOrders: completedOrderCount,
        reviews: reviewCount,
        notifications: notifCount,
        salesReports: salesReportCount
      }
    };
    
  } catch (error) {
    console.error('❌ Error checking dependencies:', error.message);
    throw error;
  }
}

/**
 * Check dependencies for a category before deletion
 */
async function checkCategoryDependencies(categoryId) {
  console.log(`\n🔍 Checking dependencies for Category ID: ${categoryId}\n`);
  
  try {
    // Check active products
    const productCheck = await pool.query(
      `SELECT COUNT(*) as count,
       json_agg(json_build_object('product_id', product_id, 'name', name)) as products
       FROM products 
       WHERE category_id = $1 AND is_available = true`,
      [categoryId]
    );
    
    // Check all products (including inactive)
    const allProductCheck = await pool.query(
      `SELECT COUNT(*) as count FROM products WHERE category_id = $1`,
      [categoryId]
    );
    
    // Check child categories
    const childCatCheck = await pool.query(
      `SELECT COUNT(*) as count,
       json_agg(json_build_object('category_id', category_id, 'name', category_name)) as categories
       FROM product_categories 
       WHERE parent_category_id = $1 AND is_active = true`,
      [categoryId]
    );
    
    // Get category info
    const categoryInfo = await pool.query(
      `SELECT category_id, category_name, is_active, parent_category_id 
       FROM product_categories WHERE category_id = $1`,
      [categoryId]
    );
    
    // Print results
    console.log('📁 Category Info:');
    if (categoryInfo.rows.length > 0) {
      console.log(`   Name: ${categoryInfo.rows[0].category_name}`);
      console.log(`   Active: ${categoryInfo.rows[0].is_active}`);
      console.log(`   Parent ID: ${categoryInfo.rows[0].parent_category_id || 'None (Root)'}`);
    } else {
      console.log('   ❌ Category not found!');
      return;
    }
    
    console.log('\n🚨 BLOCKING Dependencies (Cannot delete):');
    let canDelete = true;
    
    const activeProductCount = parseInt(productCheck.rows[0].count);
    if (activeProductCount > 0) {
      console.log(`   ❌ Has ${activeProductCount} active product(s)`);
      if (productCheck.rows[0].products && productCheck.rows[0].products[0]) {
        console.log('      Products:', JSON.stringify(productCheck.rows[0].products.slice(0, 5), null, 2));
        if (activeProductCount > 5) {
          console.log(`      ... and ${activeProductCount - 5} more`);
        }
      }
      canDelete = false;
    } else {
      console.log(`   ✅ No active products`);
    }
    
    const childCatCount = parseInt(childCatCheck.rows[0].count);
    if (childCatCount > 0) {
      console.log(`   ❌ Has ${childCatCount} active child categor${childCatCount > 1 ? 'ies' : 'y'}`);
      if (childCatCheck.rows[0].categories && childCatCheck.rows[0].categories[0]) {
        console.log('      Categories:', JSON.stringify(childCatCheck.rows[0].categories, null, 2));
      }
      canDelete = false;
    } else {
      console.log(`   ✅ No active child categories`);
    }
    
    console.log('\n📊 Non-Blocking Dependencies:');
    const allProductCount = parseInt(allProductCheck.rows[0].count);
    const inactiveProductCount = allProductCount - activeProductCount;
    console.log(`   ℹ️  Has ${inactiveProductCount} inactive product(s) (historical)`);
    
    console.log('\n' + '='.repeat(60));
    if (canDelete) {
      console.log('✅ SAFE TO SOFT DELETE (set is_active = false)');
    } else {
      console.log('❌ CANNOT DELETE - Resolve blocking dependencies first');
      console.log('   💡 Suggestions:');
      if (activeProductCount > 0) {
        console.log('      - Move products to another category');
        console.log('      - Or set products to inactive first');
      }
      if (childCatCount > 0) {
        console.log('      - Move child categories to another parent');
        console.log('      - Or delete/deactivate child categories first');
      }
    }
    console.log('='.repeat(60) + '\n');
    
    return {
      canDelete,
      blocking: {
        activeProducts: activeProductCount,
        childCategories: childCatCount
      },
      nonBlocking: {
        inactiveProducts: inactiveProductCount,
        totalProducts: allProductCount
      }
    };
    
  } catch (error) {
    console.error('❌ Error checking dependencies:', error.message);
    throw error;
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n📖 Usage:');
    console.log('   node checkDeleteDependencies.js product <product_id>');
    console.log('   node checkDeleteDependencies.js category <category_id>');
    console.log('\n📝 Examples:');
    console.log('   node checkDeleteDependencies.js product 1');
    console.log('   node checkDeleteDependencies.js category 5\n');
    process.exit(1);
  }
  
  const [type, id] = args;
  
  try {
    if (type === 'product') {
      await checkProductDependencies(parseInt(id));
    } else if (type === 'category') {
      await checkCategoryDependencies(parseInt(id));
    } else {
      console.error('❌ Invalid type. Use "product" or "category"');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkProductDependencies,
  checkCategoryDependencies
};
