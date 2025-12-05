const authService = require("../services/authService");

async function testLogin() {
  try {
    console.log("🔐 Testing login...");

    const result = await authService.loginUser({
      email: "joko@gmail.com",
      password: "jokowi123", // Ganti dengan password yang benar
    });

    console.log("\n✅ Login successful!");
    console.log("\n📦 Full result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n👤 User object:");
    console.log(JSON.stringify(result.user, null, 2));

    console.log("\n📸 Profile photo URL:");
    console.log(result.user?.profile_photo_url);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Login failed:", error.message);
    process.exit(1);
  }
}

testLogin();
