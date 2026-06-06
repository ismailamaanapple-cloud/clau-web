"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { projectDrawdown, type DrawdownYear } from "@/lib/finance";
import { formatCurrency, capitalGainsTaxRate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceArea,
} from "recharts";

// Matches the income model used by the portfolio cards: a 4% sale taxed at
// long-term cap-gains rates, plus dividends taxed at a flat rate.
const DIV_TAX_RATE = 0.35;

function incomeBreakdown(balance: number, drawn: number, divYieldPct: number) {
  const dividend = balance * (divYieldPct / 100);
  const capTax = drawn * capitalGainsTaxRate(drawn);
  const divTax = dividend * DIV_TAX_RATE;
  const preTax = drawn + dividend;
  const afterTax = preTax - capTax - divTax;
  return { dividend, capTax, divTax, preTax, afterTax };
}

/**
 * The 4% rule, visualized: accumulate until a chosen age, then each year draw a
 * fixed % of the CURRENT balance — plus the portfolio's dividends — and net out
 * capital-gains and dividend tax. Income recalculates (and grows) with the pot.
 * Shared by the Custom and Premade portfolio tabs.
 */
export function DrawdownProjection({
  annualReturnPct,
  dividendYieldPct,
  initial,
  monthly,
  currentAge,
  defaultStartAge,
}: {
  annualReturnPct: number;
  dividendYieldPct: number;
  initial: number;
  monthly: number;
  currentAge: number;
  defaultStartAge?: number;
}) {
  const [startAge, setStartAge] = useState(
    Math.min(75, Math.max(currentAge + 1, defaultStartAge ?? Math.max(50, currentAge + 1)))
  );
  const [rate, setRate] = useState(4);
  const [endAge, setEndAge] = useState(90);

  const safeStart = Math.max(currentAge + 1, Math.min(startAge, endAge - 1));

  const rows = useMemo(
    () =>
      projectDrawdown({
        startBalance: initial,
        currentAge,
        monthlyContribution: monthly,
        withdrawalStartAge: safeStart,
        endAge,
        annualReturnPct,
        withdrawalRatePct: rate,
      }),
    [initial, currentAge, monthly, safeStart, endAge, annualReturnPct, rate]
  );

  const byAge = useMemo(() => new Map(rows.map((r) => [r.age, r])), [rows]);
  const atRetirement = byAge.get(safeStart);
  const finalRow = rows[rows.length - 1];
  const retireBalance = atRetirement?.balance ?? 0;
  // With a %-of-balance draw the pot never hits zero, but if the rate outruns
  // growth the balance (and income) shrink over time.
  const shrinking = finalRow.balance < retireBalance;

  const startIncome = atRetirement ? incomeBreakdown(atRetirement.balance, atRetirement.withdrawal, dividendYieldPct) : null;
  const endIncome = finalRow.withdrawal > 0 ? incomeBreakdown(finalRow.balance, finalRow.withdrawal, dividendYieldPct) : null;
  const lifetimeAfterTax = useMemo(
    () => rows.reduce((s, r) => s + (r.withdrawal > 0 ? incomeBreakdown(r.balance, r.withdrawal, dividendYieldPct).afterTax : 0), 0),
    [rows, dividendYieldPct]
  );

  // Timeline rows: retirement age, then every round 5-year age, then the final age.
  const intervalAges = useMemo(() => {
    const ages = [safeStart];
    for (let a = Math.ceil((safeStart + 1) / 5) * 5; a < endAge; a += 5) ages.push(a);
    ages.push(endAge);
    return Array.from(new Set(ages)).sort((a, b) => a - b);
  }, [safeStart, endAge]);

  return (
    <Card glow className="border-[var(--green-muted)]">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <CardTitle className="!mb-0 flex items-center gap-2">
          <TrendingUp size={15} className="text-[var(--green)]" /> The 4% Rule — Living Off Your Portfolio
        </CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-[var(--green)] bg-[var(--green-muted)] px-2 py-1 rounded-full">
          {annualReturnPct.toFixed(1)}% return · {dividendYieldPct.toFixed(1)}% yield
        </span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        From age {safeStart} on, your income is a {rate}% sale of <span className="text-[var(--text-secondary)]">that year&apos;s</span> balance{" "}
        <span className="text-[var(--text-secondary)]">plus</span> the {dividendYieldPct.toFixed(1)}% dividend — net of long-term capital-gains tax on the sale and {Math.round(DIV_TAX_RATE * 100)}% on dividends.
        Because the draw recalculates off the live balance, your after-tax income {annualReturnPct > rate ? "climbs as the portfolio grows" : "tracks the portfolio"}.
      </p>

      {/* 5-year timeline table */}
      <div className="mb-5 rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="grid grid-cols-[1.1fr_1fr_1fr_1.05fr] gap-1.5 px-3 py-2 bg-[var(--surface-light)] text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
          <span>Age</span>
          <span className="text-right">Portfolio</span>
          <span className="text-right">Income/yr</span>
          <span className="text-right">After-tax/yr</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {intervalAges.map((age) => {
            const row = byAge.get(age);
            if (!row) return null;
            const isStart = age === safeStart;
            const inc = row.withdrawal > 0 ? incomeBreakdown(row.balance, row.withdrawal, dividendYieldPct) : null;
            return (
              <div
                key={age}
                className={cn(
                  "grid grid-cols-[1.1fr_1fr_1fr_1.05fr] gap-1.5 px-3 py-2 text-xs sm:text-sm items-center",
                  isStart && "bg-[var(--green-muted)]"
                )}
              >
                <span className={cn("font-semibold", isStart ? "text-[var(--green)]" : "text-white")}>
                  {age}{isStart ? " · retire" : ""}
                </span>
                <span className="text-right text-white tabular-nums">{formatCurrency(row.balance, true)}</span>
                <span className="text-right tabular-nums text-[var(--text-secondary)]">{inc ? formatCurrency(inc.preTax, true) : "—"}</span>
                <span
                  className="text-right tabular-nums font-semibold"
                  style={{ color: inc ? "var(--green)" : "var(--text-muted)" }}
                >
                  {inc ? formatCurrency(inc.afterTax, true) : "building"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trajectory chart */}
      <div className="h-72 sm:h-80 -mx-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="age" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(a) => (Number(a) % 5 === 0 ? `${a}` : "")} />
            <YAxis tickFormatter={(v) => formatCurrency(Number(v), true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} width={56} />
            <Tooltip
              cursor={{ stroke: "var(--border-light)" }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const row = payload[0].payload as DrawdownYear;
                const box: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12, padding: "9px 11px", minWidth: 190 };
                if (row.withdrawal <= 0) {
                  return (
                    <div style={box}>
                      <div style={{ color: "var(--text-secondary)" }}>Age {row.age}</div>
                      <div style={{ color: "white" }}>Portfolio: {formatCurrency(row.balance)}</div>
                      <div style={{ color: "var(--text-muted)" }}>Still contributing</div>
                    </div>
                  );
                }
                const inc = incomeBreakdown(row.balance, row.withdrawal, dividendYieldPct);
                const line = (label: string, val: string, color: string) => (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, color }}>
                    <span>{label}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{val}</span>
                  </div>
                );
                return (
                  <div style={box}>
                    <div style={{ color: "var(--text-secondary)", marginBottom: 5 }}>Age {row.age} · {formatCurrency(row.balance)}</div>
                    {line(`${rate}% withdrawal`, `+${formatCurrency(row.withdrawal)}`, "white")}
                    {line(`Dividends (${dividendYieldPct.toFixed(1)}%)`, `+${formatCurrency(inc.dividend)}`, "white")}
                    {line("Cap-gains tax", `−${formatCurrency(inc.capTax)}`, "var(--text-muted)")}
                    {line(`Dividend tax (${Math.round(DIV_TAX_RATE * 100)}%)`, `−${formatCurrency(inc.divTax)}`, "var(--text-muted)")}
                    <div style={{ borderTop: "1px solid var(--border)", margin: "5px 0" }} />
                    {line("After-tax income", `${formatCurrency(inc.afterTax)}/yr`, "var(--green)")}
                  </div>
                );
              }}
            />
            {/* Shade the drawdown years */}
            <ReferenceArea x1={safeStart} x2={endAge} fill="var(--green)" fillOpacity={0.05} />
            <ReferenceLine x={safeStart} stroke="var(--green-light)" strokeDasharray="4 3" label={{ value: "withdrawals begin", position: "insideTopRight", fill: "var(--green-light)", fontSize: 10 }} />
            <Area type="monotone" dataKey="balance" stroke="var(--green)" strokeWidth={2.5} fill="url(#drawdownGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary line — all after-tax */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 mb-5">
        <Summary label={`After-tax at ${safeStart}`} value={`${formatCurrency(startIncome?.afterTax ?? 0, true)}/yr`} accent />
        <Summary label={`After-tax at ${endAge}`} value={`${formatCurrency(endIncome?.afterTax ?? 0, true)}/yr`} accent={!shrinking} danger={shrinking} />
        <Summary label={`Balance at ${endAge}`} value={formatCurrency(finalRow.balance, true)} accent={!shrinking} danger={shrinking} />
        <Summary label="Lifetime after-tax income" value={formatCurrency(lifetimeAfterTax, true)} />
      </div>
      {shrinking && (
        <p className="text-xs text-[var(--red)] mb-4">
          ⚠ A {rate}% draw outruns the {annualReturnPct.toFixed(1)}% return, so the balance — and your yearly income — shrink over time. Lower the rate or invest for more growth.
        </p>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Slider label="Start withdrawing at age" value={startAge} onChange={setStartAge} min={currentAge + 1} max={Math.min(80, endAge - 1)} step={1} suffix=" yrs old" />
        <Slider label="Withdrawal rate (% of balance/yr)" value={rate} onChange={setRate} min={2} max={8} step={0.1} suffix="%" />
        <Slider label="Plan until age" value={endAge} onChange={setEndAge} min={Math.max(safeStart + 1, 65)} max={100} step={1} suffix=" yrs old" />
      </div>
    </Card>
  );
}

function Summary({ label, value, accent, danger }: { label: string; value: string; accent?: boolean; danger?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{label}</div>
      <div className={cn("text-sm font-bold", danger ? "text-[var(--red)]" : accent ? "text-[var(--green)]" : "text-white")}>{value}</div>
    </div>
  );
}
