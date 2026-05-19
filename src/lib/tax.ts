// US federal tax brackets, account-priority logic, and retirement-withdrawal
// math. All numbers reflect 2024 figures, simplified for educational use.

export interface Bracket {
  min: number;
  max: number; // Infinity for top bracket
  rate: number; // decimal, e.g. 0.22 for 22%
}

export type FilingStatus = "single" | "mfj";

export const FEDERAL_BRACKETS_SINGLE: Bracket[] = [
  { min: 0, max: 11_600, rate: 0.10 },
  { min: 11_600, max: 47_150, rate: 0.12 },
  { min: 47_150, max: 100_525, rate: 0.22 },
  { min: 100_525, max: 191_950, rate: 0.24 },
  { min: 191_950, max: 243_725, rate: 0.32 },
  { min: 243_725, max: 609_350, rate: 0.35 },
  { min: 609_350, max: Infinity, rate: 0.37 },
];

export const FEDERAL_BRACKETS_MFJ: Bracket[] = [
  { min: 0, max: 23_200, rate: 0.10 },
  { min: 23_200, max: 94_300, rate: 0.12 },
  { min: 94_300, max: 201_050, rate: 0.22 },
  { min: 201_050, max: 383_900, rate: 0.24 },
  { min: 383_900, max: 487_450, rate: 0.32 },
  { min: 487_450, max: 731_200, rate: 0.35 },
  { min: 731_200, max: Infinity, rate: 0.37 },
];

export const LTCG_BRACKETS_SINGLE: Bracket[] = [
  { min: 0, max: 47_025, rate: 0.0 },
  { min: 47_025, max: 518_900, rate: 0.15 },
  { min: 518_900, max: Infinity, rate: 0.20 },
];

export const LTCG_BRACKETS_MFJ: Bracket[] = [
  { min: 0, max: 94_050, rate: 0.0 },
  { min: 94_050, max: 583_750, rate: 0.15 },
  { min: 583_750, max: Infinity, rate: 0.20 },
];

export const STANDARD_DEDUCTION = {
  single: 14_600,
  mfj: 29_200,
} as const;

// Contribution limits (2024)
export const LIMITS = {
  k401: 23_000,
  k401_catchup: 7_500, // age 50+
  ira: 7_000,
  ira_catchup: 1_000,
  hsa_self: 4_150,
  hsa_family: 8_300,
  hsa_catchup: 1_000, // age 55+
} as const;

// IRA Roth direct-contribution income phaseouts (2024 — approximate)
export const ROTH_IRA_PHASEOUT = {
  single: { start: 146_000, end: 161_000 },
  mfj: { start: 230_000, end: 240_000 },
};

export function taxFromBrackets(taxableIncome: number, brackets: Bracket[]): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const slice = Math.min(taxableIncome, b.max) - b.min;
    tax += slice * b.rate;
  }
  return tax;
}

export function marginalRate(taxableIncome: number, brackets: Bracket[]): number {
  if (taxableIncome <= 0) return 0;
  for (const b of brackets) {
    if (taxableIncome > b.min && taxableIncome <= b.max) return b.rate;
  }
  return brackets[brackets.length - 1].rate;
}

export function effectiveRate(taxableIncome: number, brackets: Bracket[]): number {
  if (taxableIncome <= 0) return 0;
  return taxFromBrackets(taxableIncome, brackets) / taxableIncome;
}

// FICA: Social Security 6.2% up to wage base + Medicare 1.45%
const SS_WAGE_BASE_2024 = 168_600;
export function ficaTax(wages: number): { socialSecurity: number; medicare: number; total: number } {
  const ss = Math.min(wages, SS_WAGE_BASE_2024) * 0.062;
  const med = wages * 0.0145;
  return { socialSecurity: ss, medicare: med, total: ss + med };
}

// Account waterfall — order of which dollar goes where
export interface WaterfallInput {
  grossSalary: number;
  monthlyToInvest: number; // total $ available monthly to invest beyond required spending
  employerMatchPct: number; // e.g. 100 means dollar-for-dollar
  employerMatchUpToPct: number; // % of salary capped at, e.g. 6%
  hasHSA: boolean;
  hsaCoverage: "self" | "family";
  age: number;
  filingStatus: FilingStatus;
  taxableIncome: number; // for IRA Roth eligibility check
}

