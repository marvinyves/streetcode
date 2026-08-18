import Anthropic from "@anthropic-ai/sdk";
import type { ResearchBundle } from "./types";

const MODEL = "claude-sonnet-5";

function formatDataForPrompt(
  bundle: Omit<ResearchBundle, "webResearchMemo">,
): string {
  const parts: string[] = [];

  if (bundle.fred.length) {
    parts.push(
      "FRED macro data:\n" +
        bundle.fred
          .map((f) => `- ${f.label}: ${f.value} (as of ${f.date})`)
          .join("\n"),
    );
  }

  if (bundle.quotes.length) {
    parts.push(
      "Market quotes (ETF proxies):\n" +
        bundle.quotes
          .map(
            (q) =>
              `- ${q.label}: ${q.current} (${q.changePercent >= 0 ? "+" : ""}${q.changePercent}%)`,
          )
          .join("\n"),
    );
  }

  if (bundle.earnings.length) {
    parts.push(
      "Upcoming earnings this week:\n" +
        bundle.earnings
          .map((e) => `- ${e.symbol} on ${e.date}${e.hour ? ` (${e.hour})` : ""}`)
          .join("\n"),
    );
  }

  if (bundle.news.length) {
    parts.push(
      "Recent market news headlines:\n" +
        bundle.news.map((n) => `- ${n.headline} (${n.source})`).join("\n"),
    );
  }

  if (bundle.reddit.length) {
    parts.push(
      "Retail sentiment (Reddit, illustrative only):\n" +
        bundle.reddit
          .map((r) => `- r/${r.subreddit}: "${r.title}" (score ${r.score})`)
          .join("\n"),
    );
  }

  return parts.join("\n\n") || "No structured data sources returned data today.";
}

export async function researchMarketContext(
  bundle: Omit<ResearchBundle, "webResearchMemo">,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");

  const anthropic = new Anthropic({ apiKey });
  const dataSummary = formatDataForPrompt(bundle);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 5,
        allowed_callers: ["direct"],
      },
    ],
    system:
      "You are a markets researcher. Given today's structured data snapshot, use web search to find the qualitative 'why' behind today's biggest moves — Fed commentary, geopolitical drivers, notable earnings reactions, or macro narrative. Write a short research memo (plain text, a few short paragraphs) that a financial writer can use as source material. Be factual and specific; note where information came from.",
    messages: [
      {
        role: "user",
        content: `Today's date: ${bundle.date}\n\n${dataSummary}\n\nResearch the narrative behind today's market moves and summarize it.`,
      },
    ],
  });

  const textBlocks = response.content.filter((b) => b.type === "text");
  return textBlocks.map((b) => b.text).join("\n\n").trim();
}
