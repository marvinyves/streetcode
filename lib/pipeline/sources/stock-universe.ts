/**
 * Curated large-cap US stock universe, grouped by GICS-style sector, with an
 * approximate market cap (billions USD) used only for relative treemap tile
 * sizing — not displayed, not required to be perfectly current.
 */
export type UniverseStock = {
  symbol: string;
  sector: string;
  marketCapB: number;
};

export const STOCK_UNIVERSE: UniverseStock[] = [
  // Technology
  { symbol: "AAPL", sector: "Technology", marketCapB: 3500 },
  { symbol: "MSFT", sector: "Technology", marketCapB: 3100 },
  { symbol: "NVDA", sector: "Technology", marketCapB: 3300 },
  { symbol: "AVGO", sector: "Technology", marketCapB: 900 },
  { symbol: "ORCL", sector: "Technology", marketCapB: 550 },
  { symbol: "CRM", sector: "Technology", marketCapB: 300 },
  { symbol: "ADBE", sector: "Technology", marketCapB: 250 },
  { symbol: "AMD", sector: "Technology", marketCapB: 250 },
  { symbol: "CSCO", sector: "Technology", marketCapB: 210 },
  { symbol: "QCOM", sector: "Technology", marketCapB: 180 },
  { symbol: "INTC", sector: "Technology", marketCapB: 180 },
  { symbol: "TXN", sector: "Technology", marketCapB: 170 },
  { symbol: "IBM", sector: "Technology", marketCapB: 170 },

  // Communication Services
  { symbol: "GOOGL", sector: "Communication Services", marketCapB: 2100 },
  { symbol: "META", sector: "Communication Services", marketCapB: 1400 },
  { symbol: "NFLX", sector: "Communication Services", marketCapB: 350 },
  { symbol: "TMUS", sector: "Communication Services", marketCapB: 220 },
  { symbol: "DIS", sector: "Communication Services", marketCapB: 200 },
  { symbol: "VZ", sector: "Communication Services", marketCapB: 170 },
  { symbol: "T", sector: "Communication Services", marketCapB: 150 },

  // Consumer Cyclical
  { symbol: "AMZN", sector: "Consumer Cyclical", marketCapB: 2000 },
  { symbol: "TSLA", sector: "Consumer Cyclical", marketCapB: 900 },
  { symbol: "HD", sector: "Consumer Cyclical", marketCapB: 380 },
  { symbol: "BKNG", sector: "Consumer Cyclical", marketCapB: 150 },
  { symbol: "LOW", sector: "Consumer Cyclical", marketCapB: 140 },
  { symbol: "MCD", sector: "Consumer Cyclical", marketCapB: 210 },
  { symbol: "SBUX", sector: "Consumer Cyclical", marketCapB: 100 },
  { symbol: "NKE", sector: "Consumer Cyclical", marketCapB: 100 },
  { symbol: "TJX", sector: "Consumer Cyclical", marketCapB: 140 },

  // Healthcare
  { symbol: "LLY", sector: "Healthcare", marketCapB: 800 },
  { symbol: "UNH", sector: "Healthcare", marketCapB: 500 },
  { symbol: "JNJ", sector: "Healthcare", marketCapB: 380 },
  { symbol: "ABBV", sector: "Healthcare", marketCapB: 350 },
  { symbol: "MRK", sector: "Healthcare", marketCapB: 260 },
  { symbol: "TMO", sector: "Healthcare", marketCapB: 200 },
  { symbol: "ABT", sector: "Healthcare", marketCapB: 190 },
  { symbol: "PFE", sector: "Healthcare", marketCapB: 160 },
  { symbol: "GILD", sector: "Healthcare", marketCapB: 120 },

  // Financial Services
  { symbol: "BRK-B", sector: "Financial", marketCapB: 950 },
  { symbol: "JPM", sector: "Financial", marketCapB: 600 },
  { symbol: "V", sector: "Financial", marketCapB: 550 },
  { symbol: "MA", sector: "Financial", marketCapB: 470 },
  { symbol: "BAC", sector: "Financial", marketCapB: 320 },
  { symbol: "WFC", sector: "Financial", marketCapB: 230 },
  { symbol: "AXP", sector: "Financial", marketCapB: 190 },
  { symbol: "MS", sector: "Financial", marketCapB: 190 },
  { symbol: "GS", sector: "Financial", marketCapB: 150 },
  { symbol: "C", sector: "Financial", marketCapB: 130 },

  // Industrials
  { symbol: "GE", sector: "Industrials", marketCapB: 200 },
  { symbol: "CAT", sector: "Industrials", marketCapB: 190 },
  { symbol: "RTX", sector: "Industrials", marketCapB: 170 },
  { symbol: "HON", sector: "Industrials", marketCapB: 140 },
  { symbol: "UNP", sector: "Industrials", marketCapB: 140 },
  { symbol: "DE", sector: "Industrials", marketCapB: 120 },
  { symbol: "BA", sector: "Industrials", marketCapB: 110 },
  { symbol: "LMT", sector: "Industrials", marketCapB: 110 },

  // Consumer Defensive
  { symbol: "WMT", sector: "Consumer Defensive", marketCapB: 600 },
  { symbol: "COST", sector: "Consumer Defensive", marketCapB: 400 },
  { symbol: "PG", sector: "Consumer Defensive", marketCapB: 380 },
  { symbol: "KO", sector: "Consumer Defensive", marketCapB: 280 },
  { symbol: "PEP", sector: "Consumer Defensive", marketCapB: 230 },
  { symbol: "PM", sector: "Consumer Defensive", marketCapB: 200 },

  // Energy
  { symbol: "XOM", sector: "Energy", marketCapB: 480 },
  { symbol: "CVX", sector: "Energy", marketCapB: 290 },
  { symbol: "COP", sector: "Energy", marketCapB: 140 },

  // Utilities
  { symbol: "NEE", sector: "Utilities", marketCapB: 150 },
  { symbol: "SO", sector: "Utilities", marketCapB: 100 },
  { symbol: "DUK", sector: "Utilities", marketCapB: 90 },

  // Real Estate
  { symbol: "PLD", sector: "Real Estate", marketCapB: 100 },
  { symbol: "AMT", sector: "Real Estate", marketCapB: 90 },
  { symbol: "EQIX", sector: "Real Estate", marketCapB: 80 },

  // Basic Materials
  { symbol: "LIN", sector: "Basic Materials", marketCapB: 220 },
  { symbol: "SHW", sector: "Basic Materials", marketCapB: 70 },
  { symbol: "ECL", sector: "Basic Materials", marketCapB: 60 },
];
