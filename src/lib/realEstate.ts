// Real-estate investment math: mortgage, cash flow, equity build-up,
// and side-by-side comparison vs investing the same cash in equities.

export interface PropertyInputs {
  price: number;
  downPaymentPct: number; // 0-100
  interestRate: number; // annual %
  loanTermYears: number; // 15 / 30
  closingCostsPct: number; // % of price

  monthlyRent: number;
  vacancyPct: number; // % of rent
  propertyTaxPct: number; // annual % of price
  insuranceMonthly: number;
  maintenancePct: number; // annual % of price
  managementPct: number; // % of rent (0 = self-managed)
  hoaMonthly: number;

  holdingYears: number;
  appreciationPct: number; // annual property appreciation
  rentGrowthPct: number; // annual rent growth
  expenseGrowthPct: number; // annual operating-expense inflation
  sellingCostsPct: number; // % of sale price (agent + fees)
}

export interface MonthlyBreakdown {
  pi: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  vacancy: number;
  management: number;
  hoa: number;
  totalExpenses: number; // includes P&I
  effectiveRent: number; // rent - vacancy
  cashFlow: number; // effectiveRent - totalExpenses
}

export interface PropertyYear {
  year: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  annualCashFlow: number;
  cumulativeCashFlow: number;
  netPosition: number; // equity + cumulative cash flow (paper-based)
}

export interface PropertyResult {
  downPayment: number;
  loanAmount: number;
  closingCosts: number;
  totalCashInvested: number;
  monthly: MonthlyBreakdown;
  annualCashFlow: number;
  annualNOI: number;
  capRate: number; // %
  cashOnCash: number; // %
  grossYield: number; // %
  yearly: PropertyYear[];
  finalSalePrice: number;
  finalEquity: number;
  totalProfit: number; // sale proceeds + cum cash flow - total cash invested
  annualizedReturn: number; // %
}

