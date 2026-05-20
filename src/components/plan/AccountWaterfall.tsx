"use client";

import { useState, useMemo } from "react";
import { Layers } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Toggle } from "@/components/ui/Toggle";
import { formatCurrency } from "@/lib/format";
import { buildAccountWaterfall, type FilingStatus } from "@/lib/tax";

const TAG_STYLES: Record<string, { color: string; label: string }> = {
  "free-money": { color: "#FFD93D", label: "Free Money" },
  "tax-free": { color: "var(--green)", label: "Triple Tax-Free" },
  "tax-free-growth": { color: "var(--green)", label: "Tax-Free Growth" },
  "pre-tax": { color: "#7BC8FF", label: "Pre-Tax" },
  "post-tax": { color: "var(--text-secondary)", label: "Post-Tax" },
};

export function AccountWaterfall() {
  const [grossSalary, setGrossSalary] = useState(120_000);
  const [monthlyToInvest, setMonthlyToInvest] = useState(2_500);
  const [matchPct, setMatchPct] = useState(100);
  const [matchUpToPct, setMatchUpToPct] = useState(6);
  const [hasHSA, setHasHSA] = useState(true);
  const [hsaCoverage, setHsaCoverage] = useState<"self" | "family">("self");
  const [age, setAge] = useState(32);
  const [filing, setFiling] = useState<FilingStatus>("single");

  const taxableIncome = grossSalary;
  const result = useMemo(() => buildAccountWaterfall({
    grossSalary, monthlyToInvest, employerMatchPct: matchPct,
    employerMatchUpToPct: matchUpToPct, hasHSA, hsaCoverage, age,
    filingStatus: filing, taxableIncome,
  }), [grossSalary, monthlyToInvest, matchPct, matchUpToPct, hasHSA, hsaCoverage, age, filing, taxableIncome]);

  return (
    <PlanLayout
      title="Account Waterfall"
      icon={<Layers size={28} />}
      subtitle="The single most important question in investing: where does my next dollar go? Here's the optimal order, customized to your situation."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Annual to Invest</CardTitle>
          <StatValue size="xl">{formatCurrency(monthlyToInvest * 12)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatCurrency(monthlyToInvest)}/mo</p>
        </Card>
        <Card>
          <CardTitle>Free Employer Match</CardTitle>
          <StatValue size="lg" style={{ color: "#FFD93D" }} className="!text-current">{formatCurrency(result.employerMatch)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">You do not pay this — they do</p>
        </Card>
        <Card>
          <CardTitle>Effective $ Working</CardTitle>
          <StatValue size="lg">{formatCurrency(result.totalAllocated + result.employerMatch)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Your $ + match</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Your Waterfall</CardTitle>
        <div className="space-y-3 mt-4">
          {result.steps.map((step) => {
            const tag = TAG_STYLES[step.tag];
            return (
              <div key={step.order} className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[var(--green-muted)] w-8 h-8 flex items-center justify-center text-[var(--green)] font-bold text-sm shrink-0">
                    {step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-bold text-white text-base">{step.name}</div>
                        <span className="text-[10px] uppercase tracking-widest font-bold mt-0.5 inline-block" style={{ color: tag.color }}>{tag.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatCurrency(step.annualAmount)}<span className="text-[var(--text-muted)] text-xs">/yr</span></div>
                        <div className="text-xs text-[var(--text-secondary)]">{formatCurrency(step.monthlyAmount)}/mo</div>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">{step.why}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {result.unallocated > 0 && (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--text-muted)]">
              {formatCurrency(result.unallocated)}/yr unallocated — bump up contributions, or you are fully optimized.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Annual Gross Salary" value={grossSalary} onChange={setGrossSalary} min={20_000} max={2_000_000} step={1_000} prefix="$" />
          <Slider label="Available to Invest Monthly" value={monthlyToInvest} onChange={setMonthlyToInvest} min={0} max={20_000} step={50} prefix="$" />
          <Slider label="Employer Match %" value={matchPct} onChange={setMatchPct} min={0} max={200} step={5} suffix="%" />
          <Slider label="Match Up To % of Salary" value={matchUpToPct} onChange={setMatchUpToPct} min={0} max={15} step={0.5} suffix="%" />
          <Slider label="Age" value={age} onChange={setAge} min={18} max={70} step={1} suffix=" yrs" />
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Filing Status</div>
            <div className="flex gap-2">
              {(["single", "mfj"] as const).map((f) => (
                <button key={f} onClick={() => setFiling(f)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition uppercase ${filing === f ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--card)] text-[var(--text-secondary)]"}`}>{f === "single" ? "Single" : "Married Filing Jointly"}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 flex items-center justify-between">
            <div className="text-sm text-[var(--text-secondary)] font-medium">HSA Eligible?</div>
            <Toggle checked={hasHSA} onChange={setHasHSA} label="HSA eligible" />
          </div>
          {hasHSA && (
            <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
              <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">HSA Coverage</div>
              <div className="flex gap-2">
                {(["self", "family"] as const).map((c) => (
                  <button key={c} onClick={() => setHsaCoverage(c)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition capitalize ${hsaCoverage === c ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--card)] text-[var(--text-secondary)]"}`}>{c}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </PlanLayout>
  );
}
