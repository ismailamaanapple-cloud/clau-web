"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { projectGrowth, portfolioIncome } from "@/lib/finance";
import { DrawdownProjection } from "@/components/invest/DrawdownProjection";
import { HoldingsEditor, DEFAULT_HOLDINGS, type Holding } from "@/components/invest/HoldingsEditor";
import { formatCurrency } from "@/lib/format";
import { useUser } from "@/lib/UserContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

export function CustomPortfolio() {
  const { profile, updateProfile } = useUser();
  const age = profile.age ?? 30;
  const retirementAge = profile.retirementAge ?? 60;
  const [initialInv, setInitialInv] = useState(profile.initialInvestment ?? 25_000);
  const [monthly, setMonthly] = useState(profile.monthlyContribution ?? 2_000);
  const [years, setYears] = useState(Math.max(5, retirementAge - age));
  const [holdings, setHoldings] = useState<Holding[]>(() => profile.investHoldings ?? DEFAULT_HOLDINGS);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Persist the chosen portfolio so it survives reloads and syncs across devices.
  useEffect(() => {
    updateProfile({ investHoldings: holdings });
  }, [holdings, updateProfile]);

  const weightedReturn = holdings.reduce((sum, h) => sum + h.avgReturn * (h.allocation / 100), 0);
  const weightedDividend = holdings.reduce((sum, h) => sum + h.dividendYield * (h.allocation / 100), 0);

  const projection = useMemo(
    () => projectGrowth(initialInv, monthly, years, weightedReturn),
    [initialInv, monthly, years, weightedReturn]
  );
  const finalValue = projection[projection.length - 1]?.total ?? 0;

  const activeYear = hoveredYear ?? years;
  const activePoint = projection.find((p) => p.year === activeYear) ?? projection[projection.length - 1];
  const activeValue = activePoint?.total ?? 0;
  const activeIncome = portfolioIncome(activeValue, weightedDividend);

  // Final-year aggregates for top cards
  const finalIncome = portfolioIncome(finalValue, weightedDividend);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <Card>
        <CardTitle>Your Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <Slider label="Initial Investment" value={initialInv} onChange={setInitialInv} min={0} max={10_000_000} step={1000} prefix="$" />
          <Slider label="Monthly Investment" value={monthly} onChange={setMonthly} min={0} max={100_000} step={50} prefix="$" />
          <Slider label={`Horizon: Age ${age} → ${age + years}`} value={years} onChange={setYears} min={1} max={50} step={1} suffix=" years" />
        </div>
      </Card>

      {/* Headline cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glow className="bg-gradient-radial-green md:col-span-2">
          <CardTitle>Projected Value at FIRE</CardTitle>
          <StatValue size="xl" className="neon-text">{formatCurrency(finalValue, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            blended return: <span className="text-white font-semibold">{weightedReturn.toFixed(2)}%</span> · dividend yield: <span className="text-white font-semibold">{weightedDividend.toFixed(2)}%</span>
          </p>
        </Card>
        <Card>
          <CardTitle>Dividend Income</CardTitle>
          <StatValue size="md" className="text-[var(--yellow)]">{formatCurrency(finalIncome.annualDividend, true)}<span className="text-sm text-[var(--text-muted)] font-medium">/yr</span></StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatCurrency(finalIncome.annualDividend / 12, true)}/mo (pre-tax)
          </p>
        </Card>
        <Card>
          <CardTitle>After-Tax Monthly</CardTitle>
          <StatValue size="md" className="text-[var(--green-light)]">{formatCurrency(finalIncome.afterTax / 12, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatCurrency(finalIncome.afterTax, true)}/yr
          </p>
        </Card>
      </div>

      {/* Year-by-year retirement income explorer */}
      <Card glow className="border-[var(--green-muted)]">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <CardTitle className="!mb-0">Retirement Income at Year {activeYear} · Age {age + activeYear}</CardTitle>
          <span className="text-[10px] uppercase tracking-wider text-[var(--green)] flex items-center gap-1 bg-[var(--green-muted)] px-2 py-1 rounded-full">
            <MoveHorizontal size={12} /> drag chart to scrub
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Mini label="Portfolio Value" value={formatCurrency(activeValue, true)} highlight />
          <Mini label="4% Withdrawal" value={formatCurrency(activeIncome.annualWithdraw, true) + "/yr"} />
          <Mini label={`Dividend (${weightedDividend.toFixed(1)}%)`} value={formatCurrency(activeIncome.annualDividend, true) + "/yr"} />
          <Mini label="Total Pre-Tax" value={formatCurrency(activeIncome.totalIncome, true) + "/yr"} />
          <Mini label={`Cap Gains Tax (${(activeIncome.capRate * 100).toFixed(0)}%)`} value={"−" + formatCurrency(activeIncome.capTax, true)} muted />
          <Mini label="Div Tax (35%)" value={"−" + formatCurrency(activeIncome.divTax, true)} muted />
          <Mini label="After-Tax Annual" value={formatCurrency(activeIncome.afterTax, true)} highlight />
          <Mini label="After-Tax Monthly" value={formatCurrency(activeIncome.afterTax / 12, true)} highlight />
        </div>
      </Card>

      {/* Interactive chart */}
      <Card>
        <CardTitle>Portfolio Projection</CardTitle>
        <div className="h-80 mt-2 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projection}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              onMouseMove={(state) => {
                if (state && state.activeLabel !== undefined && state.activeLabel !== null) {
                  setHoveredYear(Number(state.activeLabel));
                }
              }}
              onMouseLeave={() => setHoveredYear(null)}
              onTouchMove={(state) => {
                if (state && state.activeLabel !== undefined && state.activeLabel !== null) {
                  setHoveredYear(Number(state.activeLabel));
                }
              }}
              onTouchEnd={() => setHoveredYear(null)}
            >
              <defs>
                <linearGradient id="customGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} />
              <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "var(--text-secondary)" }}
                formatter={(v) => [formatCurrency(Number(v)), "Portfolio"]}
                labelFormatter={(y) => `Year ${y} · Age ${age + (y as number)}`}
              />
              {hoveredYear !== null && (
                <ReferenceLine x={hoveredYear} stroke="var(--green-light)" strokeDasharray="3 3" />
              )}
              <Area type="monotone" dataKey="total" stroke="var(--green)" strokeWidth={2.5} fill="url(#customGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4% rule drawdown */}
      <DrawdownProjection
        annualReturnPct={weightedReturn}
        dividendYieldPct={weightedDividend}
        initial={initialInv}
        monthly={monthly}
        currentAge={age}
        defaultStartAge={retirementAge}
      />

      {/* Holdings */}
      <HoldingsEditor holdings={holdings} onChange={setHoldings} />
    </div>
  );
}

function Mini({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl px-3 py-2.5 border",
      highlight
        ? "bg-[var(--green-muted)] border-[var(--green-muted)]"
        : muted
        ? "bg-[var(--surface-light)] border-[var(--border)]"
        : "bg-[var(--surface-light)] border-[var(--border)]"
    )}>
      <div className={`text-[10px] uppercase tracking-wider ${muted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>{label}</div>
      <div className={`text-sm font-bold ${highlight ? "text-[var(--green)]" : muted ? "text-[var(--text-muted)]" : "text-white"}`}>{value}</div>
    </div>
  );
}
