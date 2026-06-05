export interface ProjectionPoint {
  year: number;
  total: number;
  contributions: number;
  growth: number;
}

export function projectGrowth(
  initial: number,
  monthlyContribution: number,
  years: number,
  annualReturnPct: number
): ProjectionPoint[] {
  const r = annualReturnPct / 100 / 12;
  const months = years * 12;
  const points: ProjectionPoint[] = [];
  let balance = initial;
  let contributed = initial;
  points.push({ year: 0, total: balance, contributions: contributed, growth: 0 });
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthlyContribution;
    contributed += monthlyContribution;
    if (m % 12 === 0) {
      points.push({
        year: m / 12,
        total: balance,
        contributions: contributed,
        growth: balance - contributed,
      });
    }
  }
  return points;
}

// 4%-rule drawdown: accumulate (with monthly contributions) until a chosen age,
// then withdraw a fixed % of the balance-at-retirement, grown by inflation each
// year. Because returns usually outpace the withdrawal, the balance keeps
// compounding while paying you income — this captures that trajectory by age.
export interface DrawdownYear {
  age: number;
  balance: number; // end-of-year balance
  withdrawal: number; // amount pulled this year (0 while accumulating)
  contribution: number; // amount added this year (0 while withdrawing)
  cumulativeWithdrawn: number;
  phase: "accumulate" | "withdraw";
}

export function projectDrawdown(opts: {
  startBalance: number;
  currentAge: number;
  monthlyContribution: number;
  withdrawalStartAge: number;
  endAge: number;
  annualReturnPct: number;
  withdrawalRatePct: number; // e.g. 4 for the 4% rule
  inflationPct: number; // raises the withdrawal each year
}): DrawdownYear[] {
  const r = opts.annualReturnPct / 100;
  const monthlyR = r / 12;
  const infl = opts.inflationPct / 100;
  const startAge = Math.max(opts.currentAge, opts.withdrawalStartAge);
  let balance = opts.startBalance;
  let baseWithdrawal = 0;
  let cumulative = 0;

  const rows: DrawdownYear[] = [
    {
      age: opts.currentAge,
      balance,
      withdrawal: 0,
      contribution: 0,
      cumulativeWithdrawn: 0,
      phase: opts.currentAge >= startAge ? "withdraw" : "accumulate",
    },
  ];

  for (let age = opts.currentAge + 1; age <= opts.endAge; age++) {
    if (age < startAge) {
      // Accumulation: contribute monthly and compound.
      for (let m = 0; m < 12; m++) balance = balance * (1 + monthlyR) + opts.monthlyContribution;
      rows.push({
        age,
        balance,
        withdrawal: 0,
        contribution: opts.monthlyContribution * 12,
        cumulativeWithdrawn: cumulative,
        phase: "accumulate",
      });
    } else {
      // Withdrawal: lock the first-year amount to the balance at retirement,
      // then bump it by inflation. Pull at the start of the year, grow the rest.
      if (baseWithdrawal === 0) {
        baseWithdrawal = balance * (opts.withdrawalRatePct / 100);
      } else {
        baseWithdrawal *= 1 + infl;
      }
      const w = Math.min(balance, baseWithdrawal);
      balance = Math.max(0, (balance - w) * (1 + r));
      cumulative += w;
      rows.push({
        age,
        balance,
        withdrawal: w,
        contribution: 0,
        cumulativeWithdrawn: cumulative,
        phase: "withdraw",
      });
    }
  }
  return rows;
}

export interface MonteCarloResult {
  paths: number[][]; // [path][year] - kept for diagnostic, limited to a few sample paths
  finalValues: number[];
  successCount: number;
  totalRuns: number;
  successRate: number;
  percentiles: { p10: number; p50: number; p90: number };
  // Per-year percentile bands across ALL runs (length = totalYears + 1)
  bands: { year: number; p10: number; p25: number; p50: number; p75: number; p90: number }[];
}

// Returns nominal at retirement; then withdraws annually at withdrawalRate of starting balance
// adjusted by inflation 3% per year. Success = balance > 0 at end of horizon.
export function runMonteCarlo(opts: {
  initial: number;
  annualContribution: number;
  yearsToRetire: number;
  yearsInRetirement: number;
  expectedReturnPct: number;
  volatilityPct: number;
  withdrawalRatePct: number;
  runs?: number;
}): MonteCarloResult {
  const {
    initial,
    annualContribution,
    yearsToRetire,
    yearsInRetirement,
    expectedReturnPct,
    volatilityPct,
    withdrawalRatePct,
    runs = 500,
  } = opts;

  const mean = expectedReturnPct / 100;
  const std = volatilityPct / 100;
  const totalYears = yearsToRetire + yearsInRetirement;

  const paths: number[][] = []; // sample paths for visual texture
  const valuesByYear: number[][] = Array.from({ length: totalYears + 1 }, () => []);
  const finalValues: number[] = [];
  let successCount = 0;

  for (let run = 0; run < runs; run++) {
    let balance = initial;
    const path: number[] = [balance];
    valuesByYear[0].push(balance);
    let annualWithdrawal = 0;

    for (let y = 1; y <= totalYears; y++) {
      const u1 = Math.random() || 1e-9;
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const yearReturn = mean + std * z;

      if (y <= yearsToRetire) {
        balance = balance * (1 + yearReturn) + annualContribution;
      } else {
        if (y === yearsToRetire + 1) {
          annualWithdrawal = balance * (withdrawalRatePct / 100);
        } else {
          annualWithdrawal *= 1.03; // 3% inflation
        }
        balance = (balance - annualWithdrawal) * (1 + yearReturn);
      }
      const clamped = Math.max(0, balance);
      path.push(clamped);
      valuesByYear[y].push(clamped);
    }

    if (balance > 0) successCount++;
    finalValues.push(balance);
    if (paths.length < 8) paths.push(path); // a handful of sample paths
  }

  finalValues.sort((a, b) => a - b);
  const p = (sorted: number[], q: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];

  const bands = valuesByYear.map((values, year) => {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      year,
      p10: p(sorted, 0.1),
      p25: p(sorted, 0.25),
      p50: p(sorted, 0.5),
      p75: p(sorted, 0.75),
      p90: p(sorted, 0.9),
    };
  });

  return {
    paths,
    finalValues,
    successCount,
    totalRuns: runs,
    successRate: (successCount / runs) * 100,
    percentiles: { p10: p(finalValues, 0.1), p50: p(finalValues, 0.5), p90: p(finalValues, 0.9) },
    bands,
  };
}

