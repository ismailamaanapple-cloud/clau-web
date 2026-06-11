"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { simulateBorrowVsSell } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export function BorrowVsSellMode() {
  const [portfolioValue, setPortfolioValue] = useState(2_000_000);
  const [costBasisPct, setCostBasisPct] = useState(40);
  const [annualSpending, setAnnualSpending] = useState(100_000);
  const [loanRate, setLoanRate] = useState(6);
  const [growth, setGrowth] = useState(8);
  const [inflation, setInflation] = useState(3);
  const [years, setYears] = useState(20);
  const [maxLtv, setMaxLtv] = useState(50);

  const sim = useMemo(
    () =>
      simulateBorrowVsSell({
        portfolioValue,
        costBasisPct,
        annualSpending,
        growthPct: growth,
        loanRatePct: loanRate,
        inflationPct: inflation,
        years,
        maxLtvPct: maxLtv,
      }),
    [portfolioValue, costBasisPct, annualSpending, growth, loanRate, inflation, years, maxLtv]
  );

  const borrowWins = sim.finalBorrowNetWorth > sim.finalSellNetWorth;
  const diff = Math.abs(sim.finalBorrowNetWorth - sim.finalSellNetWorth);
  const finalLtv = sim.rows[sim.rows.length - 1]?.ltvPct ?? 0;

  return (
    <div className="space-y-6">
      {/* Strategy cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StrategyCard
          title="Borrow Against Portfolio"
          subtitle="Never sell — fund life with a portfolio line of credit"
          netWorth={sim.finalBorrowNetWorth}
          costLabel="Total Interest"
          cost={sim.totalInterest}
          extraLabel={`LTV at Year ${years}`}
          extra={isFinite(finalLtv) ? `${finalLtv.toFixed(0)}%` : "—"}
          best={borrowWins}
        />
        <StrategyCard
          title="Sell Shares"
          subtitle="Sell stock each year, pay capital gains tax"
          netWorth={sim.finalSellNetWorth}
          costLabel="Total Taxes"
          cost={sim.totalTax}
          extraLabel="Portfolio Depleted"
          extra={sim.sellDepletedYear ? `Year ${sim.sellDepletedYear}` : "Never"}
          best={!borrowWins}
        />
      </div>

      {/* Difference + cost comparison */}
      <Card glow>
        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">Net Worth Difference After {years} Years</p>
          <p className={cn("text-4xl font-black mt-1", "text-[var(--green)]")}>{formatCurrency(diff)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {borrowWins ? "Borrowing" : "Selling"} comes out ahead — interest cost {formatCurrency(sim.totalInterest, true)} vs taxes {formatCurrency(sim.totalTax, true)}.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <Mini label="Interest Paid (Borrow)" value={formatCurrency(sim.totalInterest, true)} />
          <Mini label="Taxes Paid (Sell)" value={formatCurrency(sim.totalTax, true)} />
          <Mini
            label="Interest − Taxes"
            value={(sim.totalInterest > sim.totalTax ? "+" : "−") + formatCurrency(Math.abs(sim.totalInterest - sim.totalTax), true)}
          />
          <Mini label="Untaxed Gains at Death" value={formatCurrency(sim.finalUnrealizedGain, true)} />
        </div>
      </Card>

      {/* Margin call warning */}
      {sim.marginCallYear && (
        <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--red)] p-4 flex items-start gap-3">
          <AlertTriangle className="text-[var(--red)] shrink-0 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-[var(--red)]">Margin call risk at Year {sim.marginCallYear}</div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">
              The loan crosses {maxLtv}% of the portfolio's value. In a real SBLOC the lender can demand repayment or
              force-sell your shares — exactly what this strategy tries to avoid. Spend less, borrow at a lower rate,
              or start with a bigger portfolio.
            </p>
          </div>
        </div>
      )}

      {/* Net worth chart */}
      <Card>
        <CardTitle>Net Worth Over Time</CardTitle>
        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sim.rows} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} />
              <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(y) => `Year ${y}`}
              />
              <Legend />
              <Line type="monotone" dataKey="borrowNetWorth" name="Borrow (portfolio − loan)" stroke="var(--green)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="sellPortfolio" name="Sell shares" stroke="var(--red)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="loanBalance" name="Loan balance" stroke="var(--yellow)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
              {sim.marginCallYear && <ReferenceLine x={sim.marginCallYear} stroke="var(--red)" strokeDasharray="4 4" label={{ value: "Margin call", fill: "var(--red)", fontSize: 11 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cumulative cost chart: interest vs taxes */}
      <Card>
        <CardTitle>Cumulative Cost · Interest vs Taxes</CardTitle>
        <div className="h-60 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sim.rows} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} />
              <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(y) => `Year ${y}`}
              />
              <Legend />
              <Line type="monotone" dataKey="cumInterest" name="Interest paid (borrow)" stroke="var(--yellow)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cumTax" name="Taxes paid (sell)" stroke="var(--red)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Inputs */}
      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Slider label="Portfolio Value" value={portfolioValue} onChange={setPortfolioValue} min={100_000} max={50_000_000} step={50_000} prefix="$" />
          <Slider label="Cost Basis (% of value)" value={costBasisPct} onChange={setCostBasisPct} min={5} max={100} step={5} suffix="%" />
          <Slider label="Annual Spending" value={annualSpending} onChange={setAnnualSpending} min={20_000} max={2_000_000} step={5_000} prefix="$" />
          <Slider label="Loan Interest Rate (SBLOC)" value={loanRate} onChange={setLoanRate} min={1} max={12} step={0.25} suffix="%" />
          <Slider label="Portfolio Growth" value={growth} onChange={setGrowth} min={3} max={15} step={0.5} suffix="%" />
          <Slider label="Spending Inflation" value={inflation} onChange={setInflation} min={0} max={8} step={0.5} suffix="%" />
          <Slider label="Timeline" value={years} onChange={setYears} min={5} max={40} step={1} suffix=" years" />
          <Slider label="Margin Call LTV Limit" value={maxLtv} onChange={setMaxLtv} min={30} max={80} step={5} suffix="%" />
        </div>
      </Card>

      {/* Explainer */}
      <Card>
        <CardTitle>How "Buy, Borrow, Die" Works</CardTitle>
        <div className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed space-y-2">
          <p>
            <span className="text-white font-semibold">Buy:</span> hold appreciating assets. Unrealized gains aren't
            taxed — a portfolio can grow for decades without generating a single tax bill.
          </p>
          <p>
            <span className="text-white font-semibold">Borrow:</span> instead of selling (a taxable event), take a
            securities-backed line of credit against the shares. Loan proceeds aren't income, so there's no tax — just
            interest, which here compounds onto the loan at {loanRate}%.
          </p>
          <p>
            <span className="text-white font-semibold">Die:</span> at death, heirs receive the shares with a{" "}
            <span className="text-white font-semibold">stepped-up basis</span> — the embedded gain (
            {formatCurrency(sim.finalUnrealizedGain, true)} in this simulation) is wiped clean for tax purposes. The
            estate repays the loan by selling shares tax-free.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            The catch: it only works while growth ({growth}%) outruns the loan rate ({loanRate}%) and the loan stays
            comfortably below the lender's LTV limit. A deep crash can trigger forced selling at the worst moment.
            Simplified single-filer model for education — not tax or investment advice.
          </p>
        </div>
      </Card>
    </div>
  );
}

function StrategyCard({
  title,
  subtitle,
  netWorth,
  costLabel,
  cost,
  extraLabel,
  extra,
  best,
}: {
  title: string;
  subtitle: string;
  netWorth: number;
  costLabel: string;
  cost: number;
  extraLabel: string;
  extra: string;
  best: boolean;
}) {
  return (
    <Card glow={best} className={best ? "border-[var(--green)]" : undefined}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        {best && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--green)] text-black">BEST</span>}
      </div>
      <StatValue size="lg" className={best ? "text-[var(--green)]" : "text-[var(--red)]"}>{formatCurrency(netWorth, true)}</StatValue>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Mini label={costLabel} value={formatCurrency(cost, true)} />
        <Mini label={extraLabel} value={extra} />
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface-light)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
