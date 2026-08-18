import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EconomicCalendarEvent } from "./sources/economic-calendar";
import type { FinnhubEarning } from "./sources/finnhub";
import type { SectorPerformance, StockPerformance } from "./sources/heatmap";

export async function upsertEconomicEvents(
  fromDate: string,
  toDate: string,
  events: EconomicCalendarEvent[],
) {
  const supabase = getSupabaseAdminClient();

  const { error: deleteError } = await supabase
    .from("economic_events")
    .delete()
    .gte("date", fromDate)
    .lte("date", toDate);
  if (deleteError) {
    throw new Error(`Failed to clear economic_events: ${deleteError.message}`);
  }

  if (events.length === 0) return;

  const { error } = await supabase.from("economic_events").insert(
    events.map((e) => ({
      date: e.date,
      time: e.time,
      currency: e.currency,
      label: e.label,
      detail: e.detail,
      importance: e.importance,
    })),
  );
  if (error) {
    throw new Error(`Failed to insert economic_events: ${error.message}`);
  }
}

export async function upsertEarningsEvents(
  fromDate: string,
  toDate: string,
  earnings: FinnhubEarning[],
) {
  const supabase = getSupabaseAdminClient();

  const { error: deleteError } = await supabase
    .from("earnings_events")
    .delete()
    .gte("date", fromDate)
    .lte("date", toDate);
  if (deleteError) {
    throw new Error(`Failed to clear earnings_events: ${deleteError.message}`);
  }

  if (earnings.length === 0) return;

  const deduped = Array.from(
    new Map(earnings.map((e) => [`${e.date}|${e.symbol}`, e])).values(),
  );

  const { error } = await supabase.from("earnings_events").insert(
    deduped.map((e) => ({ date: e.date, symbol: e.symbol, hour: e.hour })),
  );
  if (error) {
    throw new Error(`Failed to insert earnings_events: ${error.message}`);
  }
}

export async function upsertHeatMapSnapshot(
  date: string,
  sectors: SectorPerformance[],
  stocks: StockPerformance[],
) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("heat_map_snapshots")
    .upsert({ date, sectors, stocks }, { onConflict: "date" });
  if (error) {
    throw new Error(`Failed to upsert heat_map_snapshots: ${error.message}`);
  }
}
