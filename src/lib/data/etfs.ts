export interface ETF {
  symbol: string;
  name: string;
  category: "Stock ETF" | "Bond ETF" | "International" | "Sector" | "Alternative";
  avgReturn: number; // long-term historical avg %
  dividendYield: number; // %
  expenseRatio: number; // %
}

export const ETFS: ETF[] = [
  { symbol: "SPY", name: "S&P 500", category: "Stock ETF", avgReturn: 10.0, dividendYield: 1.3, expenseRatio: 0.09 },
  { symbol: "VOO", name: "Vanguard S&P 500", category: "Stock ETF", avgReturn: 10.1, dividendYield: 1.4, expenseRatio: 0.03 },
  { symbol: "VTI", name: "Total US Stock Market", category: "Stock ETF", avgReturn: 9.8, dividendYield: 1.4, expenseRatio: 0.03 },
  { symbol: "QQQ", name: "Nasdaq 100", category: "Stock ETF", avgReturn: 12.5, dividendYield: 0.6, expenseRatio: 0.20 },
  { symbol: "SCHD", name: "Schwab Dividend", category: "Stock ETF", avgReturn: 9.0, dividendYield: 3.5, expenseRatio: 0.06 },
  { symbol: "VGT", name: "Vanguard Information Tech", category: "Sector", avgReturn: 13.0, dividendYield: 0.6, expenseRatio: 0.10 },
  { symbol: "VEA", name: "Developed Markets ex-US", category: "International", avgReturn: 6.5, dividendYield: 3.0, expenseRatio: 0.05 },
  { symbol: "VWO", name: "Emerging Markets", category: "International", avgReturn: 7.0, dividendYield: 2.8, expenseRatio: 0.08 },
  { symbol: "VXUS", name: "Total International Stock", category: "International", avgReturn: 6.8, dividendYield: 3.1, expenseRatio: 0.07 },
  { symbol: "VIG", name: "Dividend Appreciation", category: "Stock ETF", avgReturn: 9.5, dividendYield: 1.8, expenseRatio: 0.06 },
  { symbol: "VNQ", name: "Real Estate (REITs)", category: "Alternative", avgReturn: 8.0, dividendYield: 4.2, expenseRatio: 0.12 },
  { symbol: "VYMI", name: "International High Dividend", category: "International", avgReturn: 6.5, dividendYield: 4.8, expenseRatio: 0.22 },
  // Bonds
  { symbol: "BND", name: "Total Bond Market", category: "Bond ETF", avgReturn: 4.0, dividendYield: 4.5, expenseRatio: 0.03 },
  { symbol: "AGG", name: "Aggregate Bond", category: "Bond ETF", avgReturn: 4.0, dividendYield: 4.4, expenseRatio: 0.03 },
  { symbol: "TLT", name: "20+ Year Treasury", category: "Bond ETF", avgReturn: 3.5, dividendYield: 4.3, expenseRatio: 0.15 },
  { symbol: "LQD", name: "Investment Grade Corp Bond", category: "Bond ETF", avgReturn: 4.5, dividendYield: 5.0, expenseRatio: 0.14 },
  { symbol: "HYG", name: "High Yield Corp Bond", category: "Bond ETF", avgReturn: 5.5, dividendYield: 7.5, expenseRatio: 0.49 },
  { symbol: "MUB", name: "National Muni Bond", category: "Bond ETF", avgReturn: 3.0, dividendYield: 3.2, expenseRatio: 0.05 },
  // Alternatives
  { symbol: "GLD", name: "Gold", category: "Alternative", avgReturn: 5.5, dividendYield: 0, expenseRatio: 0.40 },
];

export interface PortfolioScenario {
  id: string;
  name: string;
  description: string;
  allocations: Record<string, number>; // symbol -> percent
}

