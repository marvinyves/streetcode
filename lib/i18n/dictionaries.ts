export const locales = ["en", "sv"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const dictionaries = {
  en: {
    siteName: "Streetcode",
    tagline: "Your daily market brief, in a minute.",
    nav: {
      today: "Today",
      archive: "Archive",
    },
    today: {
      heading: "Today's Brief",
      empty: "No brief has been published yet. Check back soon.",
      keyEvents: "Key events",
      sentiment: "Sentiment notes",
      sources: "Sources",
      readArchive: "Browse the archive",
    },
    archive: {
      heading: "Archive",
      entryHeading: "Market Brief",
      subheading: "Every day's brief, permanently on record.",
      empty: "No briefs yet.",
      back: "Back to today",
    },
    askBar: {
      placeholder: "Ask about today's market...",
      send: "Ask",
      thinking: "Thinking...",
      error: "Something went wrong. Try again in a moment.",
      rateLimited: "You've asked a lot of questions today — try again later.",
      disclaimer: "Answers are grounded in recent briefs, not live data.",
    },
    localeSwitch: {
      en: "EN",
      sv: "SV",
    },
  },
  sv: {
    siteName: "Streetcode",
    tagline: "Din dagliga marknadsuppdatering, på en minut.",
    nav: {
      today: "Idag",
      archive: "Arkiv",
    },
    today: {
      heading: "Dagens uppdatering",
      empty: "Ingen uppdatering har publicerats än. Kom tillbaka snart.",
      keyEvents: "Viktiga händelser",
      sentiment: "Sentimentnoteringar",
      sources: "Källor",
      readArchive: "Bläddra i arkivet",
    },
    archive: {
      heading: "Arkiv",
      entryHeading: "Marknadsuppdatering",
      subheading: "Varje dags uppdatering, permanent sparad.",
      empty: "Inga uppdateringar än.",
      back: "Tillbaka till idag",
    },
    askBar: {
      placeholder: "Fråga om dagens marknad...",
      send: "Fråga",
      thinking: "Tänker...",
      error: "Något gick fel. Försök igen om en stund.",
      rateLimited: "Du har ställt många frågor idag — försök igen senare.",
      disclaimer: "Svaren baseras på senaste uppdateringarna, inte livedata.",
    },
    localeSwitch: {
      en: "EN",
      sv: "SV",
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