export interface WaterfallStep {
  order: number;
  name: string;
  annualAmount: number;
  monthlyAmount: number;
  why: string;
  tag: "free-money" | "tax-free" | "pre-tax" | "post-tax" | "tax-free-growth";
}

export function buildAccountWaterfall(input: WaterfallInput): {
  steps: WaterfallStep[];
  totalAllocated: number;
  unallocated: number;
  employerMatch: number;
} {
  const steps: WaterfallStep[] = [];
  let remaining = input.monthlyToInvest * 12;
  let order = 1;

  // Step 1: 401k to match
  const matchSalaryAmt = (input.grossSalary * input.employerMatchUpToPct) / 100;
  const employerMatch = matchSalaryAmt * (input.employerMatchPct / 100);
  if (matchSalaryAmt > 0 && remaining > 0) {
    const annual = Math.min(remaining, matchSalaryAmt);
    steps.push({
      order: order++,
      name: `401(k) to employer match`,
      annualAmount: annual,
      monthlyAmount: annual / 12,
      why: `Capture full employer match — instant 100% return on every dollar up to ${input.employerMatchUpToPct}% of salary.`,
      tag: "free-money",
    });
    remaining -= annual;
  }

  // Step 2: HSA (triple tax-advantaged)
  if (input.hasHSA && remaining > 0) {
    const hsaCap = input.hsaCoverage === "family" ? LIMITS.hsa_family : LIMITS.hsa_self;
    const cap = hsaCap + (input.age >= 55 ? LIMITS.hsa_catchup : 0);
    const annual = Math.min(remaining, cap);
    steps.push({
      order: order++,
      name: `HSA (Health Savings Account)`,
      annualAmount: annual,
      monthlyAmount: annual / 12,
      why: `Triple tax-advantaged: pre-tax in, tax-free growth, tax-free withdrawals for medical. Best account in the tax code.`,
      tag: "tax-free",
    });
    remaining -= annual;
  }

  // Step 3: Roth IRA (if income allows)
  const rothLimit =
    input.filingStatus === "single" ? ROTH_IRA_PHASEOUT.single : ROTH_IRA_PHASEOUT.mfj;
  const iraCap = LIMITS.ira + (input.age >= 50 ? LIMITS.ira_catchup : 0);
  if (remaining > 0 && input.taxableIncome < rothLimit.end) {
    const phaseFactor =
      input.taxableIncome <= rothLimit.start
        ? 1
        : Math.max(0, 1 - (input.taxableIncome - rothLimit.start) / (rothLimit.end - rothLimit.start));
    const eligibleCap = iraCap * phaseFactor;
    const annual = Math.min(remaining, eligibleCap);
    if (annual > 0) {
      steps.push({
        order: order++,
        name: `Roth IRA`,
        annualAmount: annual,
        monthlyAmount: annual / 12,
        why: `Pay tax now, never again. Withdrawals (contributions any time, growth at 59½) are 100% tax-free.`,
        tag: "tax-free-growth",
      });
      remaining -= annual;
    }
  }

  // Step 4: Max 401k (remaining beyond match)
  if (remaining > 0) {
    const k401Cap = LIMITS.k401 + (input.age >= 50 ? LIMITS.k401_catchup : 0);
    const alreadyIn401k = steps.find((s) => s.name.includes("401(k)"))?.annualAmount ?? 0;
    const room = Math.max(0, k401Cap - alreadyIn401k);
    const annual = Math.min(remaining, room);
    if (annual > 0) {
      steps.push({
        order: order++,
        name: `Max out 401(k)`,
        annualAmount: annual,
        monthlyAmount: annual / 12,
        why: `Pre-tax contributions lower your taxable income today. Tax deferred until withdrawal in retirement.`,
        tag: "pre-tax",
      });
      remaining -= annual;
    }
  }

  // Step 5: Backdoor Roth (if income above direct contribution limit)
  if (remaining > 0 && input.taxableIncome >= rothLimit.end) {
    const alreadyInIra = steps.find((s) => s.name === "Roth IRA")?.annualAmount ?? 0;
    const room = Math.max(0, iraCap - alreadyInIra);
    const annual = Math.min(remaining, room);
    if (annual > 0) {
      steps.push({
        order: order++,
        name: `Backdoor Roth IRA`,
        annualAmount: annual,
        monthlyAmount: annual / 12,
        why: `Income too high for direct Roth. Contribute to a traditional IRA, immediately convert to Roth — legal workaround.`,
        tag: "tax-free-growth",
      });
      remaining -= annual;
    }
  }

  // Step 6: Taxable brokerage (everything else)
  if (remaining > 0) {
    steps.push({
      order: order++,
      name: `Taxable Brokerage`,
      annualAmount: remaining,
      monthlyAmount: remaining / 12,
      why: `Flexible, fully liquid, no contribution limit. Use long-term capital gains rates by holding 1+ year.`,
      tag: "post-tax",
    });
    remaining = 0;
  }

  const totalAllocated = steps.reduce((s, x) => s + x.annualAmount, 0);
  return { steps, totalAllocated, unallocated: remaining, employerMatch };
}

