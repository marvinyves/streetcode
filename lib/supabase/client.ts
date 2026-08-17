import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export type Brief = {
  id: string;
  date: string;
  brief_en: string;
  brief_sv: string | null;
  key_events: KeyEvent[];
  sentiment_notes: string | null;
  sources: Source[];
  created_at: string;
  updated_at: string;
};

export type KeyEvent = {
  type: string;
  label: string;
  detail?: string;
};

export type Source = {
  label: string;
  url: string;
};
