"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { HoldingsEditor, DEFAULT_HOLDINGS, type Holding } from "@/components/invest/HoldingsEditor";
import {
  projectGrowth,
  portfolioIncome,
  portfolioForAfterTaxIncome,
  monthlyContributionForTarget,
  lumpSumForTarget,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { useUser } from "@/lib/UserContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Target, CalendarClock, Banknote } from "lucide-react";
import { cn } from "@/lib/cn";

const TIMELINE_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40];

export function IncomeGoal() {
  const { profile, updateProfile } = useUser();
  const age = profile.age ?? 30;
  const retirementAge = profile.retirementAge ?? 60;
  const [targetMonthly, setTargetMonthly] = useState(profile.incomeGoalMonthly ?? 5_000);
  const [initial, setInitial] = useState(profile.initialInvestment ?? 25_000);
  const [years, setYears] = useState(Math.min(40, Math.max(5, retirementAge - age)));
  const [holdings, setHoldings] = useState<Holding[]>(() => profile.investHoldings ?? DEFAULT_HOLDINGS);

  // Persist the goal target and the chosen portfolio (shared with Custom Portfolio).
  useEffect(() => {
    updateProfile({ incomeGoalMonthly: targetMonthly, investHoldings: holdings });
  }, [targetMonthly, holdings, updateProfile]);

  const weightedReturn = holdings.reduce((sum, h) => sum + h.avgReturn * (h.allocation / 100), 0);
  const weightedDividend = holdings.reduce((sum, h) => sum + h.dividendYield * (h.allocation / 100), 0);

  const requiredPortfolio = useMemo(
    () => portfolioForAfterTaxIncome(targetMonthly * 12, weightedDividend),
    [targetMonthly, weightedDividend]
  );
  const breakdown = portfolioIncome(requiredPortfolio, weightedDividend);

  const monthlyNeeded = monthlyContributionForTarget(requiredPortfolio, initial, years, weightedReturn);
  const lumpNeeded = lumpSumForTarget(requiredPortfolio, initial, years, weightedReturn);
  const alreadyThere = monthlyNeeded <= 0 && lumpNeeded <= 0;

  const projection = useMemo(
    () => projectGrowth(initial, monthlyNeeded, years, weightedReturn),
    [initial, monthlyNeeded, years, weightedReturn]
  );

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <Card>
        <CardTitle>Your Goal</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <Slider label="Monthly Income (after tax)" value={targetMonthly} onChange={setTargetMonthly} min={500} max={500_000} step={500} prefix="$" />
          <Slider label="Already Invested" value={initial} onChange={setInitial} min={0} max={10_000_000} step={1000} prefix="$" />
          <Slider label={`Timeline: Age ${age} → ${age + years}`} value={years} onChange={setYears} min={1} max={50} step={1} suffix=" years" />
        </div>
      </Card>

      {/* Headline: required portfolio + the two paths */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <div className="flex items-center gap-2 mb-1">
            <Target className="text-[var(--green)]" size={16} />
            <CardTitle className="!mb-0">Portfolio Needed</CardTitle>
          </div>
          <StatValue size="xl" className="neon-text">{formatCurrency(requiredPortfolio, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            pays <span className="text-white font-semibold">{formatCurrency(targetMonthly)}/mo after tax</span> from a 4% withdrawal + {weightedDividend.toFixed(1)}% dividends
          </p>
        </Card>
        <Card glow={alreadyThere}>
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="text-[var(--yellow)]" size={16} />
            <CardTitle className="!mb-0">Option A · Lump Sum Today</CardTitle>
          </div>
          <StatValue size="lg" className="text-[var(--yellow)]">{formatCurrency(lumpNeeded, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {alreadyThere
              ? "Your current investments alone already grow to the goal. 🎉"
              : `Invest this once today (on top of your ${formatCurrency(initial, true)}), let it compound at ${weightedReturn.toFixed(1)}% for ${years} years, and you're done.`}
          </p>
        </Card>
        <Card glow={alreadyThere}>
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="text-[var(--green-light)]" size={16} />
            <CardTitle className="!mb-0">Option B · Invest Monthly</CardTitle>
          </div>
          <StatValue size="lg" className="text-[var(--green-light)]">
            {formatCurrency(monthlyNeeded, true)}<span className="text-sm text-[var(--text-muted)] font-medium">/mo</span>
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {alreadyThere
              ? "No further contributions needed — you're coasting."
              : `Invest this every month for ${years} years to hit ${formatCurrency(requiredPortfolio, true)}.`}
          </p>
        </Card>
      </div>

      {/* How the income breaks down at the goal */}
      <Card glow className="border-[var(--green-muted)]">
        <CardTitle>Your Income at the Goal</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
          <Mini label="Portfolio Value" value={formatCurrency(requiredPortfolio, true)} highlight />
          <Mini label="4% Withdrawal" value={formatCurrency(breakdown.annualWithdraw, true) + "/yr"} />
          <Mini label={`Dividends (${weightedDividend.toFixed(1)}%)`} value={formatCurrency(breakdown.annualDividend, true) + "/yr"} />
          <Mini label="Total Pre-Tax" value={formatCurrency(breakdown.totalIncome, true) + "/yr"} />
          <Mini label={`Cap Gains Tax (${(breakdown.capRate * 100).toFixed(0)}%)`} value={"−" + formatCurrency(breakdown.capTax, true)} muted />
          <Mini label="Div Tax (35%)" value={"−" + formatCurrency(breakdown.divTax, true)} muted />
          <Mini label="After-Tax Annual" value={formatCurrency(breakdown.afterTax, true)} highlight />
          <Mini label="After-Tax Monthly" value={formatCurrency(breakdown.afterTax / 12, true)} highlight />
        </div>
      </Card>

      {/* Path to the goal */}
      <Card>
        <CardTitle>Path to Your Goal · {formatCurrency(monthlyNeeded, true)}/mo for {years} years</CardTitle>
        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} />
              <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => [formatCurrency(Number(v)), "Portfolio"]}
                labelFormatter={(y) => `Year ${y} · Age ${age + (y as number)}`}
              />
              <ReferenceLine
                y={requiredPortfolio}
                stroke="var(--yellow)"
                strokeDasharray="6 4"
                label={{ value: `Goal ${formatCurrency(requiredPortfolio, true)}`, fill: "var(--yellow)", fontSize: 11, position: "insideTopRight" }}
              />
              <Area type="monotone" dataKey="total" stroke="var(--green)" strokeWidth={2.5} fill="url(#goalGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Trade-off table: pick your timeline */}
      <Card>
        <CardTitle>Pick Your Timeline</CardTitle>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          The longer you give compounding, the less you need — either as one lump sum today or invested monthly.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-4">Timeline</th>
                <th className="py-2 pr-4">Age at Goal</th>
                <th className="py-2 pr-4">Lump Sum Today</th>
                <th className="py-2">Or Monthly</th>
              </tr>
            </thead>
            <tbody>
              {TIMELINE_OPTIONS.map((y) => {
                const selected = y === years;
                return (
                  <tr
                    key={y}
                    onClick={() => setYears(y)}
                    className={cn(
                      "border-b border-[var(--border)] cursor-pointer transition",
                      selected ? "bg-[var(--green-muted)]" : "hover:bg-[var(--card-hover)]"
                    )}
                  >
                    <td className={cn("py-2.5 pr-4 font-semibold", selected ? "text-[var(--green)]" : "text-white")}>{y} years</td>
                    <td className="py-2.5 pr-4 text-[var(--text-secondary)]">{age + y}</td>
                    <td className="py-2.5 pr-4 text-[var(--yellow)] font-semibold">
                      {formatCurrency(lumpSumForTarget(requiredPortfolio, initial, y, weightedReturn), true)}
                    </td>
                    <td className="py-2.5 text-[var(--green-light)] font-semibold">
                      {formatCurrency(monthlyContributionForTarget(requiredPortfolio, initial, y, weightedReturn), true)}/mo
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Holdings */}
      <HoldingsEditor holdings={holdings} onChange={setHoldings} />
    </div>
  );
}

function Mini({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl px-3 py-2.5 border",
      highlight ? "bg-[var(--green-muted)] border-[var(--green-muted)]" : "bg-[var(--surface-light)] border-[var(--border)]"
    )}>
      <div className={`text-[10px] uppercase tracking-wider ${muted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>{label}</div>
      <div className={`text-sm font-bold ${highlight ? "text-[var(--green)]" : muted ? "text-[var(--text-muted)]" : "text-white"}`}>{value}</div>
    </div>
  );
}