// Roth conversion ladder — convert $X/yr from traditional to Roth, wait 5 years per conversion
export interface ConversionYear {
  year: number;
  age: number;
  conversionAmount: number;
  remainingTraditional: number;
  rothPrincipalAvailable: number; // sum of conversions ≥5 yrs old
  taxOwed: number;
  marginalRateAtConversion: number;
}

export function simulateRothConversionLadder(opts: {
  startAge: number;
  retireAge: number; // age when income drops & conversions begin
  endAge: number;
  traditionalBalance: number;
  annualConversion: number;
  growthPct: number; // assumed nominal return on both accounts
  otherIncomeInRetirement: number; // taxable income besides the conversion (e.g. small business, pension)
  filingStatus: FilingStatus;
}): ConversionYear[] {
  const brackets = opts.filingStatus === "mfj" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  const deduction = opts.filingStatus === "mfj" ? STANDARD_DEDUCTION.mfj : STANDARD_DEDUCTION.single;
  const r = opts.growthPct / 100;
  const conversions: { age: number; amount: number }[] = [];
  let trad = opts.traditionalBalance;
  const rows: ConversionYear[] = [];

  for (let age = opts.retireAge; age <= opts.endAge; age++) {
    // grow first
    trad *= 1 + r;
    const converting = Math.min(opts.annualConversion, trad);
    const taxableIncome = Math.max(0, opts.otherIncomeInRetirement + converting - deduction);
    const tax = taxFromBrackets(taxableIncome, brackets);
    const margRate = marginalRate(taxableIncome, brackets);
    trad -= converting;
    conversions.push({ age, amount: converting });

    const rothPrincipal = conversions
      .filter((c) => age - c.age >= 5)
      .reduce((s, c) => s + c.amount, 0);

    rows.push({
      year: age - opts.retireAge + 1,
      age,
      conversionAmount: converting,
      remainingTraditional: trad,
      rothPrincipalAvailable: rothPrincipal,
      taxOwed: tax,
      marginalRateAtConversion: margRate,
    });
    if (trad <= 0 && converting <= 0) break;
  }
  return rows;
}

// Withdrawal-strategy simulator: 3 buckets (taxable, traditional, Roth)
export interface WithdrawalYear {
  year: number;
  age: number;
  spending: number;
  fromTaxable: number;
  fromTraditional: number;
  fromRoth: number;
  taxOwed: number;
  totalWithdrawn: number;
  endingTaxable: number;
  endingTraditional: number;
  endingRoth: number;
  totalRemaining: number;
}

