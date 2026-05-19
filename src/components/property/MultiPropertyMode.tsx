"use client";

import { useState, useMemo } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatPercent } from "@/lib/format";
import { simulateProperty } from "@/lib/realEstate";
import { Plus, Trash2, Building2 } from "lucide-react";

interface UnitInput {
  id: string;
  nickname: string;
  price: number;
  downPct: number;
  rate: number;
  rent: number;
  taxPct: number;
  insurance: number;
  maintPct: number;
  managementPct: number;
  hoa: number;
}

function newUnit(i: number): UnitInput {
  return {
    id: `${Date.now()}-${i}`,
    nickname: `Property #${i}`,
    price: 400_000,
    downPct: 25,
    rate: 7,
    rent: 3_000,
    taxPct: 1.2,
    insurance: 150,
    maintPct: 1,
    managementPct: 8,
    hoa: 0,
  };
}

export function MultiPropertyMode() {
  const [units, setUnits] = useState<UnitInput[]>([newUnit(1), newUnit(2)]);

  const results = useMemo(() => units.map((u) =>
    simulateProperty({
      price: u.price, downPaymentPct: u.downPct, interestRate: u.rate, loanTermYears: 30,
      closingCostsPct: 3, monthlyRent: u.rent, vacancyPct: 5, propertyTaxPct: u.taxPct,
      insuranceMonthly: u.insurance, maintenancePct: u.maintPct, managementPct: u.managementPct,
      hoaMonthly: u.hoa, holdingYears: 15, appreciationPct: 3, rentGrowthPct: 3,
      expenseGrowthPct: 2.5, sellingCostsPct: 6,
    })
  ), [units]);

  const totals = useMemo(() => {
    const totalCashFlow = results.reduce((s, r) => s + r.monthly.cashFlow, 0);
    const totalCashIn = results.reduce((s, r) => s + r.totalCashInvested, 0);
    const totalValue = units.reduce((s, u) => s + u.price, 0);
    const totalRent = units.reduce((s, u) => s + u.rent, 0);
    const totalLoan = results.reduce((s, r) => s + r.loanAmount, 0);
    const avgCoC = results.length ? results.reduce((s, r) => s + r.cashOnCash, 0) / results.length : 0;
    const avgCap = results.length ? results.reduce((s, r) => s + r.capRate, 0) / results.length : 0;
    return { totalCashFlow, totalCashIn, totalValue, totalRent, totalLoan, avgCoC, avgCap };
  }, [results, units]);

  const update = (id: string, patch: Partial<UnitInput>) =>
    setUnits((us) => us.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  const remove = (id: string) => setUnits((us) => us.filter((u) => u.id !== id));
  const add = () => setUnits((us) => [...us, newUnit(us.length + 1)]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Total Cash Flow</CardTitle>
          <StatValue size="lg" style={{ color: totals.totalCashFlow >= 0 ? "var(--green)" : "var(--red)" }} className="!text-current">
            {formatCurrency(totals.totalCashFlow)}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatCurrency(totals.totalCashFlow * 12)} /yr</p>
        </Card>
        <Card>
          <CardTitle>Portfolio Value</CardTitle>
          <StatValue size="lg">{formatCurrency(totals.totalValue, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{units.length} unit{units.length !== 1 && "s"}</p>
        </Card>
        <Card>
          <CardTitle>Total Cash Invested</CardTitle>
          <StatValue size="lg">{formatCurrency(totals.totalCashIn, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Down + closing combined</p>
        </Card>
        <Card>
          <CardTitle>Avg Cash-on-Cash</CardTitle>
          <StatValue size="lg">{formatPercent(totals.avgCoC, 1)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Cap: {formatPercent(totals.avgCap, 2)}</p>
        </Card>
      </div>

      <div className="space-y-3">
        {units.map((u, i) => {
          const r = results[i];
          return (
            <Card key={u.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="text-[var(--green)]" size={18} />
                  <input
                    value={u.nickname}
                    onChange={(e) => update(u.id, { nickname: e.target.value })}
                    className="bg-transparent text-lg font-bold text-white outline-none border-b border-transparent focus:border-[var(--green)] transition"
                  />
                </div>
                {units.length > 1 && (
                  <button onClick={() => remove(u.id)} className="text-[var(--text-muted)] hover:text-[var(--red)] transition p-1">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Stat label="Cash Flow" value={formatCurrency(r.monthly.cashFlow) + "/mo"} color={r.monthly.cashFlow >= 0 ? "var(--green)" : "var(--red)"} />
                <Stat label="Cash on Cash" value={formatPercent(r.cashOnCash, 1)} />
                <Stat label="Cap Rate" value={formatPercent(r.capRate, 2)} />
                <Stat label="Cash to Close" value={formatCurrency(r.totalCashInvested, true)} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <NumberField label="Price" value={u.price} onChange={(v) => update(u.id, { price: v })} prefix="$" />
                <NumberField label="Down %" value={u.downPct} onChange={(v) => update(u.id, { downPct: v })} suffix="%" />
                <NumberField label="Rate" value={u.rate} onChange={(v) => update(u.id, { rate: v })} suffix="%" step={0.125} />
                <NumberField label="Rent /mo" value={u.rent} onChange={(v) => update(u.id, { rent: v })} prefix="$" />
                <NumberField label="Tax %" value={u.taxPct} onChange={(v) => update(u.id, { taxPct: v })} suffix="%" step={0.05} />
                <NumberField label="Insurance" value={u.insurance} onChange={(v) => update(u.id, { insurance: v })} prefix="$" />
                <NumberField label="Maint %" value={u.maintPct} onChange={(v) => update(u.id, { maintPct: v })} suffix="%" step={0.1} />
                <NumberField label="Mgmt %" value={u.managementPct} onChange={(v) => update(u.id, { managementPct: v })} suffix="%" step={0.5} />
              </div>
            </Card>
          );
        })}
      </div>

      <Button onClick={add} className="w-full">
        <Plus size={16} className="inline mr-2" /> Add Property
      </Button>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</div>
      <div className="text-base font-bold mt-1" style={{ color: color || "white" }}>{value}</div>
    </div>
  );
}

function NumberField({ label, value, onChange, prefix, suffix, step }: { label: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string; step?: number }) {
  return (
    <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-[var(--text-secondary)] text-sm">{prefix}</span>}
        <input
          type="number"
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="bg-transparent text-white font-semibold outline-none w-full min-w-0"
        />
        {suffix && <span className="text-[var(--text-secondary)] text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
