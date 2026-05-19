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
