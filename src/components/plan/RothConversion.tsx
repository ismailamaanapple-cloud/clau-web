"use client";

import { useState, useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency, formatPercent } from "@/lib/format";
import { simulateRothConversionLadder, type FilingStatus } from "@/lib/tax";
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export function RothConversion() {
  const [startAge, setStartAge] = useState(35);
  const [retireAge, setRetireAge] = useState(50);
  const [endAge, setEndAge] = useState(75);
  const [traditional, setTraditional] = useState(800_000);
  const [annualConv, setAnnualConv] = useState(50_000);
  const [growth, setGrowth] = useState(6);
  const [otherIncome, setOtherIncome] = useState(0);
  const [filing, setFiling] = useState<FilingStatus>("single");

  const rows = useMemo(() => simulateRothConversionLadder({
    startAge, retireAge, endAge, traditionalBalance: traditional,
    annualConversion: annualConv, growthPct: growth, otherIncomeInRetirement: otherIncome, filingStatus: filing,
  }), [startAge, retireAge, endAge, traditional, annualConv, growth, otherIncome, filing]);

  const totalConverted = rows.reduce((s, r) => s + r.conversionAmount, 0);
  const totalTax = rows.reduce((s, r) => s + r.taxOwed, 0);
  const avgRate = totalConverted > 0 ? totalTax / totalConverted : 0;
  const finalTrad = rows[rows.length - 1]?.remainingTraditional ?? traditional;

  return (
    <PlanLayout
      title="Roth Conversion Ladder"
      icon={<ArrowRightLeft size={28} />}
      subtitle="The classic early-retirement trick. Move pre-tax money into Roth in low-income years, wait 5 years, then access it penalty-free before 59½."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Total Converted</CardTitle>
          <StatValue size="lg" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(totalConverted, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Over {rows.length} years</p>
        </Card>
        <Card>
          <CardTitle>Total Tax Paid</CardTitle>
          <StatValue size="lg" style={{ color: "var(--red)" }} className="!text-current">{formatCurrency(totalTax, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatPercent(avgRate * 100, 1)} avg rate</p>
        </Card>
        <Card>
          <CardTitle>Remaining Traditional</CardTitle>
          <StatValue size="lg">{formatCurrency(finalTrad, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">At end of plan</p>
        </Card>
        <Card>
          <CardTitle>Roth Accessible Now</CardTitle>
          <StatValue size="lg">{formatCurrency(rows[rows.length - 1]?.rothPrincipalAvailable ?? 0, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Past 5-yr wait</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Ladder Over Time</CardTitle>
        <div className="h-72 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="age" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}`} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Age ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="remainingTraditional" name="Traditional balance" fill="#7BC8FF" fillOpacity={0.25} stroke="#7BC8FF" strokeWidth={2} />
              <Area type="monotone" dataKey="rothPrincipalAvailable" name="Roth accessible (5+ yrs old)" fill="var(--green)" fillOpacity={0.3} stroke="var(--green)" strokeWidth={2} />
              <Line type="monotone" dataKey="conversionAmount" name="Annual conversion" stroke="#FFD93D" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Year-by-Year</CardTitle>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-[var(--text-muted)] text-xs uppercase tracking-widest">
                <th className="text-left px-2 py-2">Age</th>
                <th className="text-right px-2 py-2">Convert</th>
                <th className="text-right px-2 py-2">Tax Owed</th>
                <th className="text-right px-2 py-2">Marg. Rate</th>
                <th className="text-right px-2 py-2">Remaining Trad</th>
                <th className="text-right px-2 py-2">Roth Accessible</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 25).map((r) => (
                <tr key={r.age} className="border-t border-[var(--border)]">
                  <td className="px-2 py-2 text-white font-semibold">{r.age}</td>
                  <td className="px-2 py-2 text-right text-white">{formatCurrency(r.conversionAmount, true)}</td>
                  <td className="px-2 py-2 text-right text-[var(--red)]">{formatCurrency(r.taxOwed, true)}</td>
                  <td className="px-2 py-2 text-right text-[var(--yellow)]">{formatPercent(r.marginalRateAtConversion * 100, 0)}</td>
                  <td className="px-2 py-2 text-right text-[var(--text-secondary)]">{formatCurrency(r.remainingTraditional, true)}</td>
                  <td className="px-2 py-2 text-right text-[var(--green)] font-semibold">{formatCurrency(r.rothPrincipalAvailable, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Current Age" value={startAge} onChange={setStartAge} min={20} max={70} step={1} suffix=" yrs" />
          <Slider label="Retire / Start Converting At" value={retireAge} onChange={setRetireAge} min={startAge} max={75} step={1} suffix=" yrs" />
          <Slider label="End Age" value={endAge} onChange={setEndAge} min={retireAge + 1} max={95} step={1} suffix=" yrs" />
          <Slider label="Traditional Balance" value={traditional} onChange={setTraditional} min={50_000} max={20_000_000} step={10_000} prefix="$" />
          <Slider label="Annual Conversion" value={annualConv} onChange={setAnnualConv} min={5_000} max={500_000} step={1_000} prefix="$" />
          <Slider label="Growth Rate" value={growth} onChange={setGrowth} min={0} max={15} step={0.25} suffix="%" />
          <Slider label="Other Retirement Income" value={otherIncome} onChange={setOtherIncome} min={0} max={500_000} step={1_000} prefix="$" />
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

      <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed">
        <span className="text-white font-semibold">How the ladder works:</span> Each year you convert a chunk of traditional → Roth and pay ordinary income tax on it. After 5 years, that converted amount can be withdrawn tax & penalty-free, even before 59½. By stacking conversions yearly, you build a perpetual pipeline of tax-free income.
      </div>
    </PlanLayout>
  );
}
