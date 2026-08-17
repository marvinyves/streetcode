export const locales = ["sv", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "sv";

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
      openMenu: "Open menu",
      closeMenu: "Close menu",
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
      weekEarnings: "This Week's Earnings",
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
      heading: "Market Heat Map",
      subheading: "Major US stocks by sector, sized by market cap, colored by today's move.",
      empty: "No heat map data yet.",
      asOf: "As of",
      legendCaption: "Color intensity shows the size of today's move",
      viewFull: "View full heat map",
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
      openMenu: "Öppna meny",
      closeMenu: "Stäng meny",
    },
    today: {
      heading: "Dagens uppdatering",
      empty: "Ingen uppdatering har publicerats än. Kom tillbaka snart.",
      overnight: "Under natten och i förhandeln",
      keyEvents: "Viktiga händelser",
      sentiment: "Sentiment",
      lookingAhead: "Vad som väntar imorgon",
      sources: "Källor",
      readArchive: "Bläddra i arkivet",
      weekEarnings: "Veckans rapporter",
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
      subheading: "Makrostatistik och kvartalsrapporter de kommande 7 dagarna.",
      economicHeading: "Ekonomisk kalender",
      economicEmpty: "Ingen större amerikansk makrostatistik denna vecka.",
      earningsHeading: "Rapportkalender",
      earningsEmpty: "Inga kvartalsrapporter hittades för denna vecka.",
      beforeOpen: "Före öppning",
      afterClose: "Efter stängning",
    },
    heatmap: {
      heading: "Marknadens värmekarta",
      subheading: "Stora amerikanska bolag efter sektor, storlek efter börsvärde, färg efter dagens rörelse.",
      empty: "Det finns ingen data för värmekartan ännu.",
      asOf: "Per",
      legendCaption: "Färgstyrkan visar storleken på dagens rörelse",
      viewFull: "Visa hela värmekartan",
    },
    askBar: {
      placeholder: "Fråga om dagens marknad...",
      send: "Fråga",
      thinking: "Tänker...",
      error: "Något gick fel. Försök igen om en stund.",
      rateLimited: "Du har ställt många frågor idag — försök igen senare.",
      disclaimer: "Svaren bygger på de senaste uppdateringarna, inte realtidsdata.",
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
