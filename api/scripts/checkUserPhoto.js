const pool = require("../config/database");

async function checkUserPhoto() {
  try {
    const result = await pool.query(
      "SELECT user_id, name, email, profile_photo_url FROM users WHERE email = $1",
      ["joko@gmail.com"]
    );

    if (result.rows.length > 0) {
      console.log("✅ User found:");
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log("❌ User not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkUserPhoto();
