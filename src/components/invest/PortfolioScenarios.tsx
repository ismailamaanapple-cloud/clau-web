"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { PORTFOLIO_SCENARIOS, ETFS } from "@/lib/data/etfs";
import { projectGrowth } from "@/lib/finance";
import { formatCurrency, capitalGainsTaxRate } from "@/lib/format";
import { useUser } from "@/lib/UserContext";

export function PortfolioScenarios() {
  const { profile } = useUser();
  const [initial, setInitial] = useState(profile.initialInvestment ?? 25_000);
  const [monthly, setMonthly] = useState(profile.monthlyContribution ?? 2_000);
  const age = profile.age ?? 30;
  const retirementAge = profile.retirementAge ?? 60;
  const [years, setYears] = useState(Math.max(5, retirementAge - age));

  const scenarios = useMemo(() => {
    return PORTFOLIO_SCENARIOS.map((s) => {
      // Compute weighted return + dividend
      let weightedReturn = 0;
      let weightedDividend = 0;
      Object.entries(s.allocations).forEach(([symbol, pct]) => {
        const etf = ETFS.find((e) => e.symbol === symbol);
        if (!etf) return;
        weightedReturn += etf.avgReturn * (pct / 100);
        weightedDividend += etf.dividendYield * (pct / 100);
      });
      const projection = projectGrowth(initial, monthly, years, weightedReturn);
      const final = projection[projection.length - 1]?.total ?? 0;
      const annualWithdraw = final * 0.04;
      const annualDividend = final * (weightedDividend / 100);
      const totalIncome = annualWithdraw + annualDividend;
      const capGainsRate = capitalGainsTaxRate(annualWithdraw);
      const capGainsTax = annualWithdraw * capGainsRate;
      const divTax = annualDividend * 0.35;
      const afterTax = totalIncome - capGainsTax - divTax;

      return {
        ...s,
        weightedReturn,
        weightedDividend,
        finalValue: final,
        annualWithdraw,
        annualDividend,
        totalIncome,
        capGainsTax,
        capGainsRate,
        divTax,
        afterTax,
      };
    });
  }, [initial, monthly, years]);

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Your Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <Slider label="Initial Investment" value={initial} onChange={setInitial} min={0} max={10_000_000} step={1000} prefix="$" />
          <Slider label="Monthly Investment" value={monthly} onChange={setMonthly} min={0} max={100_000} step={50} prefix="$" />
          <Slider
            label={`Horizon: Age ${age} → ${age + years}`}
            value={years}
            onChange={setYears}
            min={1}
            max={50}
            step={1}
            suffix=" years"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scenarios.map((s) => (
          <Card key={s.id} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-white">{s.name}</h3>
                <span className="text-xs text-[var(--green)] font-semibold">
                  {s.weightedReturn.toFixed(1)}% avg
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{s.description}</p>
            </div>

            {/* Allocation bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--surface-light)]">
              {Object.entries(s.allocations).map(([symbol, pct], i) => {
                const colors = ["var(--green)", "var(--blue)", "var(--yellow)", "var(--purple)", "var(--orange)"];
                return (
                  <div
                    key={symbol}
                    style={{ width: `${pct}%`, background: colors[i % colors.length] }}
                    title={`${symbol} ${pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--text-muted)]">
              {Object.entries(s.allocations).map(([symbol, pct]) => (
                <span key={symbol}>
                  <span className="text-white font-semibold">{symbol}</span> {pct}%
                </span>
              ))}
            </div>

            {/* Final value */}
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Projected Value</p>
              <StatValue size="lg" className="neon-text">{formatCurrency(s.finalValue, true)}</StatValue>
            </div>

            {/* Retirement income */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
              <Mini label="4% Withdrawal" value={formatCurrency(s.annualWithdraw, true) + "/yr"} />
              <Mini label={`Div (${s.weightedDividend.toFixed(1)}%)`} value={formatCurrency(s.annualDividend, true) + "/yr"} />
              <Mini label={`Cap Gains Tax (${(s.capGainsRate * 100).toFixed(0)}%)`} value={"−" + formatCurrency(s.capGainsTax, true)} muted />
              <Mini label="Div Tax (35%)" value={"−" + formatCurrency(s.divTax, true)} muted />
            </div>
            <div className="rounded-xl bg-[var(--green-muted)] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--green)]">After-Tax Income</p>
              <p className="text-lg font-bold text-[var(--green)]">{formatCurrency(s.afterTax, true)}/yr</p>
              <p className="text-xs text-[var(--text-secondary)]">{formatCurrency(s.afterTax / 12, true)}/mo</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-lg bg-[var(--surface-light)] px-3 py-2">
      <div className={`text-[10px] uppercase tracking-wider ${muted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>{label}</div>
      <div className={`text-sm font-bold ${muted ? "text-[var(--text-muted)]" : "text-white"}`}>{value}</div>
    </div>
  );
}
