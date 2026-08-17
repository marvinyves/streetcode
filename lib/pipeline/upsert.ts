import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DraftedBrief } from "./types";

export async function upsertBrief(date: string, brief: DraftedBrief) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("briefs").upsert(
    {
      date,
      brief_en: brief.brief_en,
      brief_sv: brief.brief_sv,
      overnight_en: brief.overnight_en,
      overnight_sv: brief.overnight_sv,
      sentiment_notes: brief.sentiment_notes || null,
      key_events: brief.key_events,
      key_events_sv: brief.key_events_sv,
      looking_ahead: brief.looking_ahead,
      looking_ahead_sv: brief.looking_ahead_sv,
      sources: brief.sources,
    },
    { onConflict: "date" },
  );

  if (error) {
    throw new Error(`Failed to upsert brief for ${date}: ${error.message}`);
  }
}
