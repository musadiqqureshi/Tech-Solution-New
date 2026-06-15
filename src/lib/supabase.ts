import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  ownerEmail: process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

/** True only when real Supabase credentials are configured. */
export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey
);

// A single browser client (persists the session in localStorage).
export const supabase = createClient(
  supabaseConfig.url || "https://placeholder.supabase.co",
  supabaseConfig.anonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
