"use client";

import { useState, useMemo } from "react";
import { DollarSign } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { useUser } from "@/lib/UserContext";
import { formatCurrency } from "@/lib/format";
import { impactOfRaise } from "@/lib/fireMath";

export function SalaryImpact() {
  const { profile } = useUser();
  const [currentInvested, setCurrentInvested] = useState(profile.initialInvestment ?? 50_000);
  const [currentMonthly, setCurrentMonthly] = useState(profile.monthlyContribution ?? 1_500);
  const [raise, setRaise] = useState(10_000);
  const [pctToInvest, setPctToInvest] = useState(80);
  const [margTax, setMargTax] = useState(0.32);
  const [fireTarget, setFireTarget] = useState(profile.fireTarget ?? 2_000_000);
  const [annualReturn, setAnnualReturn] = useState(profile.annualReturn ?? 8);

  const r = useMemo(() => impactOfRaise({
    currentInvested, currentMonthlyContribution: currentMonthly,
    raiseAnnual: raise, raiseToInvestmentsPct: pctToInvest,
    marginalTaxRate: margTax, fireTarget, annualReturnPct: annualReturn,
  }), [currentInvested, currentMonthly, raise, pctToInvest, margTax, fireTarget, annualReturn]);

  return (
    <PlanLayout
      title="Salary Raise Impact"
      icon={<DollarSign size={28} />}
      subtitle="How much does a raise actually move your FIRE date when most of it goes to investing vs lifestyle?"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Years Saved</CardTitle>
          <StatValue size="xl" style={{ color: "var(--green)" }} className="!text-current">
            {r.yearsSaved > 100 ? "—" : `${r.yearsSaved.toFixed(1)}`}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            FIRE arrives {r.yearsSaved.toFixed(1)} years earlier with this raise.
          </p>
        </Card>
        <Card>
          <CardTitle>Before Raise</CardTitle>
          <StatValue size="lg">{isFinite(r.yearsBefore) ? `${r.yearsBefore.toFixed(1)} yrs` : "Never"}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">to {formatCurrency(fireTarget, true)}</p>
        </Card>
        <Card>
          <CardTitle>After Raise</CardTitle>
          <StatValue size="lg" style={{ color: "var(--green)" }} className="!text-current">
            {isFinite(r.yearsAfter) ? `${r.yearsAfter.toFixed(1)} yrs` : "Never"}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            +{formatCurrency(r.extraMonthlyContribution)} /mo invested
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>The Numbers</CardTitle>
        <div className="space-y-2 mt-3 text-sm">
          <Row label="Pre-tax raise" value={formatCurrency(raise)} />
          <Row label={`After tax (${(margTax * 100).toFixed(0)}% marginal)`} value={formatCurrency(raise * (1 - margTax))} />
          <Row label={`To investing (${pctToInvest}%)`} value={formatCurrency(raise * (1 - margTax) * (pctToInvest / 100))} positive />
          <Row label="To lifestyle" value={formatCurrency(raise * (1 - margTax) * (1 - pctToInvest / 100))} muted />
          <Row label="Extra monthly contribution" value={formatCurrency(r.extraMonthlyContribution)} bold />
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Currently Invested" value={currentInvested} onChange={setCurrentInvested} min={0} max={50_000_000} step={5_000} prefix="$" />
          <Slider label="Current Monthly Contribution" value={currentMonthly} onChange={setCurrentMonthly} min={0} max={100_000} step={100} prefix="$" />
          <Slider label="Annual Raise" value={raise} onChange={setRaise} min={500} max={500_000} step={500} prefix="$" />
          <Slider label="% of Raise to Investments" value={pctToInvest} onChange={setPctToInvest} min={0} max={100} step={5} suffix="%" />
          <Slider label="Marginal Tax Rate" value={margTax * 100} onChange={(v) => setMargTax(v / 100)} min={0} max={45} step={1} suffix="%" />
          <Slider label="FIRE Target" value={fireTarget} onChange={setFireTarget} min={100_000} max={50_000_000} step={10_000} prefix="$" />
          <Slider label="Annual Return" value={annualReturn} onChange={setAnnualReturn} min={1} max={15} step={0.25} suffix="%" />
        </div>
      </Card>

      <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed">
        <span className="text-white font-semibold">Lifestyle creep is the silent FIRE killer.</span> Each raise where you spend it all keeps you on the original timeline. Each raise where you save 80%+ pulls retirement years closer.
      </div>
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
