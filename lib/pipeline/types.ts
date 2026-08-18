import type { KeyEvent, Source } from "@/lib/supabase/client";

export type ResearchBundle = {
  date: string;
  fred: import("./sources/fred").FredSeriesResult[];
  quotes: import("./sources/finnhub").FinnhubQuote[];
  earnings: import("./sources/finnhub").FinnhubEarning[];
  news: import("./sources/finnhub").FinnhubNews[];
  reddit: import("./sources/reddit").RedditPost[];
  webResearchMemo: string;
};

export type DraftedBrief = {
  brief_en: string;
  brief_sv: string;
  overnight_en: string;
  overnight_sv: string;
  sentiment_notes: string;
  sentiment_notes_sv: string;
  key_events: KeyEvent[];
  key_events_sv: KeyEvent[];
  looking_ahead: KeyEvent[];
  looking_ahead_sv: KeyEvent[];
  sources: Source[];
};
