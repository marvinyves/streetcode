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
      calendar: "Calendar",
      heatmap: "Heat Map",
    },
    today: {
      heading: "Today's Brief",
      empty: "No brief has been published yet. Check back soon.",
      overnight: "Overnight & Premarket",
      keyEvents: "Key events",
      sentiment: "Sentiment notes",
      lookingAhead: "Looking Ahead",
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
    calendar: {
      heading: "This Week",
      subheading: "Economic releases and earnings reports, next 7 days.",
      economicHeading: "Economic Calendar",
      economicEmpty: "No major US economic releases scheduled this week.",
      earningsHeading: "Earnings Calendar",
      earningsEmpty: "No earnings reports found for this week.",
      beforeOpen: "Before open",
      afterClose: "After close",
    },
    heatmap: {
      heading: "Sector Heat Map",
      subheading: "S&P 500 sector ETF performance, updated daily.",
      empty: "No heat map data yet.",
      asOf: "As of",
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
      calendar: "Kalender",
      heatmap: "Värmekarta",
    },
    today: {
      heading: "Dagens uppdatering",
      empty: "Ingen uppdatering har publicerats än. Kom tillbaka snart.",
      overnight: "Över natten & i förhandeln",
      keyEvents: "Viktiga händelser",
      sentiment: "Sentimentnoteringar",
      lookingAhead: "Att vänta imorgon",
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
    calendar: {
      heading: "Denna vecka",
      subheading: "Ekonomiska utgivningar och kvartalsrapporter, kommande 7 dagar.",
      economicHeading: "Ekonomisk kalender",
      economicEmpty: "Inga större amerikanska ekonomiska utgivningar denna vecka.",
      earningsHeading: "Rapportkalender",
      earningsEmpty: "Inga kvartalsrapporter hittades för denna vecka.",
      beforeOpen: "Före öppning",
      afterClose: "Efter stängning",
    },
    heatmap: {
      heading: "Sektorernas värmekarta",
      subheading: "S&P 500-sektorernas utveckling (ETF), uppdateras dagligen.",
      empty: "Ingen data för värmekartan än.",
      asOf: "Per",
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
