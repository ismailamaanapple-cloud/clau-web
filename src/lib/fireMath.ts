// FIRE-specific math: Coast FIRE, Barista FIRE, Trinity Study, savings-rate
// curve, sequence-of-returns stress test.

// === Coast FIRE =============================================================
// "How much do I need today such that I never have to invest another dollar
//  and still hit my FIRE number by retirement age, growing at r%?"
export function coastFireNumber(opts: {
  fireTarget: number; // inflation-adjusted FIRE number
  currentAge: number;
  retireAge: number;
  realReturnPct: number; // use REAL (after-inflation) return for inflation-adjusted target
}): number {
  const years = Math.max(0, opts.retireAge - opts.currentAge);
  const r = opts.realReturnPct / 100;
  return opts.fireTarget / Math.pow(1 + r, years);
}

// "What's the smallest amount I could be coasting on right now, at any age
//  between today and retirement?" → returns target curve year by year.
export function coastFireCurve(opts: {
  fireTarget: number;
  currentAge: number;
  retireAge: number;
  realReturnPct: number;
}): { age: number; coastTarget: number }[] {
  const r = opts.realReturnPct / 100;
  const out: { age: number; coastTarget: number }[] = [];
  for (let age = opts.currentAge; age <= opts.retireAge; age++) {
    const yearsLeft = opts.retireAge - age;
    out.push({ age, coastTarget: opts.fireTarget / Math.pow(1 + r, yearsLeft) });
  }
  return out;
}

// === Barista FIRE ==========================================================
// Like Coast FIRE but assumes some part-time income covers part of expenses,
// so the required nest egg is smaller.
export function baristaFireNumber(opts: {
  annualExpenses: number; // desired retirement spend
  partTimeIncome: number; // covered by light work
  withdrawalRatePct: number; // typically 4
}): number {
  const gap = Math.max(0, opts.annualExpenses - opts.partTimeIncome);
  return gap / (opts.withdrawalRatePct / 100);
}

// === Savings Rate → Years to FIRE ==========================================
// Classic Mr. Money Mustache formula. Assumes returns just keep up with
// inflation-adjusted withdrawals (Trinity Study 4% rule).
//
//   years = ln((1 + r/SR · (SR - 1))/0)/ln(1+r)   — closed form
// We expose both a single-point and a full curve.
export function yearsToFire(savingsRatePct: number, realReturnPct = 5, withdrawalRatePct = 4): number {
  const sr = savingsRatePct / 100;
  if (sr <= 0) return Infinity;
  if (sr >= 1) return 0;
  const r = realReturnPct / 100;
  const wr = withdrawalRatePct / 100;
  // Required multiple of expenses = 1/wr ; assets must grow from 0 to that with sr·income
  // Solve compound-growth annuity: target = sr · (((1+r)^n - 1)/r)
  const target = (1 - sr) / wr; // expressed as multiple of income
  const n = Math.log((target * r) / sr + 1) / Math.log(1 + r);
  return n;
}

export function savingsRateCurve(opts: { realReturnPct?: number; withdrawalRatePct?: number } = {}): {
  savingsRate: number;
  years: number;
}[] {
  const out: { savingsRate: number; years: number }[] = [];
  for (let sr = 5; sr <= 95; sr += 5) {
    const y = yearsToFire(sr, opts.realReturnPct ?? 5, opts.withdrawalRatePct ?? 4);
    out.push({ savingsRate: sr, years: isFinite(y) ? y : 0 });
  }
  return out;
}

// === Sequence-of-Returns Stress Test ========================================
// Run a fixed-return retirement, then inject a crash at a chosen year and
// compare ending balances. Returns time series for both scenarios.
export interface SequenceScenario {
  label: string;
  series: { year: number; balance: number }[];
  endBalance: number;
  ranOutAtYear: number | null;
}

