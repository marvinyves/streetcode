import Anthropic from "@anthropic-ai/sdk";
import type { ResearchBundle, DraftedBrief } from "./types";

const MODEL = "claude-sonnet-5";

// A real example of the target tone/simplicity, supplied directly by the
// team as the baseline to write toward — short plain sentences, no ticker
// symbols in parentheses, qualitative magnitude ("steg lite", "ett smalt
// intervall") preferred over a percentage in every sentence, simple
// cause-effect explanations rather than dense multi-clause sentences.
const STYLE_EXAMPLE_SV = `Amerikanska börsterminer steg i morgonhandeln på måndagen. S&P 500 och Nasdaq hade gått upp för tredje veckan i rad. Lägre inflationssiffror minskade rädslan för att den amerikanska centralbanken snart skulle höja räntan. En stark rapportsäsong fortsatte också att ge stöd åt aktiemarknaden.

- Under den kommande veckan kommer stora företag att rapportera sina resultat, bland annat Home Depot, Target, TJX Companies och Walmart. Rapporterna kan ge nya ledtrådar om hur stark konsumenternas efterfrågan är.
- Investerare kommer också att titta noga på protokollet från Federal Reserves möte i juli på onsdag. De vill se vad centralbankens ledamöter tycker om inflationen och hur de ser på framtida räntor.
- Den amerikanska dollarn sjönk lite på måndagen efter svagare ekonomiska siffror från USA. Det minskade förväntningarna på en snar räntehöjning från Federal Reserve. Samtidigt stärktes den japanska yenen något, trots att Japans ekonomiska tillväxt var svagare än väntat.
- Guldpriset steg lite på måndagen och låg nära 4 400 dollar per uns. En svagare amerikansk dollar och svagare ekonomiska siffror hjälpte till att stödja guldpriset. Samtidigt gjorde osäkerheten kring energiförsörjningen i Mellanöstern att risken för högre inflation fortfarande var i fokus.
- Oljepriserna rörde sig lite upp och ner inom ett smalt intervall på måndagen efter att ha stigit mycket förra veckan. Fortsatt osäkerhet kring relationerna mellan USA och Iran och situationen vid Hormuzsundet hjälpte till att hålla oljepriserna uppe.`;

const EVENT_ITEM_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", description: "e.g. macro, earnings, fed, commodity" },
    label: { type: "string" },
    detail: { type: "string" },
    importance: {
      type: "string",
      enum: ["high", "medium", "low"],
      description:
        "How much this should stand out to a reader scanning quickly: 'high' for market-moving items (Fed decisions, major geopolitical escalation, surprise data), 'medium' for notable but not urgent items, 'low' for minor or routine items.",
    },
  },
  required: ["type", "label", "detail", "importance"],
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
        "The main daily brief in English: an opening plain-language paragraph setting the day's overall tone (no '- ' prefix), followed by 4-6 bullet points, one topic per bullet. CRITICAL FORMATTING: each bullet is its own line — separate bullets with a real newline character (\\n), and ONLY a real newline, never a ' - ' or '- ' in the middle of a line. Each bullet line starts with '- ' followed by that bullet's full text (2-3 SHORT plain sentences — see the STYLE_EXAMPLE_SV baseline in the system prompt for the target sentence length and simplicity, translated to English tone). Never put two bullets' worth of sentences on the same line. Write like you're explaining it to a smart friend who isn't a trader: state what happened, then explain briefly why in one simple clause. Do NOT put ticker symbols in parentheses after an index/asset name (write 'the S&P 500', not 'the S&P 500 (SPY)'); prefer plain qualitative magnitude ('rose slightly', 'moved in a narrow range') over citing a precise percentage in every single sentence — reserve exact figures for the one or two numbers that actually matter in that bullet. Cover index/futures movement, notable macro data, currency moves, gold, oil, and other commodities worth flagging.",
    },
    brief_sv: {
      type: "string",
      description:
        "The same facts, opening paragraph, bullet count, and per-bullet sentence count as brief_en, in the same order — but written natively in Swedish, matching the STYLE_EXAMPLE_SV baseline given in the system prompt as closely as possible in tone, sentence length, and simplicity (not a translation of the English sentences, and not more sophisticated/dense than that example). CRITICAL FORMATTING: same rule as brief_en — an opening paragraph with no '- ' prefix, then each bullet on its own line, separated by a real newline character (\\n) and starting with '- ', never joined onto one line with ' - ' in the middle. Use idiomatic Swedish financial phrasing (e.g. 'månad för månad' not a calque of 'month-over-month'; Swedish decimal commas (0,35 procent); Swedish thousands separator is a space, not a comma (4 400 dollar, not 4,400 dollar)). Do NOT parenthesize an English ticker/term next to its Swedish name (write 'styrräntan', not 'styrräntan (effective fed funds rate)'; write 'S&P 500', not 'S&P 500 (via SPY)'). Prefer plain qualitative magnitude ('steg lite', 'inom ett smalt intervall') over citing an exact percentage in every sentence.",
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
        "One or two sentences of qualitative retail/contrarian sentiment (from Reddit context if available), in English. Empty string if nothing notable.",
    },
    sentiment_notes_sv: {
      type: "string",
      description:
        "The same facts as sentiment_notes, in the same order — but written natively in Swedish, as a Swedish financial journalist would write it (not a translation of the English sentences). Empty string if nothing notable.",
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
    "sentiment_notes_sv",
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
    max_tokens: 16384,
    system:
      "You are the writer for a daily market brief website ('Streetcode'). Draft today's brief in the style of a plain-language market wrap for a general reader, not a trader's data dump: short, simple sentences; one topic per bullet; state what happened, then explain the context or reason in one plain clause; no unnecessary jargon; no ticker symbols in parentheses; prefer qualitative magnitude over a precise percentage in every sentence. Use ONLY the data provided below — do not invent numbers or events. If a section has no real content, keep it minimal rather than padding it. " +
      "The team has supplied a real example of the exact tone and simplicity to write toward (below, in Swedish — for brief_en, write with this same simplicity and sentence length, just in English). Match its short sentence length, its plain cause-effect logic, its light touch with exact figures, and its structure (one scene-setting paragraph, then bullets) as closely as possible — do not write denser or more sophisticated prose than this example, even though your own data may support more nuance:\n\n" +
      STYLE_EXAMPLE_SV +
      "\n\nAuthor the English fields first (brief_en, overnight_en, sentiment_notes, key_events, looking_ahead). For every _sv field (brief_sv, overnight_sv, sentiment_notes_sv, key_events_sv, looking_ahead_sv), do not translate word-for-word or mirror the English sentence structure — write it as a Swedish financial journalist would write it natively, in the voice of the example above: natural Swedish word order, idiom, and phrasing (e.g. 'över natten' as an adverbial, not a headline noun phrase; Swedish's preference for compound nouns over strung-together prepositional phrases; verb-second word order; natural Swedish category words for each item's 'type', not a literal translation of the English tag). Each Swedish field should cover the same facts as its English counterpart, in the same order, but should not read as a literal translation of it.",
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

  const message = response as Anthropic.Message;
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content returned from draft call.");
  }

  if (message.stop_reason === "max_tokens") {
    throw new Error(
      `Draft response was truncated at max_tokens (${message.usage?.output_tokens} output tokens) before the JSON completed — raise max_tokens in anthropic-draft.ts.`,
    );
  }

  try {
    return JSON.parse(textBlock.text) as DraftedBrief;
  } catch (err) {
    throw new Error(
      `Failed to parse draft JSON (stop_reason: ${message.stop_reason}): ${(err as Error).message}`,
    );
  }
}
