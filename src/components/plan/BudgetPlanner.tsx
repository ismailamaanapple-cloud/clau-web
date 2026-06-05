"use client";

import { useState, useMemo } from "react";
import {
  Wallet, PiggyBank, Home, Zap, ShoppingCart, Car, PartyPopper, Plane, HeartPulse, Baby, CreditCard, Repeat, MoreHorizontal, RotateCcw,
} from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency } from "@/lib/format";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Category = {
  key: string;
  label: string;
  icon: typeof Home;
  color: string;
  pct: number; // share of take-home income, in %
};

// Defaults loosely follow a 50/30/20 framework. Savings is its own slice;
// the rest sum with savings to 100% of take-home pay.
const DEFAULT_SAVINGS_PCT = 20;
const DEFAULTS: Category[] = [
  { key: "housing", label: "Mortgage / Rent", icon: Home, color: "var(--green)", pct: 25 },
  { key: "groceries", label: "Groceries", icon: ShoppingCart, color: "var(--green-light)", pct: 9 },
  { key: "utilities", label: "Utilities", icon: Zap, color: "var(--yellow)", pct: 6 },
  { key: "transport", label: "Transportation", icon: Car, color: "var(--blue)", pct: 8 },
  { key: "debt", label: "Debt Payments", icon: CreditCard, color: "var(--red)", pct: 5 },
  { key: "childcare", label: "Childcare", icon: Baby, color: "#FF6FB5", pct: 5 },
  { key: "fun", label: "Fun & Dining", icon: PartyPopper, color: "var(--purple)", pct: 8 },
  { key: "travel", label: "Travel", icon: Plane, color: "var(--orange)", pct: 4 },
  { key: "subscriptions", label: "Subscriptions", icon: Repeat, color: "#2DD4BF", pct: 3 },
  { key: "health", label: "Healthcare", icon: HeartPulse, color: "#F472B6", pct: 4 },
  { key: "misc", label: "Everything Else", icon: MoreHorizontal, color: "var(--text-muted)", pct: 3 },
];

const clone = (cats: Category[]) => cats.map((c) => ({ ...c }));

export function BudgetPlanner() {
  const [income, setIncome] = useState(6000); // stored as MONTHLY take-home
  const [savingsPct, setSavingsPct] = useState(DEFAULT_SAVINGS_PCT);
  const [cats, setCats] = useState<Category[]>(clone(DEFAULTS));
  const [annual, setAnnual] = useState(false);

  const mult = annual ? 12 : 1;
  const per = annual ? "/yr" : "/mo";
  const incomeLabel = annual ? "Annual Take-Home" : "Monthly Take-Home";

  const setCatPct = (key: string, pct: number) =>
    setCats((prev) => prev.map((c) => (c.key === key ? { ...c, pct } : c)));

  const reset = () => {
    setSavingsPct(DEFAULT_SAVINGS_PCT);
    setCats(clone(DEFAULTS));
  };

  const spendPct = useMemo(() => cats.reduce((s, c) => s + c.pct, 0), [cats]);
  const allocatedPct = savingsPct + spendPct;
  const leftoverPct = 100 - allocatedPct;

  // All amounts below are in the displayed period (monthly or annual).
  const periodIncome = income * mult;
  const savingsAmt = (periodIncome * savingsPct) / 100;
  const spendAmt = (periodIncome * spendPct) / 100;
  const leftoverAmt = (periodIncome * leftoverPct) / 100;

  const pieData = useMemo(() => {
    const data = [
      { name: "Savings", value: (periodIncome * savingsPct) / 100, color: "var(--green-dark)" },
      ...cats.map((c) => ({ name: c.label, value: (periodIncome * c.pct) / 100, color: c.color })),
    ];
    if (leftoverPct > 0.01) data.push({ name: "Unallocated", value: (periodIncome * leftoverPct) / 100, color: "var(--border-light)" });
    return data.filter((d) => d.value > 0);
  }, [cats, periodIncome, savingsPct, leftoverPct]);

  const overBudget = leftoverPct < -0.01;

  return (
    <PlanLayout
      title="Budget Planner"
      icon={<Wallet size={28} />}
      subtitle="Set your take-home pay and savings target — see exactly what's left for the mortgage, groceries, fun, travel, and everything in between."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Monthly / Annual segmented control */}
        <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface-light)] p-1">
          {([["Monthly", false], ["Annual", true]] as const).map(([label, val]) => (
            <button
              key={label}
              type="button"
              onClick={() => setAnnual(val)}
              className={
                "px-4 py-1.5 text-sm font-semibold rounded-lg transition " +
                (annual === val ? "bg-[var(--green)] text-black" : "text-[var(--text-secondary)] hover:text-white")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--green)] transition"
        >
          <RotateCcw size={14} /> Reset to 50/30/20
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card glow className="col-span-2 md:col-span-1 bg-gradient-radial-green">
          <CardTitle>{incomeLabel}</CardTitle>
          <StatValue size="lg">{formatCurrency(periodIncome)}</StatValue>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-1.5"><PiggyBank size={13} /> Saving</CardTitle>
          <StatValue size="md" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(savingsAmt)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{savingsPct}% of income</p>
        </Card>
        <Card>
          <CardTitle>To Spend</CardTitle>
          <StatValue size="md">{formatCurrency(spendAmt)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{spendPct.toFixed(0)}% across {cats.length} buckets</p>
        </Card>
        <Card>
          <CardTitle>{overBudget ? "Over Budget" : "Unallocated"}</CardTitle>
          <StatValue size="md" style={{ color: overBudget ? "var(--red)" : leftoverPct > 0.01 ? "var(--yellow)" : "var(--green)" }} className="!text-current">
            {formatCurrency(Math.abs(leftoverAmt))}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {overBudget ? "Trim a bucket to balance" : leftoverPct > 0.01 ? "Still up for grabs" : "Every dollar has a job"}
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>Where Your Money Goes</CardTitle>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={1.5} strokeWidth={0} isAnimationActive={false}>
                {pieData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v, n) => [`${formatCurrency(Number(v))} ${per}`, n]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Income & Savings</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider
            label={`${annual ? "Annual" : "Monthly"} take-home pay`}
            value={periodIncome}
            onChange={(v) => setIncome(v / mult)}
            min={500 * mult}
            max={50_000 * mult}
            step={100 * mult}
            prefix="$"
          />
          <Slider label="Save first" value={savingsPct} onChange={setSavingsPct} min={0} max={80} step={1} suffix="% of income" />
        </div>
      </Card>

      <Card>
        <CardTitle>Spending Buckets</CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
          Each bucket is a share of your take-home pay. Adjust until {overBudget ? <span className="text-[var(--red)]">you&apos;re back under 100%</span> : "it feels right"}.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cats.map((c) => {
            const Icon = c.icon;
            const amt = (periodIncome * c.pct) / 100;
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "var(--surface-light)", color: c.color }}>
                      <Icon size={14} />
                    </span>
                    {c.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: c.color }}>{formatCurrency(amt)}{per}</span>
                </div>
                <Slider label={`${c.pct}% of income`} value={c.pct} onChange={(n) => setCatPct(c.key, n)} min={0} max={60} step={1} suffix="%" />
              </div>
            );
          })}
        </div>
      </Card>
    </PlanLayout>
  );
}
