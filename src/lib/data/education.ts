export interface EducationTopic {
  id: string;
  title: string;
  category:
    | "ETFs"
    | "Bonds"
    | "FIRE"
    | "Strategy"
    | "Accounts"
    | "Portfolios"
    | "Risk"
    | "Advanced";
  summary: string;
  readMinutes: number;
  body: string;
  keyTakeaways: string[];
  doThis?: string[];
  watchOutFor?: string[];
  examples?: { label: string; value: string }[];
  relatedIds?: string[];
}

export const CATEGORY_COLORS: Record<EducationTopic["category"], string> = {
  ETFs: "#00C805",
  Bonds: "#FFB800",
  FIRE: "#FF8A00",
  Strategy: "#A56EFF",
  Accounts: "#06B6D4",
  Portfolios: "#4A9EFF",
  Risk: "#FF3B30",
  Advanced: "#EC4899",
};

export const EDUCATION_TOPICS: EducationTopic[] = [
  {
    id: "what-is-an-etf",
    title: "What is an ETF?",
    category: "ETFs",
    readMinutes: 3,
    summary: "Exchange-traded funds let you buy hundreds of stocks in one share.",
    body: `An ETF (Exchange-Traded Fund) is a basket of securities that trades on an exchange like a single stock. Instead of buying 500 individual S&P 500 stocks, you can buy one share of SPY and own a slice of all of them.

ETFs are popular because they offer instant diversification, low expense ratios (often under 0.10%), tax efficiency, and intraday tradability. They've quietly become the default vehicle for long-term investors — over $10 trillion is now held in ETFs globally.

There are a few main types worth knowing: broad index ETFs that track the whole market (SPY, VTI, VOO), sector ETFs targeting specific industries (XLK for tech, XLE for energy), bond ETFs (BND, AGG), and international ETFs (VXUS, VEA, VWO).`,
    keyTakeaways: [
      "One ETF share gives you exposure to dozens or thousands of underlying holdings.",
      "ETFs trade intraday on stock exchanges, unlike mutual funds that price once daily.",
      "Expense ratios on broad index ETFs are typically 0.03–0.10% — practically free.",
    ],
    doThis: [
      "Start with a single broad-market ETF (VTI or VOO) before getting fancy.",
      "Check the expense ratio and average daily volume before buying.",
    ],
    watchOutFor: [
      "Leveraged or inverse ETFs (3x, -2x) — designed for traders, not investors.",
      "Thinly-traded niche ETFs — wide bid-ask spreads silently cost you money.",
    ],
    examples: [
      { label: "VTI expense ratio", value: "0.03%" },
      { label: "SPY assets under management", value: "~$500B" },
      { label: "Holdings in VTI", value: "~3,800 stocks" },
    ],
    relatedIds: ["etf-vs-mutual-fund", "expense-ratios", "three-fund-portfolio"],
  },
  {
    id: "etf-vs-mutual-fund",
    title: "ETFs vs. Mutual Funds",
    category: "ETFs",
    readMinutes: 3,
    summary: "Both are diversified baskets — but ETFs are usually cheaper and more flexible.",
    body: `ETFs trade throughout the day on exchanges at market-determined prices. Mutual funds price exactly once daily after the market close, and you transact at that single price regardless of when you placed the order.

ETFs typically have lower expense ratios, no minimum investment beyond one share's price, and are more tax-efficient due to their creation/redemption mechanism that lets fund managers swap baskets of stocks instead of selling them — avoiding capital gains distributions to other holders.

Mutual funds can have higher minimums ($1,000-$3,000), may charge sales loads (commissions of 1-5%), and pass capital gains tax bills to all holders even if you didn't sell. For most long-term investors holding broad index funds, the ETF version is the simpler, cheaper choice.`,
    keyTakeaways: [
      "ETFs price continuously; mutual funds price once at 4 PM ET.",
      "ETFs are more tax-efficient thanks to in-kind creation/redemption.",
      "Mutual funds may make sense in a 401(k) where the institutional share class is cheaper.",
    ],
    examples: [
      { label: "VTI vs VTSAX", value: "0.03% vs 0.04%" },
      { label: "Typical mutual fund minimum", value: "$1,000–3,000" },
      { label: "ETF minimum", value: "One share" },
    ],
    relatedIds: ["what-is-an-etf", "expense-ratios", "tax-advantaged-accounts"],
  },
  {
    id: "what-are-bonds",
    title: "Understanding Bonds",
    category: "Bonds",
    readMinutes: 4,
    summary: "Bonds are loans to a government or company that pay you interest.",
    body: `When you buy a bond, you're lending money to the issuer (a government, municipality, or corporation) for a fixed period. In return, they pay you interest (called the coupon) and return your principal at maturity.

Bonds are typically less volatile than stocks and provide steady income, making them a stabilizer in a portfolio — especially as you approach retirement. They also tend to perform differently from stocks during crises, providing diversification.

Risks include interest rate risk (bond prices fall when rates rise — and vice versa), credit risk (the issuer defaults), and inflation risk (your fixed coupon loses purchasing power over time).

Common categories worth knowing: US Treasuries (the safest, backed by the federal government), municipal bonds (interest is often state/federal tax-free), investment-grade corporate bonds (higher yield than Treasuries, modest credit risk), and high-yield "junk" bonds (much higher yield, much higher default risk).`,
    keyTakeaways: [
      "Bonds pay fixed interest and return principal at maturity.",
      "When interest rates rise, existing bond prices fall — and vice versa.",
      "A typical 60/40 portfolio uses bonds to soften stock-market drawdowns.",
    ],
    doThis: [
      "Use BND or AGG for broad bond market exposure — both cost 0.03%.",
      "Hold bonds in tax-advantaged accounts (401k/IRA) — their interest is taxed as ordinary income.",
    ],
    watchOutFor: [
      "High-yield bonds in a recession — they can drop 30%+ like stocks.",
      "Long-duration bonds (TLT) in a rising-rate environment — TLT lost ~40% in 2022.",
    ],
    examples: [
      { label: "10-yr Treasury (typical)", value: "~4%" },
      { label: "Investment-grade corporate", value: "~5%" },
      { label: "High-yield 'junk' bond", value: "~8%" },
    ],
    relatedIds: ["60-40-portfolio", "all-weather-portfolio", "inflation-protection"],
  },
  {
    id: "fire-movement",
    title: "The FIRE Movement",
    category: "FIRE",
    readMinutes: 4,
    summary: "Financial Independence, Retire Early — save aggressively, invest, retire decades early.",
    body: `FIRE (Financial Independence, Retire Early) is a movement focused on achieving the freedom to stop working long before traditional retirement age. The core formula is simple but powerful: save 25× your annual expenses, invest in low-cost index funds, and live off ~4% withdrawals annually.

The math: if you spend $40,000/year, you need $1,000,000 to be financially independent. At a 50% savings rate, you can get there in roughly 17 years from a $0 start — at any income level.

There are several flavors of FIRE depending on your target lifestyle:

• Lean FIRE: frugal living, ~$25K/year, target ~$625K
• Regular FIRE: middle-class lifestyle, ~$40-60K/year, target $1-1.5M
• Fat FIRE: comfortable to luxury, $100K+/year, target $2.5M+
• Coast FIRE: save aggressively early so compound growth alone reaches retirement target — you can "coast" with a low-stress job
• Barista FIRE: semi-retire with part-time work for health insurance and pocket money`,
    keyTakeaways: [
      "Your FIRE number = annual expenses × 25 (based on 4% rule).",
      "Savings rate matters far more than income — 50% saved → ~17 years to FI.",
      "Tracking expenses ruthlessly is the single biggest lever most people ignore.",
    ],
    doThis: [
      "Calculate your savings rate today: (income − spending) ÷ income.",
      "Set a Coast FIRE checkpoint — the lower target where you can downshift careers.",
    ],
    watchOutFor: [
      "Lifestyle inflation — every raise that goes to spending pushes FIRE further out.",
      "Healthcare costs in early retirement before Medicare at 65.",
    ],
    examples: [
      { label: "Lean FIRE target", value: "~$625K" },
      { label: "Fat FIRE target", value: "$2.5M+" },
      { label: "Savings rate → years to FI", value: "10% → 51, 50% → 17, 70% → 9" },
    ],
    relatedIds: ["four-percent-rule", "compound-interest", "tax-advantaged-accounts"],
  },
  {
    id: "four-percent-rule",
    title: "The 4% Safe Withdrawal Rule",
    category: "FIRE",
    readMinutes: 4,
    summary: "Withdraw 4% of your portfolio yearly with very high odds of never running out.",
    body: `Based on the Trinity Study (1998), withdrawing 4% of your starting portfolio annually — adjusted up for inflation each year — historically had a ~95% success rate over 30-year retirements with a 60/40 stock/bond portfolio.

To use it: multiply your annual expenses by 25 to find your FIRE number. $40,000/year × 25 = $1,000,000. That's the simplest, fastest mental math in personal finance.

The rule isn't bulletproof. Early retirees with 50+ year horizons often use 3.25-3.5% for extra safety. Sequence-of-returns risk — bad years happening early — matters more than average returns. And the rule was based on US data; international markets have done worse.

Modern variants include the Guyton-Klinger guardrails (cut spending in bad years, expand in good years), Bengen's recent 4.7% update with broader asset classes, and dynamic withdrawal strategies that ratchet based on portfolio performance.`,
    keyTakeaways: [
      "FIRE number = annual spending × 25.",
      "The original 4% rule assumed 30 years; longer retirements may need 3.25-3.5%.",
      "Flexibility (cutting spending 10-20% in bad years) dramatically improves success rates.",
    ],
    doThis: [
      "Run a Monte Carlo simulation against YOUR portfolio mix and expenses (use the Simulate tab).",
      "Plan for sequence-of-returns risk: hold 1-2 years of cash near retirement.",
    ],
    watchOutFor: [
      "Treating the 4% rule as a guarantee — it's a 95% historical confidence level, not certainty.",
      "Forgetting inflation — withdrawals scale up each year with CPI.",
    ],
    examples: [
      { label: "$2M portfolio × 4%", value: "$80,000/yr" },
      { label: "$50K spend × 25", value: "$1.25M FIRE #" },
      { label: "Safer 3.5% rate", value: "Annual × 28.6" },
    ],
    relatedIds: ["fire-movement", "sequence-of-returns", "asset-allocation"],
  },
  {
    id: "compound-interest",
    title: "Compound Interest",
    category: "Strategy",
    readMinutes: 3,
    summary: "Earnings on your earnings — the engine of long-term wealth.",
    body: `Compound interest is earning returns not just on your principal but also on the accumulated returns from prior periods. It's the closest thing to a free lunch in finance.

$10,000 invested at 10% for 30 years grows to $174,494. But here's the magic: $164,494 of that is pure growth, not your money. The longer the runway, the more dramatic.

Time is the most powerful variable — far more than the rate of return or even the contribution amount. Starting at 25 vs. 35 with the same monthly contribution often doubles your retirement balance. Every year you delay starting costs roughly 2× the year before in terms of final balance.

The Rule of 72 is a useful shortcut: divide 72 by your annual return rate to estimate years to double your money. 10% return → 7.2 years to double. 7% → ~10 years.`,
    keyTakeaways: [
      "Compounding is exponential — small returns multiplied over decades = massive wealth.",
      "Time is the single most powerful variable in the formula.",
      "Rule of 72: years to double = 72 ÷ annual return %.",
    ],
    doThis: [
      "Start now, even with small amounts. $100/mo at 25 beats $300/mo starting at 40.",
      "Reinvest dividends — compounding only works if returns stay invested.",
    ],
    watchOutFor: [
      "Compounding works against you on debt too — credit card balances at 22% double in 3 years.",
    ],
    examples: [
      { label: "$500/mo @ 8% for 40 years", value: "~$1.55M" },
      { label: "$500/mo @ 8% for 30 years", value: "~$680K" },
      { label: "$500/mo @ 8% for 20 years", value: "~$275K" },
    ],
    relatedIds: ["dollar-cost-averaging", "expense-ratios", "fire-movement"],
  },
  {
    id: "dollar-cost-averaging",
    title: "Dollar-Cost Averaging (DCA)",
    category: "Strategy",
    readMinutes: 3,
    summary: "Invest a fixed amount on a fixed schedule, regardless of price.",
    body: `DCA means investing a consistent dollar amount at regular intervals — say, $500 every two weeks into VTI — regardless of what the market is doing. You automatically buy more shares when prices are low and fewer when high, lowering your average cost basis over time.

The main benefits are psychological and behavioral, not mathematical. Research consistently shows lump-sum investing usually beats DCA — markets trend up roughly 70% of years, so getting your money in sooner wins on average. But for ongoing savings from a paycheck, DCA is the only realistic option — you can't invest money you haven't earned yet.

The real superpower of DCA is removing emotion. You don't agonize over timing. You don't try to predict crashes. You just keep buying. That alone beats the average investor's actual returns by 1-2% per year.`,
    keyTakeaways: [
      "DCA = invest fixed amounts on a fixed schedule.",
      "Mathematically, lump-sum beats DCA ~70% of the time — but only if you can stomach the volatility.",
      "Most powerful as a behavioral tool: it removes timing decisions entirely.",
    ],
    doThis: [
      "Set up automated investments from your paycheck — make it invisible.",
      "Choose a schedule (weekly, biweekly, monthly) and never override it.",
    ],
    watchOutFor: [
      "DCA into a sinking single stock — diversify before automating.",
      "Letting cash 'wait for a dip' — markets often run away from sidelined money.",
    ],
    examples: [
      { label: "$1,000/mo over 30 years", value: "$360K invested" },
      { label: "Same at 8% return", value: "~$1.5M" },
    ],
    relatedIds: ["behavioral-finance", "market-timing-myth", "compound-interest"],
  },
  {
    id: "expense-ratios",
    title: "Why Expense Ratios Matter",
    category: "Strategy",
    readMinutes: 3,
    summary: "A 1% fee can cost you hundreds of thousands over decades.",
    body: `The expense ratio is the annual fee a fund charges, expressed as a percent of assets. It's deducted continuously from the fund's NAV, so you never see a bill — which is why so many people ignore it.

A 1% expense ratio on a $500K portfolio is $5,000/year — every year, forever, whether the fund made or lost money. Compounded over decades, fees become the single biggest controllable drag on returns.

Over 30 years at 7% returns, $100K invested in a 0.03% fund grows to ~$748K. The same $100K in a 1% fund grows to ~$574K. That's $174K — over 23% of your final balance — handed to the fund company for no extra service.

Low-cost index ETFs are the workhorses of efficient investing: VTI (0.03%), VOO (0.03%), SCHD (0.06%), BND (0.03%). Anything above 0.50% should have a very compelling reason — and "good past performance" isn't one.`,
    keyTakeaways: [
      "Fees compound against you the same way returns compound for you.",
      "A 1% expense ratio is the difference between $574K and $748K over 30 years on $100K.",
      "Index funds win because they're cheap, not because they're 'smart'.",
    ],
    doThis: [
      "Audit every fund you own — check the expense ratio.",
      "Replace anything above 0.50% with a low-cost index equivalent if available.",
    ],
    examples: [
      { label: "VTI / VOO / BND", value: "0.03%" },
      { label: "Typical active mutual fund", value: "0.50–1.00%" },
      { label: "Some hedge funds (HF)", value: "2% + 20% of gains" },
    ],
    relatedIds: ["what-is-an-etf", "etf-vs-mutual-fund", "compound-interest"],
  },
  {
    id: "asset-allocation",
    title: "Asset Allocation Basics",
    category: "Strategy",
    readMinutes: 4,
    summary: "Stocks for growth, bonds for stability — the mix determines your risk.",
    body: `Asset allocation is dividing your portfolio across asset classes: stocks, bonds, real estate, cash, and sometimes commodities. It's the single most important driver of long-term returns and risk — research consistently shows it explains 90%+ of portfolio variance, far more than which specific funds or stocks you pick.

Common starting points by risk tolerance:

• Aggressive (90/10 stocks/bonds): max growth, max volatility — for long horizons (20+ years).
• Moderate (60/40): the classic balanced portfolio — middle ground for most people 10-20 years from retirement.
• Conservative (40/60): capital preservation > growth — for people within 5-10 years of retirement.

A common rule of thumb: "110 minus your age" = % in stocks. A 30-year-old → 80% stocks. A 60-year-old → 50% stocks. Adjust based on your actual risk tolerance — how would you feel if your portfolio dropped 40% in 6 months?

Rebalance annually to stay on target. Without rebalancing, winners outgrow your portfolio and silently increase your risk.`,
    keyTakeaways: [
      "Asset allocation explains 90%+ of portfolio variance — fund selection barely matters in comparison.",
      "Rule of thumb: 110 minus age in stocks (adjust for risk tolerance).",
      "Rebalance annually to keep risk where you intended it.",
    ],
    doThis: [
      "Decide your target allocation in writing, before markets move.",
      "Set a calendar reminder to rebalance every December.",
    ],
    watchOutFor: [
      "Letting a single position grow to >20% of your portfolio — concentration risk.",
      "Holding bonds in a taxable account — interest is taxed as ordinary income.",
    ],
    examples: [
      { label: "Aggressive 90/10", value: "90% VTI + 10% BND" },
      { label: "Balanced 60/40", value: "60% VTI + 40% BND" },
      { label: "Conservative 40/60", value: "40% VTI + 60% BND" },
    ],
    relatedIds: ["rebalancing", "three-fund-portfolio", "60-40-portfolio"],
  },
  {
    id: "rebalancing",
    title: "Rebalancing Your Portfolio",
    category: "Strategy",
    readMinutes: 3,
    summary: "Periodically restore your target allocations to lock in gains and control risk.",
    body: `Over time, winners outpace losers and skew your allocation. If your target 60/40 stocks/bonds portfolio drifts to 75/25 because stocks ran up, your risk has silently grown 25% — without any decision on your part.

Rebalancing means selling some of the overweight assets and buying the underweights to restore your target. It feels counterintuitive ("sell my winners?") but it's literally buying low and selling high systematically.

Three common methods:

• Calendar rebalancing: every December or every January. Simple, easy to schedule.
• Threshold rebalancing: act only when an asset class drifts >5% from target. More efficient, requires monitoring.
• Cash-flow rebalancing: direct all new contributions to underweight assets. Most tax-efficient — no selling required, ever.

In tax-advantaged accounts (401k, IRA), rebalance freely — no tax consequences. In taxable accounts, prefer cash-flow rebalancing to avoid capital gains taxes.`,
    keyTakeaways: [
      "Without rebalancing, winners silently increase your portfolio's risk.",
      "Rebalancing is automatic 'buy low, sell high' — uncomfortable but profitable.",
      "Cash-flow rebalancing avoids all tax friction in taxable accounts.",
    ],
    doThis: [
      "Set a once-a-year rebalancing date — December is popular.",
      "In a taxable account, direct new contributions to whatever is underweight.",
    ],
    examples: [
      { label: "Target drift threshold", value: "±5% triggers rebalance" },
      { label: "Typical frequency", value: "Once per year" },
    ],
    relatedIds: ["asset-allocation", "tax-advantaged-accounts", "behavioral-finance"],
  },
  {
    id: "roth-vs-traditional",
    title: "Roth vs. Traditional Accounts",
    category: "Accounts",
    readMinutes: 4,
    summary: "Pay taxes now (Roth) or later (Traditional) — choose by expected future tax rate.",
    body: `Traditional 401(k) and IRA accounts: contributions are tax-deductible now, growth is tax-deferred, and withdrawals in retirement are taxed as ordinary income.

Roth 401(k) and IRA accounts: you pay taxes now on contributions, but growth and qualified withdrawals are 100% tax-free in retirement.

Rule of thumb: if you expect a LOWER tax rate in retirement, Traditional wins (you're deferring high-bracket tax to a low-bracket future). If you expect EQUAL or HIGHER rates, Roth wins (you lock in today's lower rate).

Most people benefit from a mix. Bonus features of Roth: no Required Minimum Distributions (RMDs) at 73, so the money can compound tax-free for life or pass to heirs. Roth IRA contributions (not earnings) can be withdrawn anytime, penalty-free — a stealth emergency fund.

2024 contribution limits: $23,000 to 401(k), $7,000 to IRA (+$1,000 catch-up at 50+). Income limits apply to Roth IRA, but the "backdoor Roth" workaround is fully legal.`,
    keyTakeaways: [
      "Traditional = tax break now, taxed later. Roth = pay now, tax-free later.",
      "Roth wins if you expect higher tax rates in retirement (most young, high-earning savers).",
      "Roth IRA contributions are withdrawable anytime, penalty-free.",
    ],
    doThis: [
      "Max your employer 401(k) match first — that's free money before this decision matters.",
      "If you're under 30 and high income, lean Roth.",
    ],
    watchOutFor: [
      "Roth IRA income limits — $161K single / $240K MFJ in 2024. Use backdoor Roth above those.",
    ],
    examples: [
      { label: "2024 401(k) limit", value: "$23,000" },
      { label: "2024 IRA limit", value: "$7,000" },
      { label: "Roth IRA income cap (single)", value: "$161,000" },
    ],
    relatedIds: ["tax-advantaged-accounts", "compound-interest"],
  },
  {
    id: "tax-advantaged-accounts",
    title: "Tax-Advantaged Account Hierarchy",
    category: "Accounts",
    readMinutes: 4,
    summary: "Maximize free money and tax shelters before investing in a brokerage.",
    body: `The standard FIRE optimization order, from highest-priority to lowest:

1. **401(k) up to employer match** — Free money. A 50% match is an instant 50% return. Always max this first.
2. **HSA (if eligible)** — Triple tax advantage: deductible on the way in, grows tax-free, tax-free for medical expenses. After 65, withdraws for any reason are taxed like a Traditional IRA. The single best account type that exists.
3. **Roth IRA / Backdoor Roth** — $7,000/year of tax-free growth forever. Withdrawals of contributions are penalty-free at any time, making it a stealth emergency fund.
4. **Max remaining 401(k)** — Up to $23,000 total (2024).
5. **Mega Backdoor Roth** — If your 401(k) plan allows after-tax contributions and in-plan Roth conversions, you can stuff up to ~$46,000 more into Roth annually.
6. **Taxable brokerage** — After all tax-advantaged space is filled. Use ETFs (not mutual funds) for tax efficiency; harvest tax losses.

Why this order? Tax-advantaged growth compounds dramatically over decades. A dollar in a Roth grows tax-free; the same dollar in a taxable account loses ~25% of returns to drag from dividends and rebalancing taxes.`,
    keyTakeaways: [
      "Always capture the 401(k) match — it's a guaranteed return on day one.",
      "HSA > Roth IRA > Traditional 401(k) > Taxable for tax efficiency.",
      "Backdoor Roth and Mega Backdoor Roth are legal workarounds for high earners.",
    ],
    doThis: [
      "Check your employer's 401(k) match percentage TODAY if you don't know it.",
      "Open and fund a Roth IRA at Fidelity/Schwab/Vanguard — it takes 10 minutes.",
    ],
    watchOutFor: [
      "Leaving employer match on the table — surveys say ~25% of workers do.",
      "Investing in a brokerage while skipping tax-advantaged accounts — pure tax friction.",
    ],
    examples: [
      { label: "401(k) match value", value: "Up to ~3% of salary, free" },
      { label: "Mega Backdoor Roth", value: "~$46K/yr extra into Roth" },
    ],
    relatedIds: ["roth-vs-traditional", "fire-movement", "expense-ratios"],
  },
  {
    id: "three-fund-portfolio",
    title: "The Three-Fund Portfolio",
    category: "Portfolios",
    readMinutes: 3,
    summary: "A simple, diversified portfolio with total US, total international, and total bond market.",
    body: `Popularized by the Bogleheads community, the three-fund portfolio is the gold standard of "set and forget" investing. The typical allocation is straightforward:

• VTI (60%) — Vanguard Total Stock Market — ~3,800 US stocks
• VXUS (30%) — Vanguard Total International — ~8,500 non-US stocks
• BND (10%) — Vanguard Total Bond Market — investment-grade US bonds

That's it. Three funds. Three decisions. Globally diversified across roughly 12,000 securities. Combined expense ratio: about 0.04%.

It beats the vast majority of actively managed portfolios over 20+ year horizons — not because it's clever, but because it's cheap, broad, and disciplined. Hedge funds with armies of analysts can't reliably beat this.

Annual maintenance: rebalance once if drifts get large. Total time required: 15 minutes per year.`,
    keyTakeaways: [
      "Three funds covering ~12,000 securities globally.",
      "Combined expense ratio of ~0.04% beats most actively managed alternatives.",
      "Maintenance: rebalance once a year — that's it.",
    ],
    doThis: [
      "Pick a single brokerage (Vanguard, Fidelity, Schwab) and auto-invest into VTI/VXUS/BND.",
      "Set a December calendar reminder to check allocation drift.",
    ],
    examples: [
      { label: "Stocks/bonds split", value: "90/10" },
      { label: "US/international split", value: "67/33" },
      { label: "Combined ER", value: "~0.04%" },
    ],
    relatedIds: ["asset-allocation", "all-weather-portfolio", "expense-ratios"],
  },
  {
    id: "all-weather-portfolio",
    title: "All-Weather Portfolio",
    category: "Portfolios",
    readMinutes: 4,
    summary: "Ray Dalio's strategy: balanced to perform in any economic environment.",
    body: `Designed by Bridgewater's Ray Dalio, the All-Weather portfolio aims for consistent returns across all four economic environments: rising growth, falling growth, rising inflation, and falling inflation. It diversifies across economic risks, not just asset classes.

Typical allocation:

• 30% Stocks (VTI)
• 40% Long-term Treasuries (TLT)
• 15% Intermediate Treasuries (IEF or BND)
• 7.5% Gold (GLD)
• 7.5% Commodities (DBC)

The portfolio trades higher expected returns for lower drawdowns. It typically gives up some upside in bull markets but holds up remarkably well in 2008-style crashes. Historical max drawdown around -15% vs. -50% for S&P 500.

Best for: investors who prioritize sleep over maximum gains. Worst for: young investors with multi-decade horizons who can ride out volatility.`,
    keyTakeaways: [
      "Diversifies across economic environments, not just asset classes.",
      "Lower volatility, lower expected return than 100% stocks.",
      "The heavy long-bond allocation suffered badly in 2022's rate spike.",
    ],
    examples: [
      { label: "Expected return", value: "~6-7%" },
      { label: "Max drawdown (typical)", value: "~15%" },
      { label: "Worst recent year", value: "2022 (~-21%)" },
    ],
    relatedIds: ["asset-allocation", "60-40-portfolio", "inflation-protection"],
  },
  {
    id: "60-40-portfolio",
    title: "The 60/40 Portfolio",
    category: "Portfolios",
    readMinutes: 3,
    summary: "60% stocks, 40% bonds — the classic balanced portfolio.",
    body: `The 60/40 has been the benchmark of moderate-risk investing for decades. Stocks provide growth; bonds provide stability and income. Historically delivered ~8% annual returns with much lower volatility than 100% stocks.

The 2022 bear market shook confidence — stocks AND bonds dropped together, which is unusual. But over multi-decade horizons, the strategy remains robust. The temporary correlation breakdown doesn't invalidate the underlying diversification logic.

Best suited for: investors within 10 years of retirement, anyone with lower risk tolerance, or those who can't stomach the 30-50% drawdowns of 100% equity portfolios.

Implementation is dead simple: 60% VTI + 40% BND. Done. Or use a target-date fund that automatically glides toward more conservative allocations as you approach retirement.`,
    keyTakeaways: [
      "60% stocks + 40% bonds — the classic balanced portfolio.",
      "Historical return ~8% with much lower volatility than all-stock.",
      "2022 broke the negative correlation temporarily; long-term diversification still holds.",
    ],
    examples: [
      { label: "Historical avg return", value: "~8%" },
      { label: "Max drawdown (2008)", value: "~-30%" },
      { label: "Simple implementation", value: "60% VTI + 40% BND" },
    ],
    relatedIds: ["asset-allocation", "three-fund-portfolio", "what-are-bonds"],
  },
  {
    id: "growth-portfolio",
    title: "Growth (100% Stocks) Portfolio",
    category: "Portfolios",
    readMinutes: 3,
    summary: "Maximum long-term growth — high volatility, high reward.",
    body: `A 100% equity portfolio is optimal if you have a long time horizon (20+ years) and the temperament to hold through 30-50% drawdowns without panic-selling.

A common allocation: 50% VTI (total US market) + 30% QQQ (tech-tilted) + 20% VXUS (international). Or simpler: 80% VTI + 20% VXUS.

Historical returns: ~10% annually for the US stock market over long periods. But you'll experience:

• ~10% drawdown roughly once a year
• ~20% bear market every 4-5 years
• ~30%+ crash every decade or so

These are features, not bugs — they're the price of admission for the long-term return premium. The investors who earn this premium are the ones who don't sell during crashes.

Best for: young investors in accumulation phase with 20+ years until retirement, and proven psychological tolerance for volatility.`,
    keyTakeaways: [
      "Historical ~10% annual return, but with brutal short-term volatility.",
      "30-50% drawdowns happen — they're survivable if you don't sell.",
      "Only appropriate if your horizon is 20+ years and your nerves are steady.",
    ],
    doThis: [
      "Test your tolerance: imagine your portfolio dropping 40% next year. Could you hold? Add more?",
      "If retiring within 10 years, glide toward bonds gradually.",
    ],
    watchOutFor: [
      "Sequence-of-returns risk if retiring soon with 100% stocks.",
    ],
    examples: [
      { label: "S&P 500 long-term avg", value: "~10%" },
      { label: "Largest drawdown (2008-09)", value: "~-57%" },
    ],
    relatedIds: ["market-volatility", "sequence-of-returns", "behavioral-finance"],
  },
  {
    id: "dividend-portfolio",
    title: "Dividend Growth Portfolio",
    category: "Portfolios",
    readMinutes: 3,
    summary: "Income-focused portfolio designed to pay you rather than just appreciate.",
    body: `A dividend-focused portfolio prioritizes companies that pay and grow their dividends — generating cash income without selling shares. Typical allocation: 40% SCHD + 30% VIG + 20% VYMI + 10% VNQ.

Combined yield is typically 2.5-4.5%. On a $1M portfolio, that's $25-45K of cash income annually without touching principal.

Tradeoffs: less aggressive growth than total-market or growth-tilted portfolios. Dividend stocks tend to be more value-oriented and less tech-heavy, which means lagging in growth-led bull markets (like 2020-21) and outperforming in value-led markets (like 2022).

Popular with retirees who want predictable cash flow without depleting principal, and with savers who like seeing tangible income from their investments. Just remember: in a taxable account, dividends are taxed annually whether you spend them or not — making dividend strategies tax-inefficient pre-retirement.`,
    keyTakeaways: [
      "Combined yield typically 2.5-4.5% — real income without selling shares.",
      "Trades growth for predictability — lags in growth-led markets.",
      "Dividend-heavy strategies are tax-inefficient in a taxable account.",
    ],
    doThis: [
      "Hold dividend strategies in Roth IRA or 401(k) for tax efficiency.",
    ],
    examples: [
      { label: "SCHD yield", value: "~3.5%" },
      { label: "VYMI yield", value: "~4.5%" },
      { label: "$1M portfolio income", value: "~$30K/yr" },
    ],
    relatedIds: ["dividends-vs-growth", "tax-advantaged-accounts", "asset-allocation"],
  },
  {
    id: "dividends-vs-growth",
    title: "Dividends vs. Growth",
    category: "Strategy",
    readMinutes: 3,
    summary: "Both can build wealth — the difference is when you pay taxes.",
    body: `A common misconception: "dividend stocks return more than growth stocks." Total return = price appreciation + dividends. A $100 stock that grows to $108 returns 8%. A $100 stock that grows to $105 plus a $3 dividend also returns 8%.

The real difference is taxes and behavior. Dividends are taxed annually in a taxable account whether you reinvest them or spend them. Growth in unrealized capital gains isn't taxed until you sell. So in a taxable account, growth is more tax-efficient.

Behavioral wins for dividends: tangible quarterly income reinforces the investing habit. Many retirees find it psychologically easier to live off dividends than to "sell some shares each month."

Behavioral wins for growth: compounds at higher rates because you're not paying tax drag. Better for the accumulation phase.`,
    keyTakeaways: [
      "Total return = appreciation + dividends. The split doesn't change the total.",
      "Dividends create tax friction in taxable accounts.",
      "Growth is tax-efficient because gains compound untaxed until sale.",
    ],
    doThis: [
      "In accumulation phase: tilt growth in taxable, dividends in Roth IRA.",
    ],
    relatedIds: ["dividend-portfolio", "expense-ratios", "tax-advantaged-accounts"],
  },
  {
    id: "market-volatility",
    title: "Market Volatility & Risk",
    category: "Risk",
    readMinutes: 3,
    summary: "Stocks drop 10% on average yearly, 20% every few years — this is normal.",
    body: `Historical reality of the S&P 500:

• ~10% drawdown roughly once a year — normal market noise.
• ~20% bear market every 4-5 years on average.
• ~30%+ crash every decade or so.
• ~50%+ generational crash every 30-50 years (1929, 2000, 2008).

These aren't failures of the market — they're the price of admission for long-term returns. The equity risk premium (~6% over bonds) exists exactly BECAUSE stocks are volatile. Remove the volatility and you remove the return.

Strategies to survive (and benefit from) volatility:

• Emergency fund (3-6 months) so you never have to sell at the bottom.
• Asset allocation that matches your risk tolerance — not your aspiration.
• Automatic contributions through downturns — DCA in crashes is a wealth-creating event.
• Stop checking your portfolio daily — cortisol is your worst portfolio manager.`,
    keyTakeaways: [
      "10% drops every year, 20% bears every 5 years — volatility is normal.",
      "The equity risk premium exists because of volatility, not despite it.",
      "Surviving volatility is more about behavior than strategy.",
    ],
    doThis: [
      "Build a 3-6 month cash emergency fund before going aggressive.",
      "Set portfolio-checking to monthly at most.",
    ],
    examples: [
      { label: "S&P 500 worst year (2008)", value: "-37%" },
      { label: "Best year (1933)", value: "+54%" },
      { label: "Average year", value: "~10%" },
    ],
    relatedIds: ["sequence-of-returns", "emergency-fund", "behavioral-finance"],
  },
  {
    id: "sequence-of-returns",
    title: "Sequence of Returns Risk",
    category: "Risk",
    readMinutes: 4,
    summary: "When you experience bad returns matters as much as average returns.",
    body: `Two retirees with identical 30-year average returns can have wildly different outcomes if one experiences a crash early in retirement vs. late. Withdrawing from a portfolio that just dropped 40% locks in losses you can never recover.

Example: $1M portfolio, 4% withdrawal. If the first 3 years return -10%, -15%, -10% before recovering, you've withdrawn $120K from an already-shrinking portfolio. You may run out of money by year 20 even if the long-term average is fine.

The same -10/-15/-10 sequence at YEARS 27-29 would barely matter — the portfolio has already compounded for decades.

Mitigation strategies:

• Cash bucket: hold 1-3 years of expenses in cash/short bonds during early retirement so you never sell stocks at a low.
• Guardrails: cut spending 10-20% during bad market years.
• Bond tent: temporarily increase bond allocation to ~50% around the retirement date, then glide back to higher equity exposure.
• Work one more year: dramatically improves success rates.`,
    keyTakeaways: [
      "Bad early returns can ruin a 30-year retirement even if the long-term average is fine.",
      "Sequence risk is highest in the 5 years on each side of your retirement date.",
      "Cash buckets and spending flexibility are the cheapest insurance.",
    ],
    doThis: [
      "Build a 2-3 year cash bucket as you approach retirement.",
      "Pre-commit to spending cuts in bad market years.",
    ],
    examples: [
      { label: "Worst case 4% rule failures", value: "1929, 1937, 1966 retirees" },
      { label: "Recovery: cash bucket size", value: "2-3 years of expenses" },
    ],
    relatedIds: ["four-percent-rule", "emergency-fund", "market-volatility"],
  },
  {
    id: "emergency-fund",
    title: "Emergency Fund Strategy",
    category: "Risk",
    readMinutes: 3,
    summary: "3-6 months of expenses in cash — your portfolio's seatbelt.",
    body: `Before investing aggressively, build a cash emergency fund. The standard guidance is 3-6 months of expenses, but the right amount depends on your situation:

• 3 months: young, dual-income, stable salaried career.
• 6 months: single-income household, mid-career.
• 9-12 months: contract/freelance income, business owner, high fixed expenses.

Where to keep it: high-yield savings account (HYSA) currently yielding ~4-5% APY. NOT in stocks. NOT invested. The whole point is liquidity and stability.

Why it matters: you never want to be forced to sell investments during a recession when prices are low AND your job is at risk. The 2008 investors who sold stocks to cover lost income permanently locked in losses; those with emergency funds held through and recovered.

It's not about returns — it's about resilience. The "opportunity cost" of cash in an emergency fund is the cheapest insurance you'll ever buy.`,
    keyTakeaways: [
      "3-6 months expenses, in cash, in a high-yield savings account.",
      "The point is resilience, not returns.",
      "Without it, you may be forced to sell investments at the worst possible time.",
    ],
    doThis: [
      "Open a high-yield savings account (Ally, Marcus, SoFi, Wealthfront).",
      "Calculate 3 months of your CORE expenses (rent, food, insurance, minimums).",
    ],
    examples: [
      { label: "Typical HYSA APY", value: "4-5%" },
      { label: "$50K/yr spending", value: "$12.5K-25K emergency fund" },
    ],
    relatedIds: ["sequence-of-returns", "market-volatility", "tax-advantaged-accounts"],
  },
  {
    id: "behavioral-finance",
    title: "Behavioral Finance & Investor Psychology",
    category: "Advanced",
    readMinutes: 4,
    summary: "Your worst enemy is usually you — biases destroy more wealth than fees.",
    body: `The biggest predictor of long-term investing success isn't intelligence or stock-picking — it's behavior. The DALBAR studies consistently find the average mutual fund investor underperforms the funds they own by 1-2% per year due to bad timing decisions (buying at peaks, selling at bottoms).

Common destructive biases:

• Loss aversion: losses hurt ~2x more than equivalent gains feel good → leads to panic-selling crashes.
• Recency bias: assuming whatever just happened will continue → chasing yesterday's winners.
• Overconfidence: thinking your stock picks are special → concentrating in 'hot' picks.
• Confirmation bias: only reading bullish takes on your holdings → blind to risks.
• Anchoring: fixating on the price you paid → refusing to sell losers.
• FOMO: chasing rallies after they've already happened → buying tops.

Solutions: automate everything you can, write an investment policy statement before markets move, and don't check your portfolio more than monthly. Most importantly: separate the "investing" decision from the "trading" impulse. They are different activities.`,
    keyTakeaways: [
      "Average investor underperforms their own funds by 1-2%/year.",
      "Loss aversion is the single most expensive bias.",
      "Automation removes most timing decisions — and most mistakes.",
    ],
    doThis: [
      "Write an investment policy statement: target allocation, rebalance rules, no-sell rules.",
      "Automate contributions and rebalancing — don't decide each time.",
    ],
    examples: [
      { label: "Average investor gap (DALBAR)", value: "1-2%/yr lower than fund return" },
      { label: "Loss aversion ratio", value: "~2x" },
    ],
    relatedIds: ["dollar-cost-averaging", "market-timing-myth", "rebalancing"],
  },
  {
    id: "market-timing-myth",
    title: "Time in the Market > Timing the Market",
    category: "Advanced",
    readMinutes: 3,
    summary: "Missing the best 10 days over 30 years cuts your returns by more than half.",
    body: `A famous JP Morgan study (1990-2020): an investor in the S&P 500 who stayed fully invested earned ~10% annually. Missing just the 10 best days dropped that to ~6%. Missing the 20 best days dropped it to ~3%. Missing the 30 best days: ~1%.

The trap: the best days are almost always clustered near the worst days. 7 of the 10 best days over the past 20 years occurred within 2 weeks of the 10 worst days. So if you sell after a crash to "wait for things to calm down," you almost certainly miss the rebound.

Even professional fund managers, with full-time staffs and information advantages, fail to time the market reliably. SPIVA studies show ~85% of large-cap active funds underperform the S&P 500 over 15-year periods.

The lesson isn't that timing is hard — it's that timing is essentially impossible at scale. Stop trying. Keep buying. Keep holding.`,
    keyTakeaways: [
      "Missing the 10 best days of 30 years cuts returns in half.",
      "Best days cluster near worst days — selling crashes locks in losses AND missed rebounds.",
      "85%+ of pro fund managers fail at timing the market over 15-year horizons.",
    ],
    doThis: [
      "If tempted to sell after a crash, FORCE yourself to wait 30 days first.",
    ],
    examples: [
      { label: "Fully invested 1990-2020", value: "~10% annualized" },
      { label: "Missing 10 best days", value: "~6%" },
      { label: "Missing 30 best days", value: "~1%" },
    ],
    relatedIds: ["behavioral-finance", "dollar-cost-averaging", "market-volatility"],
  },
  {
    id: "international-diversification",
    title: "Geographic Diversification",
    category: "Advanced",
    readMinutes: 3,
    summary: "US-only investing has worked recently — but global diversification reduces single-country risk.",
    body: `The US makes up roughly 60% of global market capitalization. Allocating 20-30% to international funds (VXUS, VEA, VWO) hedges against decades-long underperformance of any single country.

The cautionary tale: Japan's stock market peaked in 1989 and didn't recover those levels until 2024 — a 35-year flat period. An investor 100% in Japanese stocks would have spent their entire career losing to inflation.

US returns have outpaced international since 2010, leading many investors to abandon international allocations. But valuations matter: international stocks now trade at much cheaper valuations than US stocks, and historical leadership rotates roughly every decade.

A globally diversified investor sleeps better through any single market's lost decade. The diversification benefit isn't about higher returns — it's about removing concentration risk you didn't realize you had.`,
    keyTakeaways: [
      "US is ~60% of global market cap — being 100% US is a concentrated bet.",
      "Japan's market took 35 years to recover from 1989 highs — country risk is real.",
      "20-30% international allocation balances diversification with familiarity.",
    ],
    examples: [
      { label: "VXUS expense ratio", value: "0.07%" },
      { label: "US share of global market", value: "~60%" },
      { label: "Japan recovery from 1989", value: "35 years" },
    ],
    relatedIds: ["asset-allocation", "three-fund-portfolio", "behavioral-finance"],
  },
  {
    id: "inflation-protection",
    title: "Protecting Against Inflation",
    category: "Advanced",
    readMinutes: 4,
    summary: "Stocks, TIPS, and real assets beat cash over the long run.",
    body: `Inflation quietly erodes purchasing power. 3% annual inflation cuts a dollar's buying power in half over ~24 years. 5% inflation halves it in 14 years.

What does NOT protect: cash in checking, traditional bonds (their fixed payments lose value), CDs at low rates.

What DOES protect:

• Stocks: companies can raise prices, so revenues and profits track inflation over time. The best long-run hedge.
• TIPS (Treasury Inflation-Protected Securities): principal adjusts with CPI. Direct hedge but lower expected return.
• Real estate / REITs: rents rise with inflation; property values typically do too.
• I-Bonds: government bonds whose rate floats with inflation. Limit $10K/yr per person but a great low-risk hedge.
• Commodities and gold: less reliable, but offer diversification.

For most people, the biggest inflation protection is simply owning a broadly diversified stock portfolio. Cash and long-duration bonds are the worst hedges and should be sized to actual short-term needs, not "safety" hoarding.`,
    keyTakeaways: [
      "Cash and long bonds are the worst inflation hedges.",
      "Stocks are the best long-run hedge because companies can raise prices.",
      "TIPS and I-Bonds offer direct CPI-linked protection.",
    ],
    doThis: [
      "Buy $10K of I-Bonds per person per year as a small inflation hedge.",
      "Avoid holding more cash than your emergency fund + 1-2 year goals.",
    ],
    examples: [
      { label: "I-Bond annual limit", value: "$10K/person" },
      { label: "Years to halve $ at 3% inflation", value: "~24" },
      { label: "Years to halve $ at 7%", value: "~10" },
    ],
    relatedIds: ["what-are-bonds", "asset-allocation", "emergency-fund"],
  },
];
