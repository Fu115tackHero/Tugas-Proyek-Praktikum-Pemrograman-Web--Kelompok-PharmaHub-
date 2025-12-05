require("dotenv").config();

// Note: Supabase is optional for backend
// Frontend handles Supabase client for now
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

// Only initialize if @supabase/supabase-js is available and configured
const initializeSupabase = () => {
  try {
    const { createClient } = require("@supabase/supabase-js");

    if (
      SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      SUPABASE_URL !== "your-supabase-url-here" &&
      SUPABASE_ANON_KEY !== "your-supabase-anon-key-here"
    ) {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("✅ Supabase client initialized");
    } else {
      console.warn("⚠️ Supabase not configured");
    }
  } catch (error) {
    console.warn("⚠️ Supabase client not available:", error.message);
  }
};

initializeSupabase();

const isSupabaseConfigured = () => {
  return supabase !== null;
};

module.exports = {
  supabase,
  isSupabaseConfigured,
};
