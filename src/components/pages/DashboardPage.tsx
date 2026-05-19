"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { useUser } from "@/lib/UserContext";
import { projectGrowth } from "@/lib/finance";
import { formatCurrency, formatPercent, capitalGainsTaxRate } from "@/lib/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Sparkles, TrendingUp, Target, DollarSign, Calendar, Percent } from "lucide-react";

export function DashboardPage() {
  const { profile, updateProfile } = useUser();
  const router = useRouter();

  const age = profile.age ?? 30;
  const retirementAge = profile.retirementAge ?? 60;
  const yearsToRetire = Math.max(1, retirementAge - age);

  const initial = profile.initialInvestment ?? 10_000;
  const monthly = profile.monthlyContribution ?? 1_500;
  const fireTarget = profile.fireTarget ?? 2_000_000;
  const annualReturn = profile.annualReturn ?? 8;

  const points = useMemo(
    () => projectGrowth(initial, monthly, yearsToRetire, annualReturn),
    [initial, monthly, yearsToRetire, annualReturn]
  );

  const projectedNetWorth = points[points.length - 1]?.total ?? 0;
  const totalContributed = points[points.length - 1]?.contributions ?? 0;
  const totalGrowth = points[points.length - 1]?.growth ?? 0;
  const fireProgress = Math.min(100, (projectedNetWorth / fireTarget) * 100);

  const annualWithdraw = projectedNetWorth * 0.04;
  const monthlyWithdraw = annualWithdraw / 12;
  const taxRate = capitalGainsTaxRate(annualWithdraw);
  const afterTaxMonthly = monthlyWithdraw * (1 - taxRate);
  const afterTaxAnnual = annualWithdraw * (1 - taxRate);

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Welcome back, {profile.name}</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Dashboard</h1>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-widest">FIRE in</p>
          <p className="text-xl sm:text-2xl font-bold text-[var(--green)]">
            {yearsToRetire} <span className="text-sm sm:text-base font-medium text-[var(--green-light)]">yr</span>
          </p>
        </div>
      </header>

      {/* Hero stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Projected Net Worth</CardTitle>
          <StatValue size="xl" className="neon-text break-words">{formatCurrency(projectedNetWorth)}</StatValue>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            at age <span className="text-white font-semibold">{retirementAge}</span> · {yearsToRetire} years from today
          </p>
        </Card>
        <Card>
          <CardTitle>FIRE Progress</CardTitle>
          <div className="flex items-baseline gap-3 mt-1">
            <StatValue size="lg">{formatPercent(fireProgress, 0)}</StatValue>
            <span className="text-sm text-[var(--text-secondary)]">of {formatCurrency(fireTarget, true)}</span>
          </div>
          <div className="mt-4 h-3 rounded-full bg-[var(--surface-light)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-light)]"
              style={{ width: `${fireProgress}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3 leading-snug">
            💡 FIRE (Financial Independence, Retire Early): when you have enough wealth to live without working.
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Growth Projection</CardTitle>
          <div className="text-xs text-[var(--text-muted)]">Hover the chart to inspect any year</div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="year"
                tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")}
                stroke="var(--text-muted)"
                style={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v as number, true)}
                stroke="var(--text-muted)"
                style={{ fontSize: 11 }}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 12,
                  fontSize: 13,
                }}
                labelStyle={{ color: "var(--text-secondary)" }}
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(y) => `Year ${y} · Age ${age + (y as number)}`}
              />
              <ReferenceLine y={fireTarget} stroke="var(--green-light)" strokeDasharray="4 4" label={{ value: "FIRE Target", fill: "var(--green-light)", fontSize: 11, position: "right" }} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--green)"
                strokeWidth={2.5}
                fill="url(#greenGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Inputs */}
      <Card>
        <CardTitle>Your Inputs</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          <InputBlock
            icon={<Target size={16} />}
            label="FIRE Target"
            value={fireTarget}
            onChange={(v) => updateProfile({ fireTarget: v })}
            prefix="$"
            min={50_000}
            max={50_000_000}
          />
          <InputBlock
            icon={<DollarSign size={16} />}
            label="Initial Investment"
            value={initial}
            onChange={(v) => updateProfile({ initialInvestment: v })}
            prefix="$"
            min={0}
            max={50_000_000}
          />
          <InputBlock
            icon={<TrendingUp size={16} />}
            label="Monthly Save"
            value={monthly}
            onChange={(v) => updateProfile({ monthlyContribution: v })}
            prefix="$"
            min={0}
            max={100_000}
          />
          <InputBlock
            icon={<Calendar size={16} />}
            label={`Retire at ${retirementAge}`}
            value={retirementAge}
            onChange={(v) => updateProfile({ retirementAge: v })}
            suffix="years old"
            min={age + 1}
            max={100}
          />
          <InputBlock
            icon={<Percent size={16} />}
            label="Annual Return"
            value={annualReturn}
            onChange={(v) => updateProfile({ annualReturn: v })}
            suffix="%"
            min={1}
            max={20}
          />
        </div>
      </Card>

      {/* Withdrawal */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <CardTitle>4% Safe Withdrawal at FIRE</CardTitle>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Based on projected net worth · Long-term capital gains tax applied dynamically.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Annual Withdraw" value={formatCurrency(annualWithdraw)} />
          <Stat label="Monthly Pre-Tax" value={formatCurrency(monthlyWithdraw)} />
          <Stat label={`Cap Gains Tax (${(taxRate * 100).toFixed(0)}%)`} value={formatCurrency(annualWithdraw * taxRate)} muted />
          <Stat label="Monthly After Tax" value={formatCurrency(afterTaxMonthly)} highlight />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          After-tax annual: <span className="text-white font-semibold">{formatCurrency(afterTaxAnnual)}</span>
        </p>
      </Card>

      {/* Breakdown */}
      <Card>
        <CardTitle>Breakdown</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <Stat label="Total Contributions" value={formatCurrency(totalContributed)} />
          <Stat label="Investment Growth" value={formatCurrency(totalGrowth)} highlight />
          <Stat label="Multiple" value={`${(projectedNetWorth / Math.max(1, totalContributed)).toFixed(2)}x`} />
        </div>
      </Card>

      {/* CTA */}
      <Card glow className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between border-[var(--green-muted)]">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--green-muted)] p-3">
            <Sparkles className="text-[var(--green)]" size={22} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Stress-test your plan</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Run 500 Monte Carlo simulations with your numbers pre-filled.
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            router.push(
              `/simulate?mode=monte-carlo&initial=${initial}&contrib=${monthly * 12}&years=${yearsToRetire}&ret=${annualReturn}`
            )
          }
        >
          Run Monte Carlo Simulation
        </Button>
      </Card>
    </div>
  );
}

function InputBlock({
  icon,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
        <span className="text-[var(--green)]">{icon}</span> {label}
      </div>
      <NumberInput value={value} onChange={onChange} prefix={prefix} suffix={suffix} min={min} max={max} />
    </div>
  );
}

function Stat({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] px-4 py-3">
      <div className={`text-xs ${muted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"} mb-1`}>{label}</div>
      <div className={`font-bold ${highlight ? "text-[var(--green)] text-lg" : "text-white text-base"}`}>{value}</div>
    </div>
  );
}