export function mortgagePayment(loan: number, annualRatePct: number, years: number): number {
  if (loan <= 0 || years <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return loan / n;
  return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function loanBalanceAfter(loan: number, annualRatePct: number, years: number, monthsPaid: number): number {
  if (loan <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  const m = Math.min(monthsPaid, n);
  if (r === 0) return Math.max(0, loan - (loan / n) * m);
  const pmt = mortgagePayment(loan, annualRatePct, years);
  const bal = loan * Math.pow(1 + r, m) - pmt * ((Math.pow(1 + r, m) - 1) / r);
  return Math.max(0, bal);
}

export function simulateProperty(inputs: PropertyInputs): PropertyResult {
  const downPayment = inputs.price * (inputs.downPaymentPct / 100);
  const loanAmount = inputs.price - downPayment;
  const closingCosts = inputs.price * (inputs.closingCostsPct / 100);
  const totalCashInvested = downPayment + closingCosts;

  const pi = mortgagePayment(loanAmount, inputs.interestRate, inputs.loanTermYears);
  const propertyTax = (inputs.price * inputs.propertyTaxPct) / 100 / 12;
  const maintenance = (inputs.price * inputs.maintenancePct) / 100 / 12;
  const vacancy = inputs.monthlyRent * (inputs.vacancyPct / 100);
  const management = inputs.monthlyRent * (inputs.managementPct / 100);
  const effectiveRent = inputs.monthlyRent - vacancy;
  const totalExpenses = pi + propertyTax + inputs.insuranceMonthly + maintenance + management + inputs.hoaMonthly;
  const cashFlow = effectiveRent - totalExpenses;

  const annualCashFlow = cashFlow * 12;
  const annualOperatingExp =
    (propertyTax + inputs.insuranceMonthly + maintenance + management + inputs.hoaMonthly) * 12;
  const annualNOI = effectiveRent * 12 - annualOperatingExp;
  const capRate = inputs.price > 0 ? (annualNOI / inputs.price) * 100 : 0;
  const cashOnCash = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;
  const grossYield = inputs.price > 0 ? ((inputs.monthlyRent * 12) / inputs.price) * 100 : 0;

  // Year-by-year projection
  const yearly: PropertyYear[] = [];
  let cumCashFlow = 0;
  for (let year = 0; year <= inputs.holdingYears; year++) {
    const propertyValue = inputs.price * Math.pow(1 + inputs.appreciationPct / 100, year);
    const loanBalance = loanBalanceAfter(loanAmount, inputs.interestRate, inputs.loanTermYears, year * 12);
    const equity = propertyValue - loanBalance;

    let yearCF = 0;
    if (year > 0) {
      const rentMult = Math.pow(1 + inputs.rentGrowthPct / 100, year - 1);
      const expMult = Math.pow(1 + inputs.expenseGrowthPct / 100, year - 1);
      const yRent = inputs.monthlyRent * rentMult;
      const yEffRent = yRent * (1 - inputs.vacancyPct / 100);
      const yMgmt = yRent * (inputs.managementPct / 100);
      const yTax = propertyTax * expMult;
      const yMaint = maintenance * expMult;
      const yIns = inputs.insuranceMonthly * expMult;
      const yHoa = inputs.hoaMonthly * expMult;
      const monthlyCF = yEffRent - pi - yTax - yIns - yMaint - yMgmt - yHoa;
      yearCF = monthlyCF * 12;
      cumCashFlow += yearCF;
    }

    yearly.push({
      year,
      propertyValue,
      loanBalance,
      equity,
      annualCashFlow: yearCF,
      cumulativeCashFlow: cumCashFlow,
      netPosition: equity + cumCashFlow,
    });
  }

  const finalYear = yearly[yearly.length - 1];
  const sellingCosts = finalYear.propertyValue * (inputs.sellingCostsPct / 100);
  const finalSalePrice = finalYear.propertyValue - sellingCosts;
  const finalEquity = finalSalePrice - finalYear.loanBalance;
  const totalProfit = finalEquity + cumCashFlow - totalCashInvested;

  const annualizedReturn =
    totalCashInvested > 0 && inputs.holdingYears > 0
      ? (Math.pow((finalEquity + cumCashFlow) / totalCashInvested, 1 / inputs.holdingYears) - 1) * 100
      : 0;

  return {
    downPayment,
    loanAmount,
    closingCosts,
    totalCashInvested,
    monthly: {
      pi,
      propertyTax,
      insurance: inputs.insuranceMonthly,
      maintenance,
      vacancy,
      management,
      hoa: inputs.hoaMonthly,
      totalExpenses,
      effectiveRent,
      cashFlow,
    },
    annualCashFlow,
    annualNOI,
    capRate,
    cashOnCash,
    grossYield,
    yearly,
    finalSalePrice,
    finalEquity,
    totalProfit,
    annualizedReturn,
  };
}

// Alternative: invest the same cash (down + closing) in equities, plus
// reinvest any positive monthly cash flow the rental would have produced.
export interface EquityYear {
  year: number;
  value: number;
  contributions: number;
}

export function simulateEquityAlternative(opts: {
  initialInvestment: number;
  annualReturnPct: number;
  years: number;
  monthlyContribution?: number; // optional ongoing add (e.g. matched rental cash flow)
}): EquityYear[] {
  const { initialInvestment, annualReturnPct, years, monthlyContribution = 0 } = opts;
  const monthlyR = annualReturnPct / 100 / 12;
  let balance = initialInvestment;
  let contributed = initialInvestment;
  const out: EquityYear[] = [{ year: 0, value: balance, contributions: contributed }];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyR) + monthlyContribution;
      contributed += monthlyContribution;
    }
    out.push({ year: y, value: balance, contributions: contributed });
  }
  return out;
}

// === Buy vs Rent (primary residence) =======================================
export interface BuyVsRentInputs {
  homePrice: number;
  downPaymentPct: number;
  interestRatePct: number;
  loanTermYears: number;
  closingCostsPct: number;
  propertyTaxPct: number;
  insuranceMonthly: number;
  maintenancePct: number;
  hoaMonthly: number;
  appreciationPct: number;
  sellingCostsPct: number;
  marginalTaxRate: number; // for mortgage interest deduction (rough)
  itemizesDeductions: boolean;

  monthlyRent: number;
  rentGrowthPct: number;
  rentersInsuranceMonthly: number;

  investmentReturnPct: number;
  inflationPct: number;
  years: number;
}

export interface BuyVsRentYear {
  year: number;
  buyNetWorth: number;
  rentNetWorth: number;
  buyMonthlyCost: number;
  rentMonthlyCost: number;
  propertyValue: number;
  loanBalance: number;
  rentInvestmentBalance: number;
}

