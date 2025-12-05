const axios = require("axios");
const API_BASE_URL = "http://localhost:3001/api";

(async () => {
  try {
    // Login
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "admin@pharmahub.com",
      password: "admin123",
    });
    const token = loginRes.data.token;
    console.log("✓ Login successful\n");

    // Get orders
    const ordersRes = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Orders API Response:");
    console.log("Type:", typeof ordersRes.data);
    console.log("Is Array:", Array.isArray(ordersRes.data));
    console.log("Keys:", Object.keys(ordersRes.data));
    console.log("\nStructure:");
    console.log(JSON.stringify(ordersRes.data, null, 2).substring(0, 500));
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response?.data) console.error("Response:", err.response.data);
  }
  process.exit(0);
})();
