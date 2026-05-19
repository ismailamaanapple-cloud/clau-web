"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { useUser } from "@/lib/UserContext";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  simulateProperty,
  simulateEquityAlternative,
  type PropertyInputs,
} from "@/lib/realEstate";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Building2, TrendingUp, DollarSign, Percent, Calculator, Scale, Home as HomeIcon } from "lucide-react";

const LOAN_TERMS = [15, 30] as const;

export function RentalCalcMode() {
  const { profile } = useUser();

  // Inputs
  const [price, setPrice] = useState(500_000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(7);
  const [loanTermYears, setLoanTermYears] = useState<15 | 30>(30);
  const [closingCostsPct, setClosingCostsPct] = useState(3);

  const [monthlyRent, setMonthlyRent] = useState(3_500);
  const [vacancyPct, setVacancyPct] = useState(5);
  const [propertyTaxPct, setPropertyTaxPct] = useState(1.2);
  const [insuranceMonthly, setInsuranceMonthly] = useState(150);
  const [maintenancePct, setMaintenancePct] = useState(1);
  const [managementPct, setManagementPct] = useState(0);
  const [hoaMonthly, setHoaMonthly] = useState(0);

  const [holdingYears, setHoldingYears] = useState(15);
  // Note: even though sliders cap at large numbers, every value field is
  // click-to-type, so users can punch in higher numbers manually if needed.
  const [appreciationPct, setAppreciationPct] = useState(3);
  const [rentGrowthPct, setRentGrowthPct] = useState(3);
  const [expenseGrowthPct, setExpenseGrowthPct] = useState(2.5);
  const [sellingCostsPct, setSellingCostsPct] = useState(6);

  const [equityReturnPct, setEquityReturnPct] = useState(profile.annualReturn || 8);
  const [reinvestCashFlow, setReinvestCashFlow] = useState(true);

  const result = useMemo(() => {
    const inputs: PropertyInputs = {
      price,
      downPaymentPct,
      interestRate,
      loanTermYears,
      closingCostsPct,
      monthlyRent,
      vacancyPct,
      propertyTaxPct,
      insuranceMonthly,
      maintenancePct,
      managementPct,
      hoaMonthly,
      holdingYears,
      appreciationPct,
      rentGrowthPct,
      expenseGrowthPct,
      sellingCostsPct,
    };
    return simulateProperty(inputs);
  }, [
    price, downPaymentPct, interestRate, loanTermYears, closingCostsPct,
    monthlyRent, vacancyPct, propertyTaxPct, insuranceMonthly, maintenancePct,
    managementPct, hoaMonthly, holdingYears, appreciationPct, rentGrowthPct,
    expenseGrowthPct, sellingCostsPct,
  ]);

  const equity = useMemo(() => {
    const monthlyAdd = reinvestCashFlow ? Math.max(0, result.monthly.cashFlow) : 0;
    return simulateEquityAlternative({
      initialInvestment: result.totalCashInvested,
      annualReturnPct: equityReturnPct,
      years: holdingYears,
      monthlyContribution: monthlyAdd,
    });
  }, [result.totalCashInvested, result.monthly.cashFlow, equityReturnPct, holdingYears, reinvestCashFlow]);

  const equityFinal = equity[equity.length - 1]?.value ?? 0;
  const equityProfit = equityFinal - (equity[equity.length - 1]?.contributions ?? 0);

  const compareData = useMemo(() => {
    return result.yearly.map((y, i) => ({
      year: y.year,
      property: y.equity + y.cumulativeCashFlow,
      stocks: equity[i]?.value ?? 0,
    }));
  }, [result.yearly, equity]);

  const cashFlowColor = result.monthly.cashFlow >= 0 ? "var(--green)" : "var(--red)";
  const winner = result.finalEquity + result.yearly[result.yearly.length - 1].cumulativeCashFlow > equityFinal
    ? "property" : "stocks";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Monthly Cash Flow</CardTitle>
          <StatValue size="lg" style={{ color: cashFlowColor }} className="!text-current">
            {formatCurrency(result.monthly.cashFlow)}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">After all expenses & debt service</p>
        </Card>
        <Card>
          <CardTitle>Cash on Cash</CardTitle>
          <StatValue size="lg">{formatPercent(result.cashOnCash, 1)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Annual return on cash invested</p>
        </Card>
        <Card>
          <CardTitle>Cap Rate</CardTitle>
          <StatValue size="lg">{formatPercent(result.capRate, 2)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">NOI / property price</p>
        </Card>
        <Card>
          <CardTitle>Cash Needed</CardTitle>
          <StatValue size="lg">{formatCurrency(result.totalCashInvested, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatCurrency(result.downPayment, true)} down + {formatCurrency(result.closingCosts, true)} closing
          </p>
        </Card>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Purchase + Financing */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-lg bg-[var(--green-muted)] p-1.5">
              <HomeIcon className="text-[var(--green)]" size={16} />
            </div>
            <CardTitle className="!mb-0">Purchase &amp; Financing</CardTitle>
          </div>
          <div className="space-y-3">
            <Slider label="Property Price" value={price} onChange={setPrice} min={50_000} max={40_000_000} step={10_000} prefix="$" />
            <Slider
              label={`Down Payment (${formatCurrency(price * (downPaymentPct / 100), true)})`}
              value={downPaymentPct}
              onChange={setDownPaymentPct}
              min={0}
              max={100}
              step={1}
              suffix="%"
            />
            <Slider label="Interest Rate" value={interestRate} onChange={setInterestRate} min={0} max={20} step={0.125} suffix="%" />
            <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--text-secondary)] font-medium">Loan Term</span>
              </div>
              <div className="flex gap-2">
                {LOAN_TERMS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLoanTermYears(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                      loanTermYears === t
                        ? "bg-[var(--green-muted)] text-[var(--green)]"
                        : "bg-[var(--card)] text-[var(--text-secondary)] hover:text-white"
                    }`}
                  >
                    {t}-Year Fixed
                  </button>
                ))}
              </div>
            </div>
            <Slider label="Closing Costs" value={closingCostsPct} onChange={setClosingCostsPct} min={0} max={15} step={0.25} suffix="%" />
          </div>
        </Card>

        {/* Income + Expenses */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-lg bg-[var(--green-muted)] p-1.5">
              <DollarSign className="text-[var(--green)]" size={16} />
            </div>
            <CardTitle className="!mb-0">Income &amp; Operating Expenses</CardTitle>
          </div>
          <div className="space-y-3">
            <Slider label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} min={500} max={500_000} step={100} prefix="$" suffix="/mo" />
            <Slider label="Vacancy Rate" value={vacancyPct} onChange={setVacancyPct} min={0} max={50} step={0.5} suffix="%" />
            <Slider label="Property Tax (annual)" value={propertyTaxPct} onChange={setPropertyTaxPct} min={0} max={10} step={0.05} suffix="%" />
            <Slider label="Insurance" value={insuranceMonthly} onChange={setInsuranceMonthly} min={0} max={20_000} step={25} prefix="$" suffix="/mo" />
            <Slider label="Maintenance & Repairs (annual)" value={maintenancePct} onChange={setMaintenancePct} min={0} max={15} step={0.1} suffix="%" />
            <Slider label="Property Management (of rent)" value={managementPct} onChange={setManagementPct} min={0} max={30} step={0.5} suffix="%" />
            <Slider label="HOA" value={hoaMonthly} onChange={setHoaMonthly} min={0} max={10_000} step={25} prefix="$" suffix="/mo" />
          </div>
        </Card>
      </div>

      {/* Monthly breakdown */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-[var(--green-muted)] p-1.5">
            <Calculator className="text-[var(--green)]" size={16} />
          </div>
          <CardTitle className="!mb-0">Monthly Cash-Flow Waterfall</CardTitle>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Gross Rent" value={formatCurrency(monthlyRent)} positive />
          <Row label={`− Vacancy (${vacancyPct}%)`} value={`-${formatCurrency(result.monthly.vacancy)}`} muted />
          <Divider />
          <Row label="Effective Rent" value={formatCurrency(result.monthly.effectiveRent)} bold />
          <Divider />
          <Row label="− Mortgage (P&I)" value={`-${formatCurrency(result.monthly.pi)}`} muted />
          <Row label="− Property Tax" value={`-${formatCurrency(result.monthly.propertyTax)}`} muted />
          <Row label="− Insurance" value={`-${formatCurrency(result.monthly.insurance)}`} muted />
          <Row label="− Maintenance" value={`-${formatCurrency(result.monthly.maintenance)}`} muted />
          {result.monthly.management > 0 && (
            <Row label="− Management" value={`-${formatCurrency(result.monthly.management)}`} muted />
          )}
          {result.monthly.hoa > 0 && (
            <Row label="− HOA" value={`-${formatCurrency(result.monthly.hoa)}`} muted />
          )}
          <Divider />
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-semibold text-white">Net Cash Flow</span>
            <span className="text-xl font-bold" style={{ color: cashFlowColor }}>
              {formatCurrency(result.monthly.cashFlow)} /mo
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Annual</span>
            <span>{formatCurrency(result.annualCashFlow)} / yr</span>
          </div>
        </div>
      </Card>

      {/* Long-term assumptions */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-[var(--green-muted)] p-1.5">
            <TrendingUp className="text-[var(--green)]" size={16} />
          </div>
          <CardTitle className="!mb-0">Long-Term Assumptions</CardTitle>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Slider label="Holding Period" value={holdingYears} onChange={setHoldingYears} min={1} max={50} step={1} suffix=" yrs" />
          <Slider label="Property Appreciation" value={appreciationPct} onChange={setAppreciationPct} min={-5} max={20} step={0.25} suffix="% /yr" />
          <Slider label="Rent Growth" value={rentGrowthPct} onChange={setRentGrowthPct} min={0} max={20} step={0.25} suffix="% /yr" />
          <Slider label="Expense Inflation" value={expenseGrowthPct} onChange={setExpenseGrowthPct} min={0} max={20} step={0.25} suffix="% /yr" />
          <Slider label="Selling Costs (agent + fees)" value={sellingCostsPct} onChange={setSellingCostsPct} min={0} max={15} step={0.25} suffix="%" />
        </div>
      </Card>

      {/* Property vs Stocks comparison */}
      <Card glow>
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-[var(--green-muted)] p-1.5">
            <Scale className="text-[var(--green)]" size={16} />
          </div>
          <CardTitle className="!mb-0">Property vs Stocks ({holdingYears}-Year Comparison)</CardTitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div
            className={`rounded-xl border p-4 ${
              winner === "property"
                ? "border-[var(--green)] bg-[var(--green-muted)]"
                : "border-[var(--border)] bg-[var(--surface-light)]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={16} className="text-[var(--green)]" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[var(--text-secondary)]">
                Real Estate
              </span>
              {winner === "property" && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[var(--green)]">
                  Winner
                </span>
              )}
            </div>
            <StatValue size="lg">
              {formatCurrency(result.finalEquity + result.yearly[result.yearly.length - 1].cumulativeCashFlow, true)}
            </StatValue>
            <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
              <Mini label="Sale equity" value={formatCurrency(result.finalEquity, true)} />
              <Mini label="Cumulative cash flow" value={formatCurrency(result.yearly[result.yearly.length - 1].cumulativeCashFlow, true)} />
              <Mini label="Total profit" value={formatCurrency(result.totalProfit, true)} />
              <Mini label="Annualized return" value={formatPercent(result.annualizedReturn, 1)} />
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              winner === "stocks"
                ? "border-[var(--green)] bg-[var(--green-muted)]"
                : "border-[var(--border)] bg-[var(--surface-light)]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[var(--green)]" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[var(--text-secondary)]">
                Stocks (S&amp;P-style)
              </span>
              {winner === "stocks" && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[var(--green)]">
                  Winner
                </span>
              )}
            </div>
            <StatValue size="lg">{formatCurrency(equityFinal, true)}</StatValue>
            <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
              <Mini label="Starting investment" value={formatCurrency(result.totalCashInvested, true)} />
              <Mini label="Total contributions" value={formatCurrency(equity[equity.length - 1]?.contributions ?? 0, true)} />
              <Mini label="Total growth" value={formatCurrency(equityProfit, true)} />
              <Mini label="Return assumed" value={formatPercent(equityReturnPct, 1)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Slider label="Stock Market Return" value={equityReturnPct} onChange={setEquityReturnPct} min={0} max={25} step={0.25} suffix="% /yr" />
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--text-secondary)]">Reinvest rental cash flow into stocks?</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">Apples-to-apples: stocks side also gets the monthly cash.</div>
            </div>
            <button
              type="button"
              onClick={() => setReinvestCashFlow((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition ${
                reinvestCashFlow ? "bg-[var(--green)]" : "bg-[var(--border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  reinvestCashFlow ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-80 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={compareData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="propFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stockFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFB020" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FFB020" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--text-secondary)" }}
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="property"
                name="Real Estate Net Position"
                stroke="var(--green)"
                strokeWidth={2.5}
                fill="url(#propFill)"
              />
              <Area
                type="monotone"
                dataKey="stocks"
                name="Stocks"
                stroke="#FFB020"
                strokeWidth={2.5}
                fill="url(#stockFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Quick reference */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SmallStat icon={<Percent size={14} />} label="Gross Yield" value={formatPercent(result.grossYield, 2)} />
        <SmallStat icon={<DollarSign size={14} />} label="Monthly P&I" value={formatCurrency(result.monthly.pi)} />
        <SmallStat icon={<HomeIcon size={14} />} label="Loan Amount" value={formatCurrency(result.loanAmount, true)} />
        <SmallStat icon={<TrendingUp size={14} />} label="Final Property Value" value={formatCurrency(result.yearly[result.yearly.length - 1].propertyValue, true)} />
      </div>

      <p className="text-center text-xs text-[var(--text-muted)] mt-4">
        Educational only — not financial advice. Real-estate returns vary by market, tenant quality, and leverage; numbers assume the property is rented continuously aside from the vacancy rate.
      </p>
    </div>
  );
}

function Row({ label, value, positive, muted, bold }: { label: string; value: string; positive?: boolean; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${muted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"} ${bold ? "font-semibold text-white" : ""}`}>
        {label}
      </span>
      <span className={`font-medium ${positive ? "text-[var(--green)]" : bold ? "text-white font-bold" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-[var(--border)] my-1" />;
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

function SmallStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm sm:text-base font-bold text-white">{value}</div>
    </Card>
  );
}