export function simulateBuyVsRent(inputs: BuyVsRentInputs): {
  yearly: BuyVsRentYear[];
  breakEvenYear: number | null;
  finalDifference: number;
  recommendation: "buy" | "rent" | "neutral";
} {
  const downPayment = inputs.homePrice * (inputs.downPaymentPct / 100);
  const loan = inputs.homePrice - downPayment;
  const closing = inputs.homePrice * (inputs.closingCostsPct / 100);
  const pi = mortgagePayment(loan, inputs.interestRatePct, inputs.loanTermYears);
  const monthlyR = inputs.investmentReturnPct / 100 / 12;

  // The renter invests (downPayment + closing) up front, plus any monthly
  // difference if buying is more expensive in any month.
  let rentInvest = downPayment + closing;
  const yearly: BuyVsRentYear[] = [];
  let breakEvenYear: number | null = null;

  for (let y = 0; y <= inputs.years; y++) {
    const propertyValue = inputs.homePrice * Math.pow(1 + inputs.appreciationPct / 100, y);
    const loanBalance = loanBalanceAfter(loan, inputs.interestRatePct, inputs.loanTermYears, y * 12);
    const sellingCosts = propertyValue * (inputs.sellingCostsPct / 100);
    const buyEquity = propertyValue - sellingCosts - loanBalance;

    // Year-y monthly costs
    const yTax = (inputs.homePrice * inputs.propertyTaxPct / 100) / 12;
    const yMaint = (inputs.homePrice * inputs.maintenancePct / 100) / 12;
    const yInsurance = inputs.insuranceMonthly;
    const yHoa = inputs.hoaMonthly;
    // Rough mortgage-interest tax shield (assumes mostly interest in early years)
    const taxShield = inputs.itemizesDeductions
      ? (loanBalance * inputs.interestRatePct) / 100 / 12 * inputs.marginalTaxRate
      : 0;
    const buyMonthly = pi + yTax + yMaint + yInsurance + yHoa - taxShield;

    const rentMult = Math.pow(1 + inputs.rentGrowthPct / 100, y);
    const yRent = inputs.monthlyRent * rentMult;
    const rentMonthly = yRent + inputs.rentersInsuranceMonthly;

    // Run a year of investing for the renter (if y > 0)
    if (y > 0) {
      const monthlyDiff = buyMonthly - rentMonthly; // positive => buying is pricier
      for (let m = 0; m < 12; m++) {
        rentInvest = rentInvest * (1 + monthlyR) + Math.max(0, monthlyDiff);
      }
    }

    const rentInvestmentAfterTaxIfSold =
      rentInvest > downPayment + closing
        ? rentInvest - (rentInvest - (downPayment + closing)) * 0.15
        : rentInvest;

    const buyNetWorth = buyEquity;
    const rentNetWorth = rentInvestmentAfterTaxIfSold;

    yearly.push({
      year: y,
      buyNetWorth,
      rentNetWorth,
      buyMonthlyCost: buyMonthly,
      rentMonthlyCost: rentMonthly,
      propertyValue,
      loanBalance,
      rentInvestmentBalance: rentInvest,
    });

    if (breakEvenYear === null && y > 0 && buyNetWorth >= rentNetWorth) breakEvenYear = y;
  }

  const finalDifference = yearly[yearly.length - 1].buyNetWorth - yearly[yearly.length - 1].rentNetWorth;
  const recommendation =
    Math.abs(finalDifference) < 10_000 ? "neutral" : finalDifference > 0 ? "buy" : "rent";
  return { yearly, breakEvenYear, finalDifference, recommendation };
}

// === Mortgage Payoff vs Invest =============================================
export interface PayoffVsInvestInputs {
  mortgageBalance: number;
  interestRatePct: number;
  monthsRemaining: number;
  baseMonthlyPayment: number; // P&I currently
  extraPerMonth: number;
  investmentReturnPct: number;
  marginalTaxRate: number; // for interest deduction shield
  itemizes: boolean;
}

export interface PayoffVsInvestResult {
  payoffStrategy: { netWorthByMonth: number[]; payoffMonth: number | null; totalInterest: number };
  investStrategy: { netWorthByMonth: number[]; payoffMonth: number; investmentValue: number; totalInterest: number };
  finalDifference: number;
  betterChoice: "payoff" | "invest";
}

