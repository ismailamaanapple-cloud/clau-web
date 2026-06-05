"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { projectDrawdown } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceArea,
} from "recharts";

const MILESTONE_AGES = [60, 70, 80, 90];

/**
 * The 4% rule, visualized: accumulate until a chosen age, then live off a fixed
 * withdrawal that rises with inflation — while the balance keeps compounding.
 * Shared by the Custom and Premade portfolio tabs.
 */
export function DrawdownProjection({
  annualReturnPct,
  initial,
  monthly,
  currentAge,
  defaultStartAge,
}: {
  annualReturnPct: number;
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
  const [inflation, setInflation] = useState(3);

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
        inflationPct: inflation,
      }),
    [initial, currentAge, monthly, safeStart, endAge, annualReturnPct, rate, inflation]
  );

  const byAge = useMemo(() => new Map(rows.map((r) => [r.age, r])), [rows]);
  const atRetirement = byAge.get(safeStart);
  const firstWithdrawalRow = rows.find((r) => r.phase === "withdraw");
  const firstWithdrawal = firstWithdrawalRow?.withdrawal ?? 0;
  const finalRow = rows[rows.length - 1];
  const depleted = finalRow.balance <= 0;

  // Snapshot cards: retirement age + each requested decade still in range + the final age.
  const milestoneAges = useMemo(() => {
    const ages = [safeStart, ...MILESTONE_AGES.filter((a) => a > safeStart && a < endAge), endAge];
    return Array.from(new Set(ages)).sort((a, b) => a - b);
  }, [safeStart, endAge]);

  return (
    <Card glow className="border-[var(--green-muted)]">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <CardTitle className="!mb-0 flex items-center gap-2">
          <TrendingUp size={15} className="text-[var(--green)]" /> The 4% Rule — Living Off Your Portfolio
        </CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-[var(--green)] bg-[var(--green-muted)] px-2 py-1 rounded-full">
          {annualReturnPct.toFixed(1)}% return · {rate}% drawdown
        </span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Start pulling {rate}% at age {safeStart}, then raise it {inflation}% a year for inflation. Because the {annualReturnPct.toFixed(1)}% return{" "}
        {annualReturnPct > rate ? "outpaces" : "trails"} what you withdraw, watch the balance keep {annualReturnPct > rate ? "growing" : "moving"} as you live off it.
      </p>

      {/* Milestone snapshots */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
        {milestoneAges.map((age) => {
          const row = byAge.get(age);
          if (!row) return null;
          const isStart = age === safeStart;
          return (
            <div
              key={age}
              className={cn(
                "rounded-xl px-3 py-2.5 border",
                isStart ? "bg-[var(--green-muted)] border-[var(--green-muted)]" : "bg-[var(--surface-light)] border-[var(--border)]"
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                Age {age}{isStart ? " · retire" : ""}
              </div>
              <div className={cn("text-base font-bold", isStart ? "text-[var(--green)]" : "text-white")}>
                {formatCurrency(row.balance, true)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {row.withdrawal > 0 ? `${formatCurrency(row.withdrawal, true)}/yr drawn` : "still building"}
              </div>
            </div>
          );
        })}
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
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }}
              labelFormatter={(a) => `Age ${a}`}
              formatter={(v, name) => [formatCurrency(Number(v)), name === "balance" ? "Balance" : name]}
            />
            {/* Shade the drawdown years */}
            <ReferenceArea x1={safeStart} x2={endAge} fill="var(--green)" fillOpacity={0.05} />
            <ReferenceLine x={safeStart} stroke="var(--green-light)" strokeDasharray="4 3" label={{ value: "withdrawals begin", position: "insideTopRight", fill: "var(--green-light)", fontSize: 10 }} />
            <Area type="monotone" dataKey="balance" stroke="var(--green)" strokeWidth={2.5} fill="url(#drawdownGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary line */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 mb-5">
        <Summary label={`Balance at ${safeStart}`} value={formatCurrency(atRetirement?.balance ?? 0, true)} />
        <Summary label="First-year income" value={`${formatCurrency(firstWithdrawal, true)}/yr`} />
        <Summary label={`Balance at ${endAge}`} value={formatCurrency(finalRow.balance, true)} accent={!depleted} danger={depleted} />
        <Summary label="Total withdrawn" value={formatCurrency(finalRow.cumulativeWithdrawn, true)} />
      </div>
      {depleted && (
        <p className="text-xs text-[var(--red)] mb-4">
          ⚠ At {rate}% drawdown with a {annualReturnPct.toFixed(1)}% return, the balance runs dry before age {endAge}. Lower the rate or retire later.
        </p>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Slider label="Start withdrawing at age" value={startAge} onChange={setStartAge} min={currentAge + 1} max={Math.min(80, endAge - 1)} step={1} suffix=" yrs old" />
        <Slider label="Annual withdrawal rate" value={rate} onChange={setRate} min={2} max={8} step={0.1} suffix="%" />
        <Slider label="Plan until age" value={endAge} onChange={setEndAge} min={Math.max(safeStart + 1, 65)} max={100} step={1} suffix=" yrs old" />
        <Slider label="Inflation (raises withdrawal)" value={inflation} onChange={setInflation} min={0} max={6} step={0.1} suffix="% /yr" />
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
