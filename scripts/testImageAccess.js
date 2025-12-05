const fetch = require("node-fetch");

async function testImageURL() {
  try {
    // Test API response
    console.log("\n🔍 Testing API Response...\n");
    const apiResponse = await fetch("http://localhost:3001/api/products/1");
    const apiData = await apiResponse.json();
    
    if (apiData.success && apiData.data) {
      const product = apiData.data;
      console.log("✅ Product Name:", product.name);
      console.log("✅ Product ID:", product.id);
      console.log("✅ Image Field:", product.image);
      console.log("✅ Main Image URL:", product.main_image_url);
      
      // Test if Supabase URL is accessible
      console.log("\n🌐 Testing Supabase Image URL...\n");
      const imageUrl = product.image;
      
      try {
        const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
        console.log("Status:", imageResponse.status);
        console.log("Content-Type:", imageResponse.headers.get('content-type'));
        console.log("Content-Length:", imageResponse.headers.get('content-length'));
        
        if (imageResponse.status === 200) {
          console.log("\n✅ Image is ACCESSIBLE from Supabase!");
          console.log(`\nYou can open this URL in browser to view image:`);
          console.log(imageUrl);
        } else {
          console.log("\n❌ Image is NOT accessible (Status:", imageResponse.status, ")");
        }
      } catch (imgError) {
        console.error("\n❌ Failed to fetch image:", imgError.message);
      }
    } else {
      console.log("❌ API did not return product data");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testImageURL();
