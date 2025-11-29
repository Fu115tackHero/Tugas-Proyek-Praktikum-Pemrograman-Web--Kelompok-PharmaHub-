/**
 * Image Upload Utility
 * Helper functions for uploading images to Supabase Storage
 */

import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} bucket - Bucket name (default: 'product-images')
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export async function uploadImage(file, bucket = "product-images") {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase belum dikonfigurasi. Silakan set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env"
    );
  }

  try {
    // Validate file
    if (!file) {
      throw new Error("File tidak ditemukan");
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Format file harus JPG, PNG, atau WebP");
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Ukuran file maksimal 5MB");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}_${randomString}.${fileExt}`;

    console.log("📤 Uploading image:", fileName);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Upload error:", error);
      throw error;
    }

    console.log("✅ Upload success:", data);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    console.log("🔗 Public URL:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    throw new Error("Gagal mengupload gambar: " + error.message);
  }
}

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Full URL of image to delete
 * @param {string} bucket - Bucket name (default: 'product-images')
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteImage(imageUrl, bucket = "product-images") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum dikonfigurasi");
  }

  try {
    // Extract filename from URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    console.log("🗑️ Deleting image:", fileName);

    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) {
      console.error("❌ Delete error:", error);
      throw error;
    }

    console.log("✅ Image deleted successfully");
    return true;
  } catch (error) {
    console.error("❌ Error deleting image:", error);
    throw new Error("Gagal menghapus gambar: " + error.message);
  }
}

/**
 * Get image preview URL (for display before upload)
 * @param {File} file - Image file
 * @returns {string} - Object URL for preview
 */
export function getImagePreview(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke image preview URL (cleanup)
 * @param {string} url - Object URL to revoke
 */
export function revokeImagePreview(url) {
  URL.revokeObjectURL(url);
}

export default {
  uploadImage,
  deleteImage,
  getImagePreview,
  revokeImagePreview,
};
