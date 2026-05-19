"use client";

import { useState, useMemo } from "react";
import { Banknote } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency, formatPercent } from "@/lib/format";
import { buildTBillLadder } from "@/lib/fireMath";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

// Approximate current Treasury yield curve (illustrative — not live data)
function defaultYieldCurve(months: number): number {
  // Rough yield curve as of 2024–25
  if (months <= 3) return 5.3;
  if (months <= 6) return 5.1;
  if (months <= 12) return 4.7;
  if (months <= 24) return 4.4;
  if (months <= 36) return 4.3;
  if (months <= 60) return 4.2;
  return 4.5;
}

export function BondLadder() {
  const [totalCash, setTotalCash] = useState(100_000);
  const [rungs, setRungs] = useState(4);
  const [shortest, setShortest] = useState(3);
  const [longest, setLongest] = useState(60);
  const [yieldAdj, setYieldAdj] = useState(0);

  const apyByTerm = (m: number) => Math.max(0, defaultYieldCurve(m) + yieldAdj);

  const result = useMemo(() => buildTBillLadder({
    totalCash, rungs, shortestTerm: shortest, longestTerm: longest, apyByTerm,
  }), [totalCash, rungs, shortest, longest, yieldAdj]); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = result.ladder.map((r) => ({
    name: `${r.termYears < 1 ? `${Math.round(r.termYears * 12)}m` : `${r.termYears.toFixed(1)}y`}`,
    income: r.annualIncome,
    apy: r.apyPct,
  }));

  return (
    <PlanLayout
      title="Bond / T-Bill Ladder"
      icon={<Banknote size={28} />}
      subtitle="Spread cash across multiple maturities to lock in yields while keeping near-term liquidity. Especially useful when short-term rates are high."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Annual Income</CardTitle>
          <StatValue size="xl" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(result.totalAnnualIncome)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatCurrency(result.totalAnnualIncome / 12)}/mo</p>
        </Card>
        <Card>
          <CardTitle>Effective APY</CardTitle>
          <StatValue size="lg">{formatPercent(result.effectiveAPY, 2)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Weighted across all rungs</p>
        </Card>
        <Card>
          <CardTitle>Per-Rung Amount</CardTitle>
          <StatValue size="lg">{formatCurrency(totalCash / rungs, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{rungs} equal rungs</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Income Per Rung</CardTitle>
        <div className="h-56 sm:h-64 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="income" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="var(--green)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Ladder Breakdown</CardTitle>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-[var(--text-muted)] text-xs uppercase tracking-widest">
                <th className="text-left px-2 py-2">Rung</th>
                <th className="text-right px-2 py-2">Term</th>
                <th className="text-right px-2 py-2">Face Value</th>
                <th className="text-right px-2 py-2">APY</th>
                <th className="text-right px-2 py-2">Annual Income</th>
              </tr>
            </thead>
            <tbody>
              {result.ladder.map((r) => (
                <tr key={r.rung} className="border-t border-[var(--border)]">
                  <td className="px-2 py-2 text-white font-semibold">#{r.rung}</td>
                  <td className="px-2 py-2 text-right text-[var(--text-secondary)]">{r.termYears < 1 ? `${Math.round(r.termYears * 12)} mo` : `${r.termYears.toFixed(1)} yr`}</td>
                  <td className="px-2 py-2 text-right text-white">{formatCurrency(r.faceValue, true)}</td>
                  <td className="px-2 py-2 text-right text-[var(--green)] font-semibold">{formatPercent(r.apyPct, 2)}</td>
                  <td className="px-2 py-2 text-right text-white font-semibold">{formatCurrency(r.annualIncome)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Total Cash" value={totalCash} onChange={setTotalCash} min={1_000} max={10_000_000} step={1_000} prefix="$" />
          <Slider label="Number of Rungs" value={rungs} onChange={setRungs} min={2} max={10} step={1} />
          <Slider label="Shortest Term" value={shortest} onChange={setShortest} min={1} max={24} step={1} suffix=" mo" />
          <Slider label="Longest Term" value={longest} onChange={setLongest} min={shortest + 1} max={120} step={1} suffix=" mo" />
          <Slider label="Yield Adjustment" value={yieldAdj} onChange={setYieldAdj} min={-3} max={3} step={0.1} suffix="%" />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Yields are illustrative. For live rates check TreasuryDirect or your broker. Use the adjustment slider to model higher/lower rate environments.
        </p>
      </Card>
    </PlanLayout>
  );
}
