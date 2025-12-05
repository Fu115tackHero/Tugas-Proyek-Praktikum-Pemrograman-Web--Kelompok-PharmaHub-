/**
 * Test Script for Authentication Endpoints
 * Run: node api/scripts/testAuth.js
 */

const axios = require("axios");

const API_BASE = "http://localhost:3001/api";

async function testEndpoint(method, endpoint, body = null, token = null) {
  const config = {
    method,
    url: `${API_BASE}${endpoint}`,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    config.data = body;
  }

  try {
    const response = await axios(config);
    return { status: response.status, data: response.data };
  } catch (error) {
    if (error.response) {
      return { status: error.response.status, data: error.response.data };
    }
    return { error: error.message };
  }
}

async function main() {
  console.log("🧪 Testing PharmaHub Authentication API\n");

  // Test 1: Health Check
  console.log("1️⃣  Testing Health Check (GET /api)");
  const health = await testEndpoint("GET", "/");
  console.log("   Status:", health.status);
  console.log("   Response:", JSON.stringify(health.data, null, 2));
  console.log();

  // Test 2: Register User
  console.log("2️⃣  Testing User Registration (POST /api/auth/register)");
  const registerData = {
    name: "John Doe",
    email: `test${Date.now()}@pharmahub.com`, // Unique email
    password: "password123",
    phone: "08123456789",
    address: "Jl. Test No. 123",
  };
  const register = await testEndpoint("POST", "/auth/register", registerData);
  console.log("   Status:", register.status);
  console.log("   Response:", JSON.stringify(register.data, null, 2));
  console.log();

  if (!register.data?.success) {
    console.error("❌ Registration failed! Stopping tests.");
    return;
  }

  const token = register.data.token;
  console.log("✅ Registration successful! Token saved.\n");

  // Test 3: Login User
  console.log("3️⃣  Testing User Login (POST /api/auth/login)");
  const loginData = {
    email: registerData.email,
    password: registerData.password,
  };
  const login = await testEndpoint("POST", "/auth/login", loginData);
  console.log("   Status:", login.status);
  console.log("   Response:", JSON.stringify(login.data, null, 2));
  console.log();

  // Test 4: Get Profile (with token)
  console.log("4️⃣  Testing Get Profile (GET /api/auth/me)");
  const profile = await testEndpoint("GET", "/auth/me", null, token);
  console.log("   Status:", profile.status);
  console.log("   Response:", JSON.stringify(profile.data, null, 2));
  console.log();

  // Test 5: Verify Token
  console.log("5️⃣  Testing Token Verification (POST /api/auth/verify)");
  const verify = await testEndpoint("POST", "/auth/verify", { token });
  console.log("   Status:", verify.status);
  console.log("   Response:", JSON.stringify(verify.data, null, 2));
  console.log();

  // Test 6: Invalid Login
  console.log("6️⃣  Testing Invalid Login (POST /api/auth/login)");
  const invalidLogin = await testEndpoint("POST", "/auth/login", {
    email: registerData.email,
    password: "wrongpassword",
  });
  console.log("   Status:", invalidLogin.status);
  console.log("   Response:", JSON.stringify(invalidLogin.data, null, 2));
  console.log();

  console.log("✅ All tests completed!");
}

main().catch(console.error);
