"use client";

import { useState, useMemo } from "react";
import { HeartPulse } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency } from "@/lib/format";
import { acaSubsidyEstimate } from "@/lib/tax";

export function Healthcare() {
  const [household, setHousehold] = useState(2);
  const [magi, setMagi] = useState(60_000);
  const [yearsToMedicare, setYearsToMedicare] = useState(15);
  const [state, setState] = useState<"high-cost" | "average" | "low-cost">("average");

  const aca = useMemo(() => acaSubsidyEstimate({ household, magi, state }), [household, magi, state]);
  const lifetimeCost = useMemo(() => aca.netPremiumMonthly * 12 * yearsToMedicare, [aca, yearsToMedicare]);
  const subsidyTotal = useMemo(() => aca.subsidyAnnual * yearsToMedicare, [aca, yearsToMedicare]);

  return (
    <PlanLayout
      title="Healthcare Bridge to Medicare"
      icon={<HeartPulse size={28} />}
      subtitle="One of the biggest FIRE blockers: insuring yourself from early retirement to 65. ACA subsidies are based on MAGI, so keeping income low matters."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Net Premium /mo</CardTitle>
          <StatValue size="xl" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(aca.netPremiumMonthly)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">After ACA subsidies</p>
        </Card>
        <Card>
          <CardTitle>Annual Subsidy</CardTitle>
          <StatValue size="lg" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(aca.subsidyAnnual)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Tax credit you receive</p>
        </Card>
        <Card>
          <CardTitle>Benchmark Plan</CardTitle>
          <StatValue size="lg">{formatCurrency(aca.benchmarkAnnual)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Pre-subsidy cost (Silver)</p>
        </Card>
        <Card>
          <CardTitle>Bridge Cost</CardTitle>
          <StatValue size="lg">{formatCurrency(lifetimeCost, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Total over {yearsToMedicare} years</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Household Size" value={household} onChange={setHousehold} min={1} max={10} step={1} />
          <Slider label="Modified AGI" value={magi} onChange={setMagi} min={10_000} max={500_000} step={1_000} prefix="$" />
          <Slider label="Years until Medicare (65)" value={yearsToMedicare} onChange={setYearsToMedicare} min={1} max={40} step={1} suffix=" yrs" />
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Cost Region</div>
            <div className="flex gap-2">
              {(["low-cost", "average", "high-cost"] as const).map((s) => (
                <button key={s} onClick={() => setState(s)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition capitalize ${state === s ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--card)] text-[var(--text-secondary)]"}`}>{s.replace("-", " ")}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Why MAGI Matters</CardTitle>
        <div className="space-y-2 mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          <p>ACA subsidies phase out as your MAGI climbs. FIRE folks often manage MAGI deliberately by:</p>
          <ul className="space-y-1.5 ml-1 mt-2">
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-1.5 w-1 h-1 rounded-full bg-[var(--green)] shrink-0" /><span>Living off Roth contributions (don&apos;t count as income)</span></li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-1.5 w-1 h-1 rounded-full bg-[var(--green)] shrink-0" /><span>Drawing from taxable accounts (only gains count, not basis)</span></li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-1.5 w-1 h-1 rounded-full bg-[var(--green)] shrink-0" /><span>Limiting Roth conversions to stay under subsidy thresholds</span></li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-1.5 w-1 h-1 rounded-full bg-[var(--green)] shrink-0" /><span>Using HSA distributions (tax-free if for medical)</span></li>
          </ul>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Estimated subsidies you&apos;ll receive over {yearsToMedicare} years: <span className="text-[var(--green)] font-semibold">{formatCurrency(subsidyTotal, true)}</span>
          </p>
        </div>
      </Card>
    </PlanLayout>
  );
}