export function simulatePayoffVsInvest(opts: PayoffVsInvestInputs): PayoffVsInvestResult {
  const r = opts.interestRatePct / 100 / 12;
  const invR = opts.investmentReturnPct / 100 / 12;
  const horizon = opts.monthsRemaining;

  // PAY EXTRA on mortgage
  let loanA = opts.mortgageBalance;
  let investA = 0;
  let totalInterestA = 0;
  let payoffMonthA: number | null = null;
  const netWorthA: number[] = [-loanA];

  for (let m = 1; m <= horizon; m++) {
    if (loanA > 0) {
      const interest = loanA * r;
      totalInterestA += interest;
      loanA += interest;
      let pay = opts.baseMonthlyPayment + opts.extraPerMonth;
      pay = Math.min(pay, loanA);
      loanA -= pay;
      if (loanA <= 0.01) {
        loanA = 0;
        if (payoffMonthA === null) payoffMonthA = m;
      }
    } else {
      // loan paid off → invest the full payment (base + extra)
      investA = investA * (1 + invR) + (opts.baseMonthlyPayment + opts.extraPerMonth);
    }
    netWorthA.push(investA - loanA);
  }

  // INVEST the extra
  let loanB = opts.mortgageBalance;
  let investB = 0;
  let totalInterestB = 0;
  const netWorthB: number[] = [-loanB];
  for (let m = 1; m <= horizon; m++) {
    if (loanB > 0) {
      const interest = loanB * r;
      totalInterestB += interest;
      loanB += interest;
      loanB -= Math.min(opts.baseMonthlyPayment, loanB);
      if (loanB <= 0.01) loanB = 0;
    }
    investB = investB * (1 + invR) + opts.extraPerMonth;
    netWorthB.push(investB - loanB);
  }

  const finalA = netWorthA[netWorthA.length - 1];
  const finalB = netWorthB[netWorthB.length - 1];

  return {
    payoffStrategy: { netWorthByMonth: netWorthA, payoffMonth: payoffMonthA, totalInterest: totalInterestA },
    investStrategy: {
      netWorthByMonth: netWorthB,
      payoffMonth: horizon,
      investmentValue: investB,
      totalInterest: totalInterestB,
    },
    finalDifference: finalA - finalB,
    betterChoice: finalA > finalB ? "payoff" : "invest",
  };
}

// === Refinance Calculator ==================================================
export interface RefinanceInputs {
  currentBalance: number;
  currentRatePct: number;
  monthsRemaining: number;
  newRatePct: number;
  newTermYears: number;
  closingCosts: number;
  cashOutAmount: number;
  cashOutReturnPct: number; // if invested
}

export interface RefinanceResult {
  currentMonthlyPI: number;
  newLoanAmount: number;
  newMonthlyPI: number;
  monthlySavings: number;
  breakEvenMonths: number;
  totalInterestCurrent: number;
  totalInterestNew: number;
  lifetimeInterestSavings: number;
  cashOutAfterYears: (years: number) => number;
}

export function analyzeRefinance(opts: RefinanceInputs): RefinanceResult {
  const currentYears = opts.monthsRemaining / 12;
  const currentPI = mortgagePayment(opts.currentBalance, opts.currentRatePct, currentYears);
  const newLoan = opts.currentBalance + opts.closingCosts + opts.cashOutAmount;
  const newPI = mortgagePayment(newLoan, opts.newRatePct, opts.newTermYears);
  const savings = currentPI - newPI;
  const breakEven = savings > 0 ? opts.closingCosts / savings : Infinity;

  // total interest under each
  const totalCurrent = currentPI * opts.monthsRemaining - opts.currentBalance;
  const totalNew = newPI * (opts.newTermYears * 12) - newLoan;

  return {
    currentMonthlyPI: currentPI,
    newLoanAmount: newLoan,
    newMonthlyPI: newPI,
    monthlySavings: savings,
    breakEvenMonths: breakEven,
    totalInterestCurrent: totalCurrent,
    totalInterestNew: totalNew,
    lifetimeInterestSavings: totalCurrent - totalNew,
    cashOutAfterYears: (years) =>
      opts.cashOutAmount * Math.pow(1 + opts.cashOutReturnPct / 100, years),
  };
}