export function sequenceStressTest(opts: {
  startBalance: number;
  yearsInRetirement: number;
  annualWithdrawal: number;
  inflationPct: number;
  baseReturnPct: number; // "normal" return
  crashYear: number; // year (1-indexed) the crash hits
  crashMagnitudePct: number; // e.g. -40 for a 2008
  recoveryYears: number; // how many years to recover after crash
}): { baseline: SequenceScenario; withCrash: SequenceScenario } {
  const i = opts.inflationPct / 100;
  const r = opts.baseReturnPct / 100;

  const baseline: SequenceScenario = {
    label: "Steady Returns",
    series: [{ year: 0, balance: opts.startBalance }],
    endBalance: 0,
    ranOutAtYear: null,
  };
  const withCrash: SequenceScenario = {
    label: `${opts.crashMagnitudePct}% Crash at Year ${opts.crashYear}`,
    series: [{ year: 0, balance: opts.startBalance }],
    endBalance: 0,
    ranOutAtYear: null,
  };

  // baseline
  let b = opts.startBalance;
  for (let y = 1; y <= opts.yearsInRetirement; y++) {
    const w = opts.annualWithdrawal * Math.pow(1 + i, y - 1);
    b = Math.max(0, (b - w) * (1 + r));
    baseline.series.push({ year: y, balance: b });
    if (b <= 0 && baseline.ranOutAtYear === null) baseline.ranOutAtYear = y;
  }
  baseline.endBalance = b;

  // crashed
  let c = opts.startBalance;
  for (let y = 1; y <= opts.yearsInRetirement; y++) {
    const w = opts.annualWithdrawal * Math.pow(1 + i, y - 1);
    let yReturn = r;
    if (y === opts.crashYear) yReturn = opts.crashMagnitudePct / 100;
    else if (y > opts.crashYear && y <= opts.crashYear + opts.recoveryYears) {
      // recover linearly
      yReturn = r + Math.abs(opts.crashMagnitudePct / 100) / opts.recoveryYears * 0.6;
    }
    c = Math.max(0, (c - w) * (1 + yReturn));
    withCrash.series.push({ year: y, balance: c });
    if (c <= 0 && withCrash.ranOutAtYear === null) withCrash.ranOutAtYear = y;
  }
  withCrash.endBalance = c;
  return { baseline, withCrash };
}

// Quick inflation utility
export function realValueOf(nominal: number, years: number, inflationPct: number): number {
  return nominal / Math.pow(1 + inflationPct / 100, years);
}
export function futureValueOf(today: number, years: number, inflationPct: number): number {
  return today * Math.pow(1 + inflationPct / 100, years);
}

// Salary raise → FIRE date impact
export function impactOfRaise(opts: {
  currentInvested: number;
  currentMonthlyContribution: number;
  raiseAnnual: number;
  raiseToInvestmentsPct: number; // % of raise (after tax) that goes to investing
  marginalTaxRate: number; // decimal
  fireTarget: number;
  annualReturnPct: number;
}): { yearsBefore: number; yearsAfter: number; yearsSaved: number; extraMonthlyContribution: number } {
  const afterTaxRaise = opts.raiseAnnual * (1 - opts.marginalTaxRate);
  const extraMonthly = (afterTaxRaise * (opts.raiseToInvestmentsPct / 100)) / 12;
  const r = opts.annualReturnPct / 100 / 12;

  function yearsToTarget(initial: number, monthly: number, target: number): number {
    if (monthly <= 0 && initial >= target) return 0;
    if (monthly <= 0) return Infinity;
    // FV: target = initial(1+r)^n + monthly · (((1+r)^n - 1)/r)
    // Solve for n (months) numerically — bisection
    let lo = 0, hi = 100 * 12;
    while (hi - lo > 1) {
      const mid = (lo + hi) / 2;
      const fv = initial * Math.pow(1 + r, mid) + monthly * ((Math.pow(1 + r, mid) - 1) / (r || 1e-9));
      if (fv < target) lo = mid; else hi = mid;
    }
    return hi / 12;
  }

  const yBefore = yearsToTarget(opts.currentInvested, opts.currentMonthlyContribution, opts.fireTarget);
  const yAfter = yearsToTarget(opts.currentInvested, opts.currentMonthlyContribution + extraMonthly, opts.fireTarget);
  return {
    yearsBefore: yBefore,
    yearsAfter: yAfter,
    yearsSaved: yBefore - yAfter,
    extraMonthlyContribution: extraMonthly,
  };
}

// Bond / T-Bill ladder
export interface LadderRung {
  rung: number;
  faceValue: number;
  termYears: number;
  apyPct: number;
  annualIncome: number;
  maturityYear: number;
}

export function buildTBillLadder(opts: {
  totalCash: number;
  rungs: number; // 2-10
  shortestTerm: number; // months, e.g. 3
  longestTerm: number; // months, e.g. 60
  apyByTerm: (months: number) => number; // function returning apy %
}): { ladder: LadderRung[]; totalAnnualIncome: number; effectiveAPY: number } {
  const per = opts.totalCash / opts.rungs;
  const ladder: LadderRung[] = [];
  let totalIncome = 0;
  for (let i = 0; i < opts.rungs; i++) {
    const months = opts.shortestTerm + ((opts.longestTerm - opts.shortestTerm) * i) / Math.max(1, opts.rungs - 1);
    const apy = opts.apyByTerm(months);
    const inc = per * (apy / 100);
    const termYears = months / 12;
    ladder.push({
      rung: i + 1,
      faceValue: per,
      termYears,
      apyPct: apy,
      annualIncome: inc,
      maturityYear: termYears,
    });
    totalIncome += inc;
  }
  return {
    ladder,
    totalAnnualIncome: totalIncome,
    effectiveAPY: opts.totalCash > 0 ? (totalIncome / opts.totalCash) * 100 : 0,
  };
}
