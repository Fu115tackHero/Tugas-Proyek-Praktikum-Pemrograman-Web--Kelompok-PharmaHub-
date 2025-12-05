const productService = require('../services/productService');

async function testDetailFields() {
  try {
    console.log('Testing getAllProducts with detail fields...\n');
    const allProducts = await productService.getAllProducts();
    
    if (allProducts.length > 0) {
      const firstProduct = allProducts[0];
      console.log('First Product:');
      console.log('- ID:', firstProduct.product_id);
      console.log('- Name:', firstProduct.name);
      console.log('- Brand:', firstProduct.brand);
      console.log('- Generic Name:', firstProduct.generic_name);
      console.log('- Uses:', firstProduct.uses);
      console.log('- Ingredients:', firstProduct.ingredients);
      console.log('- Side Effects:', firstProduct.side_effects);
      console.log('- Precaution:', firstProduct.precaution);
      console.log('- Interactions:', firstProduct.interactions);
      console.log('- Indication:', firstProduct.indication);
      
      console.log('\n\nTesting getProductById with detail fields...\n');
      const productById = await productService.getProductById(firstProduct.product_id);
      console.log('Product by ID:');
      console.log('- ID:', productById.product_id);
      console.log('- Name:', productById.name);
      console.log('- Brand:', productById.brand);
      console.log('- Generic Name:', productById.generic_name);
      console.log('- Uses:', productById.uses);
      console.log('- Ingredients:', productById.ingredients);
      console.log('- Side Effects:', productById.side_effects);
      console.log('- Precaution:', productById.precaution);
      console.log('- Interactions:', productById.interactions);
      console.log('- Indication:', productById.indication);
      console.log('\n✅ Detail fields are being returned!');
    } else {
      console.log('❌ No products found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDetailFields();
