import { config } from "dotenv";
config({ path: ".env.local" });

import {
  fetchFinnhubEarningsFull,
  fetchFinnhubEconomicCalendar,
} from "@/lib/pipeline/sources/finnhub";
import { fetchFredReleaseCalendar } from "@/lib/pipeline/sources/fred";
import { fetchEconomicCalendar } from "@/lib/pipeline/sources/economic-calendar";
import {
  fetchSectorHeatMap,
  fetchStockHeatMapQuotes,
} from "@/lib/pipeline/sources/heatmap";
import {
  upsertEconomicEvents,
  upsertEarningsEvents,
  upsertHeatMapSnapshot,
} from "@/lib/pipeline/upsert-calendar";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const today = process.argv[2] || todayISO();
  const weekAhead = addDaysISO(today, 7);

  console.log(`\n=== Generating calendar + heat map: ${today} → ${weekAhead} ===\n`);

  console.log("Fetching earnings calendar...");
  const earnings = await fetchFinnhubEarningsFull(today, weekAhead);
  console.log(`  ${earnings.length} earnings entries`);
  await upsertEarningsEvents(today, weekAhead, earnings);
  console.log("  Saved.");

  console.log("Fetching economic calendar...");
  let economic = await fetchEconomicCalendar(today, weekAhead);
  if (economic.length === 0) {
    console.log("  Free feed returned nothing; falling back to Finnhub...");
    const finnhub = await fetchFinnhubEconomicCalendar(today, weekAhead);
    economic = finnhub.map((e) => ({
      date: e.date,
      time: null,
      currency: "USD",
      label: e.label,
      detail: e.detail,
      importance: (e.importance as "high" | "medium" | "low" | null) ?? null,
    }));
  }
  if (economic.length === 0) {
    console.log("  Finnhub returned nothing either; falling back to FRED release dates...");
    const fredReleases = await fetchFredReleaseCalendar(today, weekAhead);
    economic = fredReleases.map((r) => ({
      date: r.date,
      time: null,
      currency: "USD",
      label: r.label,
      detail: null,
      importance: "high" as const,
    }));
  }
  console.log(`  ${economic.length} economic events`);
  await upsertEconomicEvents(today, weekAhead, economic);
  console.log("  Saved.");

  console.log("Fetching sector heat map...");
  const sectors = await fetchSectorHeatMap();
  console.log(`  ${sectors.length} sectors`);

  console.log("Fetching stock-level treemap quotes (this takes a bit, rate-limited)...");
  const stocks = await fetchStockHeatMapQuotes();
  console.log(`  ${stocks.length} stocks`);

  await upsertHeatMapSnapshot(today, sectors, stocks);
  console.log("  Saved.");

  console.log("\n✓ Calendar and heat map data updated.\n");
}

main().catch((err) => {
  console.error("\nPipeline failed:", err);
  process.exit(1);
});
