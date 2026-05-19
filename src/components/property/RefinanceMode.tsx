"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency } from "@/lib/format";
import { analyzeRefinance } from "@/lib/realEstate";
import { Clock, TrendingDown, DollarSign } from "lucide-react";

export function RefinanceMode() {
  const [balance, setBalance] = useState(350_000);
  const [oldRate, setOldRate] = useState(7.25);
  const [monthsLeft, setMonthsLeft] = useState(312);
  const [newRate, setNewRate] = useState(5.5);
  const [newTerm, setNewTerm] = useState<15 | 30>(30);
  const [closing, setClosing] = useState(8_000);
  const [cashOut, setCashOut] = useState(0);
  const [cashOutReturn, setCashOutReturn] = useState(8);

  const result = useMemo(() => analyzeRefinance({
    currentBalance: balance, currentRatePct: oldRate, monthsRemaining: monthsLeft,
    newRatePct: newRate, newTermYears: newTerm, closingCosts: closing,
    cashOutAmount: cashOut, cashOutReturnPct: cashOutReturn,
  }), [balance, oldRate, monthsLeft, newRate, newTerm, closing, cashOut, cashOutReturn]);

  const worthIt = result.monthlySavings > 0 && result.breakEvenMonths < monthsLeft;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">Monthly Savings</CardTitle>
          </div>
          <StatValue size="lg" style={{ color: result.monthlySavings > 0 ? "var(--green)" : "var(--red)" }} className="!text-current">
            {formatCurrency(result.monthlySavings)}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatCurrency(result.monthlySavings * 12)} /yr</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">Break-Even</CardTitle>
          </div>
          <StatValue size="lg">{isFinite(result.breakEvenMonths) ? `${result.breakEvenMonths.toFixed(1)} mo` : "Never"}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{isFinite(result.breakEvenMonths) ? `~${(result.breakEvenMonths / 12).toFixed(1)} yrs` : "no savings"}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">Lifetime Interest Saved</CardTitle>
          </div>
          <StatValue size="lg" style={{ color: result.lifetimeInterestSavings > 0 ? "var(--green)" : "var(--red)" }} className="!text-current">
            {formatCurrency(result.lifetimeInterestSavings, true)}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Over full new term</p>
        </Card>
        <Card>
          <CardTitle>Worth It?</CardTitle>
          <StatValue size="lg" style={{ color: worthIt ? "var(--green)" : "var(--red)" }} className="!text-current">
            {worthIt ? "Yes ✓" : "Probably Not"}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{worthIt ? "Stay 2+ yrs past break-even" : "Break-even too far out"}</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Side-By-Side</CardTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
            <div className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Current Loan</div>
            <div className="space-y-2 text-sm">
              <KV k="Balance" v={formatCurrency(balance, true)} />
              <KV k="Rate" v={`${oldRate.toFixed(3)}%`} />
              <KV k="Months left" v={`${monthsLeft}`} />
              <KV k="P&I" v={formatCurrency(result.currentMonthlyPI)} />
              <KV k="Total interest" v={formatCurrency(result.totalInterestCurrent, true)} />
            </div>
          </div>
          <div className="rounded-xl bg-[var(--green-muted)] border border-[var(--green)] p-4">
            <div className="text-xs uppercase tracking-widest text-[var(--green)] mb-2">After Refinance</div>
            <div className="space-y-2 text-sm">
              <KV k="New loan" v={formatCurrency(result.newLoanAmount, true)} />
              <KV k="Rate" v={`${newRate.toFixed(3)}%`} />
              <KV k="Term" v={`${newTerm} yrs`} />
              <KV k="P&I" v={formatCurrency(result.newMonthlyPI)} />
              <KV k="Total interest" v={formatCurrency(result.totalInterestNew, true)} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Current Loan Balance" value={balance} onChange={setBalance} min={10_000} max={10_000_000} step={5_000} prefix="$" />
          <Slider label="Current Rate" value={oldRate} onChange={setOldRate} min={0} max={20} step={0.125} suffix="%" />
          <Slider label="Months Remaining" value={monthsLeft} onChange={setMonthsLeft} min={12} max={480} step={12} suffix=" mo" />
          <Slider label="New Rate" value={newRate} onChange={setNewRate} min={0} max={20} step={0.125} suffix="%" />
          <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">New Term</div>
            <div className="flex gap-2">
              {([15, 30] as const).map((t) => (
                <button key={t} onClick={() => setNewTerm(t)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${newTerm === t ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--card)] text-[var(--text-secondary)]"}`}>{t}-yr</button>
              ))}
            </div>
          </div>
          <Slider label="Closing Costs" value={closing} onChange={setClosing} min={0} max={50_000} step={250} prefix="$" />
          <Slider label="Cash Out (optional)" value={cashOut} onChange={setCashOut} min={0} max={500_000} step={1_000} prefix="$" />
          {cashOut > 0 && (
            <Slider label="Cash-Out Investment Return" value={cashOutReturn} onChange={setCashOutReturn} min={0} max={20} step={0.25} suffix="% /yr" />
          )}
        </div>
      </Card>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{k}</span>
      <span className="text-white font-semibold">{v}</span>
    </div>
  );
}
