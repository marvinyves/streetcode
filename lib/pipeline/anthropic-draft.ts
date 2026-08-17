import Anthropic from "@anthropic-ai/sdk";
import type { ResearchBundle, DraftedBrief } from "./types";

const MODEL = "claude-sonnet-5";

const EVENT_ITEM_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", description: "e.g. macro, earnings, fed, commodity" },
    label: { type: "string" },
    detail: { type: "string" },
  },
  required: ["type", "label", "detail"],
  additionalProperties: false,
} as const;

const SOURCE_ITEM_SCHEMA = {
  type: "object",
  properties: {
    label: { type: "string" },
    url: { type: "string" },
  },
  required: ["label", "url"],
  additionalProperties: false,
} as const;

const BRIEF_SCHEMA = {
  type: "object",
  properties: {
    brief_en: {
      type: "string",
      description:
        "The main daily brief in English: short bullet points starting with '- ', one topic per bullet, plain language, no jargon overload. Cover index/futures movement, notable macro data, currency moves, gold, oil, and other commodities worth flagging.",
    },
    brief_sv: {
      type: "string",
      description:
        "The same facts and bullet structure as brief_en, in the same order — but written natively in Swedish, as a Swedish financial journalist would write it (not a translation of the English sentences). Use idiomatic Swedish financial phrasing (e.g. 'månad för månad' not a calque of 'month-over-month'; Swedish decimal commas; don't parenthesize the English term for something that already has a normal Swedish name, e.g. write 'styrräntan', not 'styrräntan (effective fed funds rate)').",
    },
    overnight_en: {
      type: "string",
      description:
        "1-3 short bullet points ('- ' prefixed) or short sentences in English covering the previous day's closing sentiment, overnight action, and premarket moves.",
    },
    overnight_sv: {
      type: "string",
      description:
        "The same facts as overnight_en, in the same order — but written natively in Swedish, as a Swedish financial journalist would write it (not a translation of the English sentences).",
    },
    sentiment_notes: {
      type: "string",
      description:
        "One or two sentences of qualitative retail/contrarian sentiment (from Reddit context if available). Empty string if nothing notable.",
    },
    key_events: {
      type: "array",
      description:
        "Structured macro releases, earnings, and notable movers for today, in English. The 'type' field is a short category tag (e.g. 'Macro', 'Geopolitical', 'Commodity', 'Earnings', 'Defense').",
      items: EVENT_ITEM_SCHEMA,
    },
    key_events_sv: {
      type: "array",
      description:
        "The same events as key_events, in the same order — but written natively in Swedish (label/detail as a Swedish financial writer would phrase them, not a translation; 'type' as the natural Swedish category word, e.g. 'Makro', 'Geopolitik', 'Råvaror', 'Rapport', 'Försvar').",
      items: EVENT_ITEM_SCHEMA,
    },
    looking_ahead: {
      type: "array",
      description:
        "What to watch tomorrow, in English: 1-3 structured items (scheduled releases, earnings, or a 'quiet calendar' item if nothing major).",
      items: EVENT_ITEM_SCHEMA,
    },
    looking_ahead_sv: {
      type: "array",
      description:
        "The same items as looking_ahead, in the same order, written natively in Swedish (not a translation).",
      items: EVENT_ITEM_SCHEMA,
    },
    sources: {
      type: "array",
      description: "What was pulled and from where, for traceability.",
      items: SOURCE_ITEM_SCHEMA,
    },
  },
  required: [
    "brief_en",
    "brief_sv",
    "overnight_en",
    "overnight_sv",
    "sentiment_notes",
    "key_events",
    "key_events_sv",
    "looking_ahead",
    "looking_ahead_sv",
    "sources",
  ],
  additionalProperties: false,
} as const;

function formatBundleForPrompt(bundle: ResearchBundle): string {
  const parts: string[] = [];

  if (bundle.fred.length) {
    parts.push(
      "FRED macro data:\n" +
        bundle.fred.map((f) => `- ${f.label}: ${f.value} (as of ${f.date})`).join("\n"),
    );
  }
  if (bundle.quotes.length) {
    parts.push(
      "Market quotes (ETF proxies):\n" +
        bundle.quotes
          .map((q) => `- ${q.label}: ${q.current} (${q.changePercent >= 0 ? "+" : ""}${q.changePercent}%)`)
          .join("\n"),
    );
  }
  if (bundle.earnings.length) {
    parts.push(
      "Upcoming earnings this week:\n" +
        bundle.earnings.map((e) => `- ${e.symbol} on ${e.date}${e.hour ? ` (${e.hour})` : ""}`).join("\n"),
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
        bundle.reddit.map((r) => `- r/${r.subreddit}: "${r.title}" (score ${r.score})`).join("\n"),
    );
  }
  if (bundle.webResearchMemo) {
    parts.push("Research memo (web search findings):\n" + bundle.webResearchMemo);
  }

  return parts.join("\n\n");
}

export async function draftBrief(bundle: ResearchBundle): Promise<DraftedBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");

  const anthropic = new Anthropic({ apiKey });
  const dataSummary = formatBundleForPrompt(bundle);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 5120,
    system:
      "You are the writer for a daily market brief website ('Streetcode'). Draft today's brief in the exact style of a professional but plain-language market wrap: short bullets, one topic per bullet, no unnecessary jargon. Use ONLY the data provided below — do not invent numbers or events. If a section has no real content, keep it minimal rather than padding it. " +
      "Author the English fields first (brief_en, overnight_en, key_events, looking_ahead). For every _sv field (brief_sv, overnight_sv, key_events_sv, looking_ahead_sv), do not translate word-for-word or mirror the English sentence structure — write it as a Swedish financial journalist would write it natively: natural Swedish word order, idiom, and phrasing (e.g. 'över natten' as an adverbial, not a headline noun phrase; Swedish's preference for compound nouns over strung-together prepositional phrases; verb-second word order; natural Swedish category words for each item's 'type', not a literal translation of the English tag). Each Swedish field should cover the same facts as its English counterpart, in the same order, but should not read as a literal translation of it.",
    messages: [
      {
        role: "user",
        content: `Today's date: ${bundle.date}\n\n${dataSummary}\n\nDraft today's full market brief now.`,
      },
    ],
    // `output_config` (structured outputs) is not yet in this SDK version's
    // type surface; the wire request is correct per the current API.
    output_config: {
      format: { type: "json_schema", schema: BRIEF_SCHEMA },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const textBlock = (response as Anthropic.Message).content.find(
    (b) => b.type === "text",
  );
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content returned from draft call.");
  }

  return JSON.parse(textBlock.text) as DraftedBrief;
}
