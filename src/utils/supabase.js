import { createClient } from "@supabase/supabase-js";

// Mengambil URL dan Key dari file .env yang sudah kamu buat tadi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Membuat client untuk koneksi (atau null jika env belum diset)
export const supabase =
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== "your-supabase-url-here" &&
  supabaseKey !== "your-supabase-anon-key-here"
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Helper untuk cek apakah Supabase sudah dikonfigurasi
export const isSupabaseConfigured = () => {
  return supabase !== null;
};
