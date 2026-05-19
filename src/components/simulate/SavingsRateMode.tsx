"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { savingsRateCurve, yearsToFire } from "@/lib/fireMath";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot, ReferenceLine,
} from "recharts";

export function SavingsRateMode() {
  const [savingsRate, setSavingsRate] = useState(25);
  const [realReturn, setRealReturn] = useState(5);
  const [swr, setSwr] = useState(4);
  const [income, setIncome] = useState(100_000);

  const yourYears = useMemo(() => yearsToFire(savingsRate, realReturn, swr), [savingsRate, realReturn, swr]);
  const curve = useMemo(
    () => savingsRateCurve({ realReturnPct: realReturn, withdrawalRatePct: swr }),
    [realReturn, swr]
  );

  const monthlySaved = (income * savingsRate / 100) / 12;
  const monthlySpent = (income * (1 - savingsRate / 100)) / 12;

  // Friendly badge based on years
  const badge =
    yourYears < 10 ? { label: "FIRE Express 🚀", color: "var(--green)" } :
    yourYears < 20 ? { label: "On Track ✓", color: "var(--green)" } :
    yourYears < 30 ? { label: "Standard Path", color: "var(--yellow)" } :
    { label: "Long Road", color: "var(--red)" };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Years to FIRE</CardTitle>
          <StatValue size="xl">{isFinite(yourYears) ? yourYears.toFixed(1) : "∞"}</StatValue>
          <p className="text-xs mt-2 font-semibold" style={{ color: badge.color }}>{badge.label}</p>
        </Card>
        <Card>
          <CardTitle>Saving Per Month</CardTitle>
          <StatValue size="lg" style={{ color: "var(--green)" }} className="!text-current">
            ${monthlySaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">Goes to investments.</p>
        </Card>
        <Card>
          <CardTitle>Spending Per Month</CardTitle>
          <StatValue size="lg">${monthlySpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">Sets your nest-egg target via 4% rule.</p>
        </Card>
      </div>

      <Card>
        <CardTitle>The Savings Rate Curve</CardTitle>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          One of the most powerful charts in personal finance. Your savings rate (not your salary) is what determines how fast you reach financial independence. Yellow dot = you.
        </p>
        <div className="h-72 sm:h-96 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="savingsRate" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}%`} label={{ value: "Savings Rate", position: "insideBottom", offset: -5, fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}yr`} width={50} domain={[0, 60]} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => `${Number(v).toFixed(1)} years`}
                labelFormatter={(l) => `${l}% savings`}
              />
              <Line type="monotone" dataKey="years" stroke="var(--green)" strokeWidth={2.5} dot={false} />
              {isFinite(yourYears) && (
                <ReferenceDot x={Math.round(savingsRate / 5) * 5} y={yourYears} r={7} fill="#FFB020" stroke="white" strokeWidth={2} />
              )}
              <ReferenceLine x={50} stroke="var(--text-muted)" strokeDasharray="2 2" label={{ value: "50% saved → ~17 yrs", fill: "var(--text-muted)", fontSize: 10, position: "top" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Annual Income" value={income} onChange={setIncome} min={20_000} max={2_000_000} step={1_000} prefix="$" />
          <Slider label="Savings Rate" value={savingsRate} onChange={setSavingsRate} min={1} max={95} step={1} suffix="%" />
          <Slider label="Real Return (after inflation)" value={realReturn} onChange={setRealReturn} min={1} max={12} step={0.25} suffix="%" />
          <Slider label="Safe Withdrawal Rate" value={swr} onChange={setSwr} min={2} max={6} step={0.1} suffix="%" />
        </div>
      </Card>

      <Card>
        <CardTitle>Quick Reference</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {[10, 25, 50, 75].map((rate) => {
            const y = yearsToFire(rate, realReturn, swr);
            return (
              <div key={rate} className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-3 text-center">
                <div className="text-xs uppercase tracking-widest text-[var(--text-muted)]">{rate}% saved</div>
                <div className="text-xl font-bold text-white mt-1">{isFinite(y) ? `${y.toFixed(0)}y` : "∞"}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
