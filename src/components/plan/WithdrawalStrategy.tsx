"use client";

import { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency } from "@/lib/format";
import { simulateWithdrawalStrategy, type FilingStatus } from "@/lib/tax";
import { ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type Bucket = "taxable" | "traditional" | "roth";

export function WithdrawalStrategy() {
  const [startAge, setStartAge] = useState(60);
  const [years, setYears] = useState(30);
  const [taxable, setTaxable] = useState(500_000);
  const [trad, setTrad] = useState(800_000);
  const [roth, setRoth] = useState(300_000);
  const [spending, setSpending] = useState(80_000);
  const [growth, setGrowth] = useState(6);
  const [inflation, setInflation] = useState(3);
  const [filing, setFiling] = useState<FilingStatus>("single");
  const [order, setOrder] = useState<Bucket[]>(["taxable", "traditional", "roth"]);

  const rows = useMemo(() => simulateWithdrawalStrategy({
    startAge, yearsInRetirement: years, taxable, traditional: trad, roth,
    annualSpending: spending, growthPct: growth, inflationPct: inflation,
    filingStatus: filing, order,
  }), [startAge, years, taxable, trad, roth, spending, growth, inflation, filing, order]);

  const finalTotal = rows[rows.length - 1]?.totalRemaining ?? 0;
  const totalTax = rows.reduce((s, r) => s + r.taxOwed, 0);
  const ranOut = rows.find((r) => r.totalRemaining <= 0)?.year ?? null;

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...order];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setOrder(next);
  };

  return (
    <PlanLayout
      title="Withdrawal Strategy"
      icon={<BarChart3 size={28} />}
      subtitle="In retirement, which accounts do you tap first? Order matters — wrong order can cost you tens of thousands in lifetime tax."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Final Balance</CardTitle>
          <StatValue size="lg" style={{ color: finalTotal > 0 ? "var(--green)" : "var(--red)" }} className="!text-current">{formatCurrency(finalTotal, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{ranOut ? `Ran out at year ${ranOut}` : `Survived ${years} yrs`}</p>
        </Card>
        <Card>
          <CardTitle>Lifetime Tax</CardTitle>
          <StatValue size="lg" style={{ color: "var(--red)" }} className="!text-current">{formatCurrency(totalTax, true)}</StatValue>
        </Card>
        <Card>
          <CardTitle>Avg Annual Tax</CardTitle>
          <StatValue size="lg">{formatCurrency(totalTax / rows.length, true)}</StatValue>
        </Card>
        <Card>
          <CardTitle>Total Starting Assets</CardTitle>
          <StatValue size="lg">{formatCurrency(taxable + trad + roth, true)}</StatValue>
        </Card>
      </div>

      <Card>
        <CardTitle>Account Drawdown</CardTitle>
        <div className="h-72 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} stackOffset="none">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="age" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Age ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area stackId="1" type="monotone" dataKey="endingTaxable" name="Taxable" fill="#7BC8FF" stroke="#7BC8FF" />
              <Area stackId="1" type="monotone" dataKey="endingTraditional" name="Traditional" fill="#FFD93D" stroke="#FFD93D" />
              <Area stackId="1" type="monotone" dataKey="endingRoth" name="Roth" fill="var(--green)" stroke="var(--green)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Withdrawal Order</CardTitle>
        <p className="text-xs text-[var(--text-muted)] mb-3">Click ▲ to move a bucket higher in priority.</p>
        <div className="space-y-2">
          {order.map((b, idx) => (
            <div key={b} className="flex items-center gap-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-3">
              <div className="rounded-full bg-[var(--green-muted)] w-7 h-7 flex items-center justify-center text-[var(--green)] font-bold text-sm">{idx + 1}</div>
              <div className="flex-1 capitalize text-white font-semibold">{b}</div>
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-[var(--text-secondary)] hover:text-[var(--green)] disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1 rounded-lg hover:bg-[var(--card)]">▲</button>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Account Balances</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Taxable Brokerage" value={taxable} onChange={setTaxable} min={0} max={20_000_000} step={10_000} prefix="$" />
            <Slider label="Traditional 401k/IRA" value={trad} onChange={setTrad} min={0} max={20_000_000} step={10_000} prefix="$" />
            <Slider label="Roth 401k/IRA" value={roth} onChange={setRoth} min={0} max={20_000_000} step={10_000} prefix="$" />
          </div>
        </Card>
        <Card>
          <CardTitle>Plan</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Start Age" value={startAge} onChange={setStartAge} min={40} max={75} step={1} suffix=" yrs" />
            <Slider label="Years in Retirement" value={years} onChange={setYears} min={5} max={50} step={1} suffix=" yrs" />
            <Slider label="Annual Spending (today's $)" value={spending} onChange={setSpending} min={20_000} max={500_000} step={1_000} prefix="$" />
            <Slider label="Growth" value={growth} onChange={setGrowth} min={0} max={12} step={0.25} suffix="%" />
            <Slider label="Inflation" value={inflation} onChange={setInflation} min={0} max={10} step={0.25} suffix="%" />
            <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
              <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Filing Status</div>
              <div className="flex gap-2">
                {(["single", "mfj"] as const).map((f) => (
                  <button key={f} onClick={() => setFiling(f)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${filing === f ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--card)] text-[var(--text-secondary)]"}`}>{f === "single" ? "Single" : "MFJ"}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed">
        <span className="text-white font-semibold">Conventional wisdom:</span> taxable → traditional → Roth lets Roth grow longest tax-free. But if you have a low-income year, doing Roth conversions or even harvesting capital gains in the 0% bracket can dramatically reduce lifetime tax. Try different orders above.
      </div>
    </PlanLayout>
  );
}
