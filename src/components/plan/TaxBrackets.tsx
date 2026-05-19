"use client";

import { useState, useMemo } from "react";
import { PieChart as PieIcon } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  FEDERAL_BRACKETS_SINGLE, FEDERAL_BRACKETS_MFJ, STANDARD_DEDUCTION,
  taxFromBrackets, marginalRate, effectiveRate, ficaTax, type FilingStatus,
} from "@/lib/tax";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

export function TaxBrackets() {
  const [income, setIncome] = useState(120_000);
  const [filing, setFiling] = useState<FilingStatus>("single");
  const [stateRate, setStateRate] = useState(5);

  const brackets = filing === "mfj" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  const deduction = filing === "mfj" ? STANDARD_DEDUCTION.mfj : STANDARD_DEDUCTION.single;

  const taxableIncome = Math.max(0, income - deduction);
  const fedTax = taxFromBrackets(taxableIncome, brackets);
  const marg = marginalRate(taxableIncome, brackets);
  const eff = effectiveRate(taxableIncome, brackets);
  const fica = ficaTax(income);
  const stateTax = (income - deduction) * (stateRate / 100);
  const totalTax = fedTax + fica.total + Math.max(0, stateTax);
  const takeHome = income - totalTax;

  const chartData = useMemo(() => brackets.map((b) => {
    const taxInBracket = b.min < taxableIncome
      ? Math.min(taxableIncome, b.max) - b.min
      : 0;
    return {
      bracket: `${(b.rate * 100).toFixed(0)}%`,
      bracketMin: b.min,
      filled: taxInBracket,
      cap: (b.max === Infinity ? b.min + 200_000 : b.max) - b.min,
      rate: b.rate,
    };
  }), [brackets, taxableIncome]);

  return (
    <PlanLayout
      title="Tax Bracket Visualizer"
      icon={<PieIcon size={28} />}
      subtitle="See exactly which dollar gets taxed at which rate. Effective rate ≠ marginal rate, and most people conflate them."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Take-Home</CardTitle>
          <StatValue size="xl" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(takeHome, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatCurrency(takeHome / 12)} /mo</p>
        </Card>
        <Card>
          <CardTitle>Effective Rate</CardTitle>
          <StatValue size="lg">{formatPercent(eff * 100, 1)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Federal only</p>
        </Card>
        <Card>
          <CardTitle>Marginal Rate</CardTitle>
          <StatValue size="lg" style={{ color: "var(--yellow)" }} className="!text-current">{formatPercent(marg * 100, 0)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Tax on next $</p>
        </Card>
        <Card>
          <CardTitle>Total Tax</CardTitle>
          <StatValue size="lg" style={{ color: "var(--red)" }} className="!text-current">{formatCurrency(totalTax, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Fed + FICA + State</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Tax Breakdown</CardTitle>
        <div className="space-y-2 mt-3 text-sm">
          <Row label="Gross Income" value={formatCurrency(income)} />
          <Row label={`Standard Deduction (${filing === "mfj" ? "MFJ" : "Single"})`} value={`-${formatCurrency(deduction)}`} muted />
          <Row label="Taxable Income" value={formatCurrency(taxableIncome)} bold />
          <div className="border-t border-[var(--border)] my-2" />
          <Row label="Federal Income Tax" value={`-${formatCurrency(fedTax)}`} />
          <Row label="Social Security (6.2%)" value={`-${formatCurrency(fica.socialSecurity)}`} muted />
          <Row label="Medicare (1.45%)" value={`-${formatCurrency(fica.medicare)}`} muted />
          <Row label={`State Tax (${stateRate}%)`} value={`-${formatCurrency(Math.max(0, stateTax))}`} muted />
          <div className="border-t border-[var(--border)] my-2" />
          <Row label="Total Tax" value={`-${formatCurrency(totalTax)}`} bold />
          <Row label="Take-Home" value={formatCurrency(takeHome)} positive bold />
        </div>
      </Card>

      <Card>
        <CardTitle>Income Filling Each Bracket</CardTitle>
        <p className="text-xs text-[var(--text-muted)] mb-3">Green = $ taxed at this rate. Watch the marginal jump.</p>
        <div className="h-64 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} />
              <YAxis type="category" dataKey="bracket" stroke="var(--text-muted)" fontSize={11} width={50} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Bar dataKey="filled" radius={[0, 6, 6, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.rate === marg ? "#FFD93D" : "var(--green)"} />
                ))}
              </Bar>
              <ReferenceLine x={taxableIncome} stroke="white" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Annual Gross Income" value={income} onChange={setIncome} min={10_000} max={3_000_000} step={1_000} prefix="$" />
          <Slider label="State Income Tax" value={stateRate} onChange={setStateRate} min={0} max={15} step={0.25} suffix="%" />
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 md:col-span-2">
            <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Filing Status</div>
            <div className="flex gap-2">
              {(["single", "mfj"] as const).map((f) => (
                <button key={f} onClick={() => setFiling(f)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${filing === f ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--card)] text-[var(--text-secondary)]"}`}>{f === "single" ? "Single" : "Married Filing Jointly"}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </PlanLayout>
  );
}

function Row({ label, value, positive, muted, bold }: { label: string; value: string; positive?: boolean; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}>{label}</span>
      <span className={`font-medium ${positive ? "text-[var(--green)]" : bold ? "text-white font-bold text-base" : "text-white"}`}>{value}</span>
    </div>
  );
}
