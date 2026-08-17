/**
 * Curated large-cap US stock universe, grouped by GICS-style sector, with an
 * approximate market cap (billions USD) used only for relative treemap tile
 * sizing — not displayed, not required to be perfectly current.
 */
export type UniverseStock = {
  symbol: string;
  name: string;
  sector: string;
  marketCapB: number;
};

export const STOCK_UNIVERSE: UniverseStock[] = [
  // Technology
  { symbol: "AAPL", name: "Apple", sector: "Technology", marketCapB: 3500 },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology", marketCapB: 3100 },
  { symbol: "NVDA", name: "Nvidia", sector: "Technology", marketCapB: 3300 },
  { symbol: "AVGO", name: "Broadcom", sector: "Technology", marketCapB: 900 },
  { symbol: "ORCL", name: "Oracle", sector: "Technology", marketCapB: 550 },
  { symbol: "CRM", name: "Salesforce", sector: "Technology", marketCapB: 300 },
  { symbol: "ADBE", name: "Adobe", sector: "Technology", marketCapB: 250 },
  { symbol: "AMD", name: "AMD", sector: "Technology", marketCapB: 250 },
  { symbol: "CSCO", name: "Cisco", sector: "Technology", marketCapB: 210 },
  { symbol: "QCOM", name: "Qualcomm", sector: "Technology", marketCapB: 180 },
  { symbol: "INTC", name: "Intel", sector: "Technology", marketCapB: 180 },
  { symbol: "TXN", name: "Texas Instruments", sector: "Technology", marketCapB: 170 },
  { symbol: "IBM", name: "IBM", sector: "Technology", marketCapB: 170 },

  // Communication Services
  { symbol: "GOOGL", name: "Alphabet", sector: "Communication Services", marketCapB: 2100 },
  { symbol: "META", name: "Meta Platforms", sector: "Communication Services", marketCapB: 1400 },
  { symbol: "NFLX", name: "Netflix", sector: "Communication Services", marketCapB: 350 },
  { symbol: "TMUS", name: "T-Mobile US", sector: "Communication Services", marketCapB: 220 },
  { symbol: "DIS", name: "Disney", sector: "Communication Services", marketCapB: 200 },
  { symbol: "VZ", name: "Verizon", sector: "Communication Services", marketCapB: 170 },
  { symbol: "T", name: "AT&T", sector: "Communication Services", marketCapB: 150 },

  // Consumer Cyclical
  { symbol: "AMZN", name: "Amazon", sector: "Consumer Cyclical", marketCapB: 2000 },
  { symbol: "TSLA", name: "Tesla", sector: "Consumer Cyclical", marketCapB: 900 },
  { symbol: "HD", name: "Home Depot", sector: "Consumer Cyclical", marketCapB: 380 },
  { symbol: "BKNG", name: "Booking Holdings", sector: "Consumer Cyclical", marketCapB: 150 },
  { symbol: "LOW", name: "Lowe's", sector: "Consumer Cyclical", marketCapB: 140 },
  { symbol: "MCD", name: "McDonald's", sector: "Consumer Cyclical", marketCapB: 210 },
  { symbol: "SBUX", name: "Starbucks", sector: "Consumer Cyclical", marketCapB: 100 },
  { symbol: "NKE", name: "Nike", sector: "Consumer Cyclical", marketCapB: 100 },
  { symbol: "TJX", name: "TJX Companies", sector: "Consumer Cyclical", marketCapB: 140 },

  // Healthcare
  { symbol: "LLY", name: "Eli Lilly", sector: "Healthcare", marketCapB: 800 },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare", marketCapB: 500 },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", marketCapB: 380 },
  { symbol: "ABBV", name: "AbbVie", sector: "Healthcare", marketCapB: 350 },
  { symbol: "MRK", name: "Merck", sector: "Healthcare", marketCapB: 260 },
  { symbol: "TMO", name: "Thermo Fisher Scientific", sector: "Healthcare", marketCapB: 200 },
  { symbol: "ABT", name: "Abbott Laboratories", sector: "Healthcare", marketCapB: 190 },
  { symbol: "PFE", name: "Pfizer", sector: "Healthcare", marketCapB: 160 },
  { symbol: "GILD", name: "Gilead Sciences", sector: "Healthcare", marketCapB: 120 },

  // Financial Services
  { symbol: "BRK-B", name: "Berkshire Hathaway", sector: "Financial", marketCapB: 950 },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financial", marketCapB: 600 },
  { symbol: "V", name: "Visa", sector: "Financial", marketCapB: 550 },
  { symbol: "MA", name: "Mastercard", sector: "Financial", marketCapB: 470 },
  { symbol: "BAC", name: "Bank of America", sector: "Financial", marketCapB: 320 },
  { symbol: "WFC", name: "Wells Fargo", sector: "Financial", marketCapB: 230 },
  { symbol: "AXP", name: "American Express", sector: "Financial", marketCapB: 190 },
  { symbol: "MS", name: "Morgan Stanley", sector: "Financial", marketCapB: 190 },
  { symbol: "GS", name: "Goldman Sachs", sector: "Financial", marketCapB: 150 },
  { symbol: "C", name: "Citigroup", sector: "Financial", marketCapB: 130 },

  // Industrials
  { symbol: "GE", name: "GE Aerospace", sector: "Industrials", marketCapB: 200 },
  { symbol: "CAT", name: "Caterpillar", sector: "Industrials", marketCapB: 190 },
  { symbol: "RTX", name: "RTX Corporation", sector: "Industrials", marketCapB: 170 },
  { symbol: "HON", name: "Honeywell", sector: "Industrials", marketCapB: 140 },
  { symbol: "UNP", name: "Union Pacific", sector: "Industrials", marketCapB: 140 },
  { symbol: "DE", name: "Deere & Company", sector: "Industrials", marketCapB: 120 },
  { symbol: "BA", name: "Boeing", sector: "Industrials", marketCapB: 110 },
  { symbol: "LMT", name: "Lockheed Martin", sector: "Industrials", marketCapB: 110 },

  // Consumer Defensive
  { symbol: "WMT", name: "Walmart", sector: "Consumer Defensive", marketCapB: 600 },
  { symbol: "COST", name: "Costco", sector: "Consumer Defensive", marketCapB: 400 },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Defensive", marketCapB: 380 },
  { symbol: "KO", name: "Coca-Cola", sector: "Consumer Defensive", marketCapB: 280 },
  { symbol: "PEP", name: "PepsiCo", sector: "Consumer Defensive", marketCapB: 230 },
  { symbol: "PM", name: "Philip Morris International", sector: "Consumer Defensive", marketCapB: 200 },

  // Energy
  { symbol: "XOM", name: "ExxonMobil", sector: "Energy", marketCapB: 480 },
  { symbol: "CVX", name: "Chevron", sector: "Energy", marketCapB: 290 },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy", marketCapB: 140 },

  // Utilities
  { symbol: "NEE", name: "NextEra Energy", sector: "Utilities", marketCapB: 150 },
  { symbol: "SO", name: "Southern Company", sector: "Utilities", marketCapB: 100 },
  { symbol: "DUK", name: "Duke Energy", sector: "Utilities", marketCapB: 90 },

  // Real Estate
  { symbol: "PLD", name: "Prologis", sector: "Real Estate", marketCapB: 100 },
  { symbol: "AMT", name: "American Tower", sector: "Real Estate", marketCapB: 90 },
  { symbol: "EQIX", name: "Equinix", sector: "Real Estate", marketCapB: 80 },

  // Basic Materials
  { symbol: "LIN", name: "Linde", sector: "Basic Materials", marketCapB: 220 },
  { symbol: "SHW", name: "Sherwin-Williams", sector: "Basic Materials", marketCapB: 70 },
  { symbol: "ECL", name: "Ecolab", sector: "Basic Materials", marketCapB: 60 },
];
