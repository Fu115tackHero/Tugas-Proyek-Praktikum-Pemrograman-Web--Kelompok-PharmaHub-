const productService = require('../services/productService');

async function testHowItWorks() {
  try {
    console.log('Testing how_it_works field retrieval...\n');
    
    const allProducts = await productService.getAllProducts();
    
    if (allProducts.length > 0) {
      const firstProduct = allProducts[0];
      console.log('First Product from getAllProducts:');
      console.log('- ID:', firstProduct.product_id);
      console.log('- Name:', firstProduct.name);
      console.log('- Uses:', firstProduct.uses);
      console.log('- How It Works (DB):', firstProduct.how_it_works);
      console.log('- How It Works (Mapped):', firstProduct.howItWorks);
      console.log('- Description:', firstProduct.description);
      
      console.log('\n\nTesting getProductById...\n');
      const productById = await productService.getProductById(firstProduct.product_id);
      console.log('Product by ID:');
      console.log('- ID:', productById.product_id);
      console.log('- Name:', productById.name);
      console.log('- Uses:', productById.uses);
      console.log('- How It Works (DB):', productById.how_it_works);
      console.log('- How It Works (Mapped):', productById.howItWorks);
      console.log('- Description:', productById.description);
      
      if (productById.howItWorks || productById.how_it_works) {
        console.log('\n✅ how_it_works field is being returned correctly!');
      } else {
        console.log('\n⚠️  how_it_works is null/undefined for this product (may not be set in DB yet)');
      }
    } else {
      console.log('❌ No products found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testHowItWorks();