// IRR calculation using Newton-Raphson
export function calculateIRR(cashflows: number[], guess = 0.1): number {
  let rate = guess;
  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const f = Math.pow(1 + rate, t);
      npv += cashflows[t] / f;
      dnpv += (-t * cashflows[t]) / (f * (1 + rate));
    }
    const newRate = rate - npv / (dnpv || 1e-9);
    if (Math.abs(newRate - rate) < 1e-7) return newRate;
    rate = newRate;
  }
  return rate;
}

// Student loan amortization given monthly payment + interest rate
export function simulateLoan(opts: {
  balance: number;
  annualRate: number; // percent
  minPayment: number;
  extraPayment: number;
  lumpSum?: number;
  lumpSumYear?: number; // 1-indexed year
  months: number; // simulation horizon
}): { balanceByMonth: number[]; totalInterest: number; payoffMonth: number | null } {
  const r = opts.annualRate / 100 / 12;
  let balance = opts.balance;
  let totalInterest = 0;
  const balanceByMonth: number[] = [balance];
  let payoffMonth: number | null = null;
  for (let m = 1; m <= opts.months; m++) {
    if (balance <= 0) {
      balanceByMonth.push(0);
      continue;
    }
    const interest = balance * r;
    totalInterest += interest;
    balance += interest;
    let pay = opts.minPayment + opts.extraPayment;
    if (opts.lumpSum && opts.lumpSumYear && Math.ceil(m / 12) === opts.lumpSumYear && m % 12 === 1) {
      pay += opts.lumpSum;
    }
    balance -= pay;
    if (balance <= 0) {
      balance = 0;
      if (payoffMonth === null) payoffMonth = m;
    }
    balanceByMonth.push(balance);
  }
  return { balanceByMonth, totalInterest, payoffMonth };
}

// Simulate side-by-side loan strategies including investment of "freed" money + savings rate
export interface LoanStrategyResult {
  netWorthByMonth: number[];
  loanByMonth: number[];
  investmentByMonth: number[];
  totalInterest: number;
  payoffMonth: number | null;
  finalNetWorth: number;
}

export function simulateLoanStrategy(opts: {
  balance: number;
  annualRate: number;
  minPayment: number;
  extraPayment: number;
  lumpSum: number;
  lumpSumYear: number;
  monthlyIncome: number;
  savingsRate: number; // percent of income invested
  investReturnPct: number;
  months: number;
  payOffEarly: boolean; // if true uses extra/lumpSum on loan; else invests it
}): LoanStrategyResult {
  const loanR = opts.annualRate / 100 / 12;
  const invR = opts.investReturnPct / 100 / 12;
  let loan = opts.balance;
  let invest = 0;
  let totalInterest = 0;
  const loanByMonth: number[] = [loan];
  const investmentByMonth: number[] = [invest];
  const netWorthByMonth: number[] = [-loan];
  let payoffMonth: number | null = null;
  const baseMonthlySavings = (opts.monthlyIncome * opts.savingsRate) / 100;

  for (let m = 1; m <= opts.months; m++) {
    // loan interest + payment
    if (loan > 0) {
      const interest = loan * loanR;
      totalInterest += interest;
      loan += interest;
      let pay = opts.minPayment;
      if (opts.payOffEarly) {
        pay += opts.extraPayment;
        if (opts.lumpSum > 0 && Math.ceil(m / 12) === opts.lumpSumYear && m % 12 === 1) {
          pay += opts.lumpSum;
        }
      }
      loan -= pay;
      if (loan <= 0) {
        loan = 0;
        if (payoffMonth === null) payoffMonth = m;
      }
    }

    // investment growth + contributions
    let monthlyInvest = baseMonthlySavings;
    if (!opts.payOffEarly) {
      monthlyInvest += opts.extraPayment;
      if (opts.lumpSum > 0 && Math.ceil(m / 12) === opts.lumpSumYear && m % 12 === 1) {
        monthlyInvest += opts.lumpSum;
      }
    } else if (loan === 0) {
      // loan paid off - now invest what would have been extra
      monthlyInvest += opts.extraPayment;
    }
    invest = invest * (1 + invR) + monthlyInvest;

    loanByMonth.push(loan);
    investmentByMonth.push(invest);
    netWorthByMonth.push(invest - loan);
  }

  return {
    loanByMonth,
    investmentByMonth,
    netWorthByMonth,
    totalInterest,
    payoffMonth,
    finalNetWorth: invest - loan,
  };
}
