"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { simulateBorrowVsSell } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { useUser } from "@/lib/UserContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";
import { AlertTriangle, Landmark, Receipt, Lightbulb } from "lucide-react";
import { cn } from "@/lib/cn";

export function BorrowVsSellMode() {
  const { profile, updateProfile } = useUser();
  const saved = profile.borrowVsSell;
  const [portfolioValue, setPortfolioValue] = useState(saved?.portfolioValue ?? 2_000_000);
  const [costBasisPct, setCostBasisPct] = useState(saved?.costBasisPct ?? 40);
  const [annualSpending, setAnnualSpending] = useState(saved?.annualSpending ?? 100_000);
  const [loanRate, setLoanRate] = useState(saved?.loanRate ?? 6);
  const [growth, setGrowth] = useState(saved?.growth ?? 8);
  const [inflation, setInflation] = useState(saved?.inflation ?? 3);
  const [years, setYears] = useState(saved?.years ?? 20);
  const [maxLtv, setMaxLtv] = useState(saved?.maxLtv ?? 50);

  // Persist all inputs so the scenario is there next time.
  useEffect(() => {
    updateProfile({
      borrowVsSell: { portfolioValue, costBasisPct, annualSpending, loanRate, growth, inflation, years, maxLtv },
    });
  }, [portfolioValue, costBasisPct, annualSpending, loanRate, growth, inflation, years, maxLtv, updateProfile]);

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
      {/* Plain-language intro */}
      <Card glow className="border-[var(--green-muted)]">
        <CardTitle>What This Compares</CardTitle>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
          Say you have a big stock portfolio and need{" "}
          <span className="text-white font-semibold">{formatCurrency(annualSpending)}</span> a year to live on. There
          are two ways to turn those stocks into spending money — and they cost very different amounts.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Receipt size={16} className="text-[var(--red)]" />
              <span className="text-sm font-bold text-white">Option 1 · Sell shares</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Sell a chunk of stock each year. Simple — but every sale is a taxable event, so you hand the IRS
              capital-gains tax on the profit portion <span className="text-white font-semibold">every single year</span>.
            </p>
          </div>
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Landmark size={16} className="text-[var(--green)]" />
              <span className="text-sm font-bold text-white">Option 2 · Borrow against it</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Keep every share and take a loan using the portfolio as collateral (an{" "}
              <span className="text-white font-semibold">SBLOC</span>). A loan isn&apos;t income, so there&apos;s no tax —
              you just pay interest. This is the &ldquo;buy, borrow, die&rdquo; move the ultra-wealthy use.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 mt-3 rounded-xl bg-[var(--green-muted)] p-3.5">
          <Lightbulb size={16} className="text-[var(--green)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="text-white font-semibold">The whole game:</span> is the{" "}
            <span className="text-[var(--yellow)] font-semibold">interest</span> on the loan cheaper than the{" "}
            <span className="text-[var(--red)] font-semibold">taxes</span> you&apos;d owe from selling? And does your
            portfolio grow faster than the loan piles up? The cards below run the math for your numbers — adjust the
            inputs near the bottom to make it your own.
          </p>
        </div>
      </Card>

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
        <div className="mt-4 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--green)] font-semibold mb-1">In plain English</p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {borrowWins ? (
              <>
                Over {years} years, borrowing cost <span className="text-[var(--yellow)] font-semibold">{formatCurrency(sim.totalInterest, true)}</span> in
                interest, while selling would have cost <span className="text-[var(--red)] font-semibold">{formatCurrency(sim.totalTax, true)}</span> in
                taxes. Borrowing still wins because your shares stayed invested and kept compounding instead of being
                sold off — leaving you <span className="text-[var(--green)] font-semibold">{formatCurrency(diff)}</span> richer at the end.
              </>
            ) : (
              <>
                Over {years} years, selling cost <span className="text-[var(--red)] font-semibold">{formatCurrency(sim.totalTax, true)}</span> in
                taxes, while borrowing would have cost <span className="text-[var(--yellow)] font-semibold">{formatCurrency(sim.totalInterest, true)}</span> in
                interest. Here selling wins — the loan interest (at {loanRate}%) piled up faster than the tax you save,
                so selling leaves you <span className="text-[var(--green)] font-semibold">{formatCurrency(diff)}</span> richer. Try a lower
                loan rate or higher growth to flip it.
              </>
            )}
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
        <p className="text-xs text-[var(--text-muted)] -mt-1 mb-1">
          <span className="text-[var(--green)] font-semibold">Green</span> = what you&apos;re worth if you borrow (portfolio minus the loan).{" "}
          <span className="text-[var(--red)] font-semibold">Red</span> = what&apos;s left if you sell shares to fund spending.{" "}
          <span className="text-[var(--yellow)] font-semibold">Yellow dashed</span> = how big the loan grows.
        </p>
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
        <p className="text-xs text-[var(--text-muted)] -mt-1 mb-1">
          The running total each path costs you — <span className="text-[var(--yellow)] font-semibold">interest</span> if you
          borrow, <span className="text-[var(--red)] font-semibold">taxes</span> if you sell. Whichever line stays lower is the
          cheaper way to fund the same lifestyle.
        </p>
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
