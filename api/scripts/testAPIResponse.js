const fetch = require("node-fetch");

async function testAPI() {
  try {
    const response = await fetch("http://localhost:3001/api/products");
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      console.log("\n📦 Sample Product from API:\n");
      const product = data.data[0];
      console.log(JSON.stringify(product, null, 2));
      
      console.log("\n🔍 Available Fields:");
      Object.keys(product).forEach(key => {
        console.log(`  - ${key}: ${typeof product[key]}`);
      });
      
      console.log("\n📸 Image-related Fields:");
      Object.keys(product).forEach(key => {
        if (key.includes('image') || key.includes('url')) {
          console.log(`  - ${key}: ${product[key]}`);
        }
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testAPI();
