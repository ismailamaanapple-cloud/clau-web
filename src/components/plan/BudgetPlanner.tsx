"use client";

import { useState, useMemo } from "react";
import {
  Wallet, PiggyBank, Home, Zap, ShoppingCart, Car, PartyPopper, Plane, HeartPulse, Baby, CreditCard, Repeat, MoreHorizontal, RotateCcw,
} from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency, formatPercent } from "@/lib/format";
import { computeNetIncome, type FilingStatus } from "@/lib/tax";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Category = {
  key: string;
  label: string;
  icon: typeof Home;
  color: string;
  pct: number; // share of take-home (post-tax) income, in %
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
  const [grossAnnual, setGrossAnnual] = useState(150_000); // pre-tax annual salary
  const [filing, setFiling] = useState<FilingStatus>("single");
  const [stateRate, setStateRate] = useState(5);
  const [savingsPct, setSavingsPct] = useState(DEFAULT_SAVINGS_PCT);
  const [cats, setCats] = useState<Category[]>(clone(DEFAULTS));
  const [annual, setAnnual] = useState(false);

  // Taxes turn gross pay into the post-tax dollars the whole budget is built on.
  const tax = useMemo(
    () => computeNetIncome({ grossAnnual, filingStatus: filing, stateRatePct: stateRate }),
    [grossAnnual, filing, stateRate]
  );

  const divisor = annual ? 1 : 12; // annual figures shown per-period
  const per = annual ? "/yr" : "/mo";
  const disp = (annualValue: number) => annualValue / divisor;
  const netLabel = annual ? "Annual Take-Home" : "Monthly Take-Home";

  const setCatPct = (key: string, pct: number) =>
    setCats((prev) => prev.map((c) => (c.key === key ? { ...c, pct } : c)));

  const reset = () => {
    setSavingsPct(DEFAULT_SAVINGS_PCT);
    setCats(clone(DEFAULTS));
  };

  const spendPct = useMemo(() => cats.reduce((s, c) => s + c.pct, 0), [cats]);
  const leftoverPct = 100 - (savingsPct + spendPct);

  // All allocation amounts are shares of NET (post-tax) take-home.
  const net = tax.net;
  const savingsAmt = (net * savingsPct) / 100;
  const spendAmt = (net * spendPct) / 100;
  const leftoverAmt = (net * leftoverPct) / 100;

  const pieData = useMemo(() => {
    const data = [
      { name: "Savings", value: (net * savingsPct) / 100, color: "var(--green-dark)" },
      ...cats.map((c) => ({ name: c.label, value: (net * c.pct) / 100, color: c.color })),
    ];
    if (leftoverPct > 0.01) data.push({ name: "Unallocated", value: (net * leftoverPct) / 100, color: "var(--border-light)" });
    return data.filter((d) => d.value > 0);
  }, [cats, net, savingsPct, leftoverPct]);

  const overBudget = leftoverPct < -0.01;

  return (
    <PlanLayout
      title="Budget Planner"
      icon={<Wallet size={28} />}
      subtitle="Enter your gross pay — we subtract federal, FICA, and state tax, then show exactly what's left after savings for the mortgage, groceries, fun, travel, and everything in between."
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
          <CardTitle>{netLabel}</CardTitle>
          <StatValue size="lg">{formatCurrency(disp(net))}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">after {formatPercent(tax.effectiveRate * 100, 1)} in taxes</p>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-1.5"><PiggyBank size={13} /> Saving</CardTitle>
          <StatValue size="md" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(disp(savingsAmt))}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{savingsPct}% of take-home</p>
        </Card>
        <Card>
          <CardTitle>To Spend</CardTitle>
          <StatValue size="md">{formatCurrency(disp(spendAmt))}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{spendPct.toFixed(0)}% across {cats.length} buckets</p>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardTitle>{overBudget ? "Over Budget" : "Unallocated"}</CardTitle>
          <StatValue size="md" style={{ color: overBudget ? "var(--red)" : leftoverPct > 0.01 ? "var(--yellow)" : "var(--green)" }} className="!text-current">
            {formatCurrency(disp(Math.abs(leftoverAmt)))}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {overBudget ? "Trim a bucket to balance" : leftoverPct > 0.01 ? "Still up for grabs" : "Every dollar has a job"}
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>Where Your Money Goes</CardTitle>
        <div className="relative h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="58%" outerRadius="88%" paddingAngle={1.5} strokeWidth={0} isAnimationActive={false}>
                {pieData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v, n) => [`${formatCurrency(disp(Number(v)))} ${per}`, n]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label fills the donut hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Take-home</span>
            <span className="text-lg sm:text-2xl font-bold text-white tracking-tight">{formatCurrency(disp(net), true)}</span>
            <span className="text-[10px] text-[var(--text-muted)]">{per === "/yr" ? "per year" : "per month"}</span>
          </div>
        </div>
        {/* Custom legend — wraps below the chart instead of overlapping it */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
          {pieData.map((d) => (
            <span key={d.name} className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
              {d.name}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Income &amp; Taxes</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Annual gross income" value={grossAnnual} onChange={setGrossAnnual} min={20_000} max={3_000_000} step={1_000} prefix="$" />
          <Slider label="State income tax" value={stateRate} onChange={setStateRate} min={0} max={15} step={0.25} suffix="%" />
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 md:col-span-2">
            <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Filing status</div>
            <div className="flex gap-2">
              {(["single", "mfj"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiling(f)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${filing === f ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--card)] text-[var(--text-secondary)]"}`}
                >
                  {f === "single" ? "Single" : "Married Filing Jointly"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <Row label="Gross income" value={`${formatCurrency(disp(tax.gross))}${per}`} bold />
          <Row label="Federal income tax" value={`−${formatCurrency(disp(tax.federal))}${per}`} muted />
          <Row label="Social Security (6.2%)" value={`−${formatCurrency(disp(tax.socialSecurity))}${per}`} muted />
          <Row label="Medicare (1.45%)" value={`−${formatCurrency(disp(tax.medicare))}${per}`} muted />
          <Row label={`State tax (${stateRate}%)`} value={`−${formatCurrency(disp(tax.state))}${per}`} muted />
          <div className="border-t border-[var(--border)] my-1" />
          <Row label={`Total tax (${formatPercent(tax.effectiveRate * 100, 1)} effective)`} value={`−${formatCurrency(disp(tax.totalTax))}${per}`} />
          <Row label="Net take-home" value={`${formatCurrency(disp(tax.net))}${per}`} positive bold />
        </div>
      </Card>

      <Card>
        <CardTitle>Savings &amp; Spending Buckets</CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
          Each is a share of your <span className="text-white">post-tax</span> take-home. Adjust until {overBudget ? <span className="text-[var(--red)]">you&apos;re back under 100%</span> : "it feels right"}.
        </p>

        {/* Savings highlighted first */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "var(--green-muted)", color: "var(--green)" }}>
                <PiggyBank size={14} />
              </span>
              Save first
            </span>
            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--green)" }}>{formatCurrency(disp(savingsAmt))}{per}</span>
          </div>
          <Slider label={`${savingsPct}% of take-home`} value={savingsPct} onChange={setSavingsPct} min={0} max={80} step={1} suffix="%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cats.map((c) => {
            const Icon = c.icon;
            const amt = (net * c.pct) / 100;
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "var(--surface-light)", color: c.color }}>
                      <Icon size={14} />
                    </span>
                    {c.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: c.color }}>{formatCurrency(disp(amt))}{per}</span>
                </div>
                <Slider label={`${c.pct}% of take-home`} value={c.pct} onChange={(n) => setCatPct(c.key, n)} min={0} max={60} step={1} suffix="%" />
              </div>
            );
          })}
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
