// Test File - Verify Token Key and API Integration
// Run this in browser console after logging in

console.log("🧪 Testing Deleted Products Modal Fix...\n");

// Test 1: Check if token exists
console.log("TEST 1: Token Existence");
const token = localStorage.getItem("pharmahub_token");
if (token) {
  console.log("✅ Token found!");
  console.log("   Length:", token.length);
  console.log("   First 20 chars:", token.substring(0, 20) + "...");
} else {
  console.log("❌ Token NOT found!");
  console.log("   Keys in localStorage:", Object.keys(localStorage));
}

// Test 2: Decode token (basic check)
console.log("\nTEST 2: Token Format");
try {
  const parts = token.split(".");
  if (parts.length === 3) {
    console.log("✅ Token format valid (3 parts with dots)");
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    console.log("   Decoded payload:", payload);
    
    if (payload.role === "admin") {
      console.log("✅ User is ADMIN");
    } else {
      console.log("⚠️  User role:", payload.role);
    }
  } else {
    console.log("❌ Invalid token format");
  }
} catch (e) {
  console.log("❌ Error decoding token:", e.message);
}

// Test 3: Test API call manually
console.log("\nTEST 3: Manual API Call Test");
console.log("Making GET request to /api/products/deleted...");

const testApiCall = async () => {
  try {
    const response = await fetch("/api/products/deleted", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Response Status:", response.status);
    
    if (response.status === 200) {
      console.log("✅ API returned 200 OK");
      const data = await response.json();
      console.log("   Deleted products found:", data.count);
      if (data.data && data.data.length > 0) {
        console.log("   First product:", data.data[0]);
      }
      return true;
    } else if (response.status === 401) {
      console.log("❌ API returned 401 Unauthorized");
      console.log("   This means token is not being sent correctly");
      return false;
    } else {
      console.log("⚠️  API returned status:", response.status);
      const data = await response.json();
      console.log("   Response:", data);
      return false;
    }
  } catch (error) {
    console.log("❌ Error calling API:", error.message);
    return false;
  }
};

// Run test
testApiCall().then(success => {
  if (success) {
    console.log("\n✨ All tests passed! Deleted products should now work.");
  } else {
    console.log("\n🚨 Tests failed. Check errors above.");
  }
});
