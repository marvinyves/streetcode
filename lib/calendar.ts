import { getSupabaseClient } from "@/lib/supabase/client";

export type EconomicEventRow = {
  id: string;
  date: string;
  label: string;
  detail: string | null;
  importance: string | null;
};

export type EarningsEventRow = {
  id: string;
  date: string;
  symbol: string;
  hour: string | null;
};

export type SectorPerformance = {
  symbol: string;
  label: string;
  changePercent: number;
};

export type StockPerformance = {
  symbol: string;
  sector: string;
  marketCapB: number;
  changePercent: number;
};

export type HeatMapSnapshot = {
  date: string;
  sectors: SectorPerformance[];
  stocks: StockPerformance[];
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function getEconomicEventsForWeek(): Promise<EconomicEventRow[]> {
  const from = todayISO();
  const to = addDaysISO(from, 7);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("economic_events")
    .select("*")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getEarningsForWeek(): Promise<EarningsEventRow[]> {
  const from = todayISO();
  const to = addDaysISO(from, 7);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("earnings_events")
    .select("*")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("symbol", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getLatestHeatMap(): Promise<HeatMapSnapshot | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("heat_map_snapshots")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
