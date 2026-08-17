import { config } from "dotenv";
config({ path: ".env.local" });

import { fetchFredData } from "@/lib/pipeline/sources/fred";
import {
  fetchFinnhubQuotes,
  fetchFinnhubEarnings,
  fetchFinnhubNews,
} from "@/lib/pipeline/sources/finnhub";
import { fetchRedditSentiment } from "@/lib/pipeline/sources/reddit";
import { researchMarketContext } from "@/lib/pipeline/anthropic-research";
import { draftBrief } from "@/lib/pipeline/anthropic-draft";
import { upsertBrief } from "@/lib/pipeline/upsert";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const date = process.argv[2] || todayISO();
  const weekAhead = addDaysISO(date, 7);

  console.log(`\n=== Generating brief for ${date} ===\n`);

  console.log("Fetching data sources...");
  const [fred, quotes, earnings, news, reddit] = await Promise.all([
    fetchFredData(),
    fetchFinnhubQuotes(),
    fetchFinnhubEarnings(date, weekAhead),
    fetchFinnhubNews(),
    fetchRedditSentiment(),
  ]);
  console.log(
    `  FRED: ${fred.length} series, quotes: ${quotes.length}, earnings: ${earnings.length}, news: ${news.length}, reddit: ${reddit.length}`,
  );

  console.log("Researching market narrative (web search)...");
  const webResearchMemo = await researchMarketContext({
    date,
    fred,
    quotes,
    earnings,
    news,
    reddit,
  });
  console.log(`  Memo length: ${webResearchMemo.length} chars`);

  console.log("Drafting structured brief...");
  const brief = await draftBrief({
    date,
    fred,
    quotes,
    earnings,
    news,
    reddit,
    webResearchMemo,
  });

  console.log("\n--- brief_en preview ---");
  console.log(brief.brief_en.split("\n").slice(0, 3).join("\n"), "...");

  console.log("\nUpserting into Supabase...");
  await upsertBrief(date, brief);

  console.log(`\n✓ Brief for ${date} generated and saved.\n`);
}

main().catch((err) => {
  console.error("\nPipeline failed:", err);
  process.exit(1);
});