export function simulateWithdrawalStrategy(opts: {
  startAge: number;
  yearsInRetirement: number;
  taxable: number;
  traditional: number;
  roth: number;
  annualSpending: number; // desired post-tax spending
  growthPct: number;
  inflationPct: number;
  filingStatus: FilingStatus;
  order: ("taxable" | "traditional" | "roth")[]; // priority
}): WithdrawalYear[] {
  const brackets = opts.filingStatus === "mfj" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  const ltcg = opts.filingStatus === "mfj" ? LTCG_BRACKETS_MFJ : LTCG_BRACKETS_SINGLE;
  const deduction = opts.filingStatus === "mfj" ? STANDARD_DEDUCTION.mfj : STANDARD_DEDUCTION.single;
  let taxable = opts.taxable;
  let trad = opts.traditional;
  let roth = opts.roth;
  const r = opts.growthPct / 100;
  const i = opts.inflationPct / 100;
  const rows: WithdrawalYear[] = [];

  for (let y = 1; y <= opts.yearsInRetirement; y++) {
    const age = opts.startAge + y - 1;
    const spending = opts.annualSpending * Math.pow(1 + i, y - 1);

    // grow accounts first
    taxable *= 1 + r;
    trad *= 1 + r;
    roth *= 1 + r;

    let need = spending; // post-tax target
    const withdrawn = { taxable: 0, traditional: 0, roth: 0 };

    for (const bucket of opts.order) {
      if (need <= 0) break;
      if (bucket === "taxable") {
        // Treat half the withdrawal as gains taxed at LTCG, half basis
        const gross = Math.min(taxable, need / (1 - 0.5 * (marginalRate(need, ltcg) || 0.05)));
        const tax = (gross * 0.5) * marginalRate(gross * 0.5, ltcg);
        taxable -= gross;
        withdrawn.taxable += gross;
        need -= gross - tax;
      } else if (bucket === "traditional") {
        // gross-up: spending = gross - tax(gross)
        let gross = need;
        for (let it = 0; it < 6; it++) {
          const taxableInc = Math.max(0, gross - deduction);
          const tax = taxFromBrackets(taxableInc, brackets);
          const net = gross - tax;
          gross = gross + (need - net);
        }
        gross = Math.min(gross, trad);
        const taxableInc = Math.max(0, gross - deduction);
        const tax = taxFromBrackets(taxableInc, brackets);
        trad -= gross;
        withdrawn.traditional += gross;
        need -= gross - tax;
      } else if (bucket === "roth") {
        const gross = Math.min(roth, need);
        roth -= gross;
        withdrawn.roth += gross;
        need -= gross;
      }
    }

    const totalWithdrawn = withdrawn.taxable + withdrawn.traditional + withdrawn.roth;
    const taxOwed = totalWithdrawn - (spending - need);

    rows.push({
      year: y,
      age,
      spending,
      fromTaxable: withdrawn.taxable,
      fromTraditional: withdrawn.traditional,
      fromRoth: withdrawn.roth,
      taxOwed: Math.max(0, taxOwed),
      totalWithdrawn,
      endingTaxable: taxable,
      endingTraditional: trad,
      endingRoth: roth,
      totalRemaining: taxable + trad + roth,
    });
  }
  return rows;
}

// ACA premium estimate (very rough — uses second-lowest silver benchmark heuristic)
export function acaSubsidyEstimate(opts: {
  household: number; // people in household
  magi: number; // modified AGI
  state?: "high-cost" | "average" | "low-cost";
}): { benchmarkAnnual: number; expectedContribution: number; subsidyAnnual: number; netPremiumMonthly: number } {
  const fpl2024 = 15_060 + (opts.household - 1) * 5_380; // approximate FPL
  const fplPct = (opts.magi / fpl2024) * 100;

  // 2024 ARPA-extended applicable contribution %
  let applicablePct = 0;
  if (fplPct < 150) applicablePct = 0;
  else if (fplPct < 200) applicablePct = 0 + ((fplPct - 150) / 50) * 0.02;
  else if (fplPct < 250) applicablePct = 0.02 + ((fplPct - 200) / 50) * 0.02;
  else if (fplPct < 300) applicablePct = 0.04 + ((fplPct - 250) / 50) * 0.02;
  else if (fplPct < 400) applicablePct = 0.06 + ((fplPct - 300) / 100) * 0.025;
  else applicablePct = 0.085;

  const benchmarkAnnualBase = 7_200 + (opts.household - 1) * 5_500;
  const stateMult = opts.state === "high-cost" ? 1.3 : opts.state === "low-cost" ? 0.85 : 1.0;
  const benchmarkAnnual = benchmarkAnnualBase * stateMult;
  const expectedContribution = opts.magi * applicablePct;
  const subsidyAnnual = Math.max(0, benchmarkAnnual - expectedContribution);
  const netPremium = Math.max(0, benchmarkAnnual - subsidyAnnual);
  return {
    benchmarkAnnual,
    expectedContribution,
    subsidyAnnual,
    netPremiumMonthly: netPremium / 12,
  };
}
