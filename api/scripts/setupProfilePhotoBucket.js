/**
 * Supabase Storage Bucket Setup Script
 * Run this script to automatically create the profile-photos bucket
 * 
 * Usage: node api/scripts/setupProfilePhotoBucket.js
 */

require("dotenv").config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service key for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  console.log("\nPlease add to your .env file:");
  console.log("SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here");
  console.log("\nYou can find the Service Role Key in:");
  console.log("Supabase Dashboard → Settings → API → service_role key");
  process.exit(1);
}

async function createBucket() {
  try {
    console.log("📦 Creating profile-photos bucket...");

    // Create bucket
    const createResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/bucket`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          apikey: SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({
          id: "profile-photos",
          name: "profile-photos",
          public: true,
          file_size_limit: 5242880, // 5MB
          allowed_mime_types: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
        }),
      }
    );

    if (createResponse.ok) {
      console.log("✅ Bucket 'profile-photos' created successfully!");
    } else if (createResponse.status === 409) {
      console.log("ℹ️  Bucket 'profile-photos' already exists");
    } else {
      const error = await createResponse.text();
      console.error("❌ Failed to create bucket:", error);
    }

    console.log("\n📝 Next Steps:");
    console.log("1. Go to Supabase Dashboard → Storage → profile-photos");
    console.log("2. Click 'Policies' tab");
    console.log("3. Add the following policies:");
    console.log("\n   Policy 1: Allow authenticated users to upload");
    console.log("   Policy 2: Allow public to read");
    console.log("   Policy 3: Allow users to update their files");
    console.log("   Policy 4: Allow users to delete their files");
    console.log("\nSee PROFILE_PHOTO_SETUP.md for detailed SQL policies");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createBucket();