export const PORTFOLIO_SCENARIOS: PortfolioScenario[] = [
  {
    id: "three-fund",
    name: "Three-Fund Portfolio",
    description: "Bogleheads classic: total US, total international, total bond.",
    allocations: { VTI: 60, VXUS: 30, BND: 10 },
  },
  {
    id: "all-weather",
    name: "All-Weather (Ray Dalio)",
    description: "Built to perform in any economic environment.",
    allocations: { VTI: 30, TLT: 40, BND: 15, GLD: 7.5, VNQ: 7.5 },
  },
  {
    id: "60-40",
    name: "60/40 Portfolio",
    description: "Classic balanced allocation of stocks and bonds.",
    allocations: { VTI: 60, BND: 40 },
  },
  {
    id: "growth",
    name: "Growth Portfolio",
    description: "100% stocks for maximum long-term growth potential.",
    allocations: { VTI: 50, QQQ: 30, VXUS: 20 },
  },
  {
    id: "dividend",
    name: "Dividend Portfolio",
    description: "Focused on generating consistent income via dividends.",
    allocations: { SCHD: 40, VIG: 30, VYMI: 20, VNQ: 10 },
  },
];

// Popular stocks for the custom search dropdown
export const POPULAR_STOCKS: { symbol: string; name: string; avgReturn?: number; dividendYield?: number }[] = [
  { symbol: "AAPL", name: "Apple Inc.", avgReturn: 24, dividendYield: 0.5 },
  { symbol: "MSFT", name: "Microsoft Corp.", avgReturn: 22, dividendYield: 0.8 },
  { symbol: "GOOGL", name: "Alphabet Inc.", avgReturn: 18, dividendYield: 0 },
  { symbol: "AMZN", name: "Amazon.com", avgReturn: 22, dividendYield: 0 },
  { symbol: "NVDA", name: "NVIDIA Corp.", avgReturn: 45, dividendYield: 0.04 },
  { symbol: "META", name: "Meta Platforms", avgReturn: 20, dividendYield: 0.4 },
  { symbol: "TSLA", name: "Tesla Inc.", avgReturn: 35, dividendYield: 0 },
  { symbol: "BRK.B", name: "Berkshire Hathaway", avgReturn: 12, dividendYield: 0 },
  { symbol: "JPM", name: "JPMorgan Chase", avgReturn: 11, dividendYield: 2.4 },
  { symbol: "V", name: "Visa Inc.", avgReturn: 15, dividendYield: 0.7 },
  { symbol: "JNJ", name: "Johnson & Johnson", avgReturn: 9, dividendYield: 3.0 },
  { symbol: "WMT", name: "Walmart Inc.", avgReturn: 11, dividendYield: 1.4 },
  { symbol: "PG", name: "Procter & Gamble", avgReturn: 10, dividendYield: 2.4 },
  { symbol: "MA", name: "Mastercard", avgReturn: 16, dividendYield: 0.6 },
  { symbol: "HD", name: "Home Depot", avgReturn: 13, dividendYield: 2.5 },
  { symbol: "DIS", name: "Walt Disney", avgReturn: 7, dividendYield: 0.7 },
  { symbol: "NFLX", name: "Netflix Inc.", avgReturn: 25, dividendYield: 0 },
  { symbol: "BAC", name: "Bank of America", avgReturn: 9, dividendYield: 2.6 },
  { symbol: "KO", name: "Coca-Cola", avgReturn: 8, dividendYield: 3.0 },
  { symbol: "PEP", name: "PepsiCo", avgReturn: 9, dividendYield: 3.1 },
  { symbol: "ABBV", name: "AbbVie Inc.", avgReturn: 12, dividendYield: 3.6 },
  { symbol: "AVGO", name: "Broadcom", avgReturn: 25, dividendYield: 1.4 },
  { symbol: "COST", name: "Costco Wholesale", avgReturn: 17, dividendYield: 0.5 },
  { symbol: "ADBE", name: "Adobe Inc.", avgReturn: 18, dividendYield: 0 },
  { symbol: "CRM", name: "Salesforce", avgReturn: 19, dividendYield: 0 },
  { symbol: "PFE", name: "Pfizer Inc.", avgReturn: 5, dividendYield: 5.8 },
  { symbol: "INTC", name: "Intel Corp.", avgReturn: 6, dividendYield: 1.4 },
  { symbol: "AMD", name: "Advanced Micro Devices", avgReturn: 28, dividendYield: 0 },
  { symbol: "ORCL", name: "Oracle Corp.", avgReturn: 14, dividendYield: 1.3 },
  { symbol: "T", name: "AT&T Inc.", avgReturn: 4, dividendYield: 6.5 },
  { symbol: "VZ", name: "Verizon", avgReturn: 4, dividendYield: 6.7 },
  { symbol: "CSCO", name: "Cisco Systems", avgReturn: 9, dividendYield: 3.0 },
];
