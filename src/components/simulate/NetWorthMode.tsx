"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { formatCurrency } from "@/lib/format";
import { useUser } from "@/lib/UserContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Plus, Trash2, Home as HomeIcon, KeyRound, Car, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type PurchaseKind = "house" | "rent" | "car" | "custom";

interface Purchase {
  id: string;
  kind: PurchaseKind;
  year: number;
  amount: number;
  downPayment?: number;
  mortgageRate?: number;
  appreciation?: number;
  monthlyRent?: number;
  label?: string;
}

const ICONS: Record<PurchaseKind, React.ComponentType<{ size?: number }>> = {
  house: HomeIcon,
  rent: KeyRound,
  car: Car,
  custom: Sparkles,
};

export function NetWorthMode() {
  const { profile } = useUser();
  const [age, setAge] = useState(profile.age ?? 30);
  const [annualIncome, setAnnualIncome] = useState(120_000);
  const [savingsRate, setSavingsRate] = useState(25);
  const [horizon, setHorizon] = useState(30);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const projection = useMemo(() => buildProjection(annualIncome, savingsRate, horizon, annualReturn, purchases), [annualIncome, savingsRate, horizon, annualReturn, purchases]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Final Net Worth</CardTitle>
          <StatValue size="xl" className="neon-text">{formatCurrency(projection.finalNetWorth, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            at age {age + horizon} ({horizon} years from now)
          </p>
        </Card>
        <Card>
          <CardTitle>Investments</CardTitle>
          <StatValue>{formatCurrency(projection.finalInvestments, true)}</StatValue>
        </Card>
        <Card>
          <CardTitle>Home Equity</CardTitle>
          <StatValue>{formatCurrency(projection.finalEquity, true)}</StatValue>
        </Card>
      </div>

      <Card>
        <CardTitle>Net Worth Over Time</CardTitle>
        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection.points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} />
              <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} width={60} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="netWorth" stroke="var(--green)" strokeWidth={2.5} fill="url(#nwGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Inputs */}
      <Card>
        <CardTitle>Your Situation</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Slider label="Current Age" value={age} onChange={setAge} min={16} max={80} step={1} suffix=" yr" />
          <Slider label="Annual Income" value={annualIncome} onChange={setAnnualIncome} min={20_000} max={1_500_000} step={1000} prefix="$" />
          <Slider label="Savings Rate" value={savingsRate} onChange={setSavingsRate} min={0} max={80} step={1} suffix="%" />
          <Slider label="Investment Return" value={annualReturn} onChange={setAnnualReturn} min={3} max={15} step={0.5} suffix="%" />
          <Slider label="Time Horizon" value={horizon} onChange={setHorizon} min={5} max={50} step={1} suffix=" years" />
        </div>
      </Card>

      {/* Purchases */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Major Purchases</CardTitle>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="inline mr-1" /> Add
          </Button>
        </div>
        {purchases.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No purchases planned. Add a house, rent, car, or custom expense to see how it shifts your net worth.</p>
        ) : (
          <div className="space-y-2">
            {purchases.map((p) => {
              const Icon = ICONS[p.kind];
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)]">
                  <Icon size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white capitalize">{p.label || p.kind} · Year {p.year}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {p.kind === "rent"
                        ? `${formatCurrency(p.monthlyRent ?? 0)}/mo`
                        : p.kind === "house"
                        ? `${formatCurrency(p.amount)} home · ${formatCurrency(p.downPayment ?? 0)} down`
                        : formatCurrency(p.amount)}
                    </div>
                  </div>
                  <button onClick={() => setPurchases(purchases.filter((x) => x.id !== p.id))} className="text-[var(--text-muted)] hover:text-[var(--red)]">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recommendations */}
      {projection.recommendations.length > 0 && (
        <Card>
          <CardTitle>Recommendations</CardTitle>
          <ul className="space-y-2 mt-2">
            {projection.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--green)] mt-0.5">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {showAdd && <AddPurchaseModal onAdd={(p) => { setPurchases([...purchases, p]); setShowAdd(false); }} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

interface ProjectionPoint {
  year: number;
  netWorth: number;
  investments: number;
  homeEquity: number;
}

function buildProjection(
  annualIncome: number,
  savingsRate: number,
  horizon: number,
  annualReturn: number,
  purchases: Purchase[]
) {
  const points: ProjectionPoint[] = [];
  let investments = 0;
  let homeEquity = 0;
  let mortgageBalance = 0;
  let homeValue = 0;
  let mortgageMonthly = 0;
  let mortgageRate = 0;
  let appreciationRate = 0.03;
  let rentMonthly = 0;
  const monthlyR = annualReturn / 100 / 12;

  for (let y = 0; y <= horizon; y++) {
    if (y === 0) {
      points.push({ year: 0, netWorth: 0, investments: 0, homeEquity: 0 });
      continue;
    }
    // Apply purchases at start of year
    purchases.filter((p) => p.year === y).forEach((p) => {
      if (p.kind === "house") {
        const down = p.downPayment ?? p.amount * 0.2;
        const principal = p.amount - down;
        investments = Math.max(0, investments - down);
        homeValue = p.amount;
        mortgageBalance = principal;
        mortgageRate = p.mortgageRate ?? 6.5;
        appreciationRate = (p.appreciation ?? 3) / 100;
        // 30-yr fixed monthly payment
        const r = mortgageRate / 100 / 12;
        const n = 360;
        mortgageMonthly = (principal * r) / (1 - Math.pow(1 + r, -n));
      } else if (p.kind === "rent") {
        rentMonthly = p.monthlyRent ?? 0;
      } else {
        investments = Math.max(0, investments - p.amount);
      }
    });

    const monthlySavings = (annualIncome * (savingsRate / 100)) / 12;
    for (let m = 0; m < 12; m++) {
      // mortgage payment
      if (mortgageBalance > 0) {
        const interest = (mortgageBalance * mortgageRate) / 100 / 12;
        const principal = Math.min(mortgageBalance, mortgageMonthly - interest);
        mortgageBalance -= principal;
      }
      // home appreciation (monthly equivalent)
      homeValue *= 1 + appreciationRate / 12;
      // net savings minus mortgage/rent
      const outflow = (mortgageBalance > 0 ? mortgageMonthly : 0) + rentMonthly;
      const monthlyInvest = Math.max(0, monthlySavings - outflow);
      investments = investments * (1 + monthlyR) + monthlyInvest;
    }

    homeEquity = Math.max(0, homeValue - mortgageBalance);
    points.push({
      year: y,
      netWorth: investments + homeEquity,
      investments,
      homeEquity,
    });
  }

  const final = points[points.length - 1];
  const recommendations: string[] = [];
  if (savingsRate < 20) recommendations.push("Saving less than 20% — small increases now have outsized impact. Try bumping to 25%.");
  if (savingsRate >= 50) recommendations.push("Excellent savings rate. You're on Lean/Fat FIRE trajectory.");
  if (purchases.some((p) => p.kind === "house" && (p.downPayment ?? 0) < p.amount * 0.2))
    recommendations.push("Down payment below 20% — expect PMI costs. Consider waiting or saving more.");
  const housePurchases = purchases.filter((p) => p.kind === "house");
  const rents = purchases.filter((p) => p.kind === "rent");
  if (housePurchases.length && rents.length)
    recommendations.push("You're modeling both renting and buying — IRR favors whichever runs longest with lower outflows for your income.");
  if (annualReturn > 10) recommendations.push("Return assumption above 10% is optimistic. SPY's long-term real return is ~7%.");
  if (final.netWorth < annualIncome * 10) recommendations.push("Net worth growing slower than typical 10x income target — consider raising contributions or extending horizon.");

  return {
    points,
    finalNetWorth: final.netWorth,
    finalInvestments: final.investments,
    finalEquity: final.homeEquity,
    recommendations,
  };
}

function AddPurchaseModal({ onAdd, onClose }: { onAdd: (p: Purchase) => void; onClose: () => void }) {
  const [kind, setKind] = useState<PurchaseKind>("house");
  const [year, setYear] = useState(5);
  const [amount, setAmount] = useState(400_000);
  const [downPayment, setDownPayment] = useState(80_000);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [monthlyRent, setMonthlyRent] = useState(2_500);
  const [label, setLabel] = useState("");

  const submit = () => {
    const id = Math.random().toString(36).slice(2);
    onAdd({
      id,
      kind,
      year,
      amount,
      ...(kind === "house" ? { downPayment, mortgageRate, appreciation: 3 } : {}),
      ...(kind === "rent" ? { monthlyRent } : {}),
      label,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardTitle>Add Purchase</CardTitle>
        <div className="grid grid-cols-4 gap-2 mb-4 mt-2">
          {(["house", "rent", "car", "custom"] as PurchaseKind[]).map((k) => {
            const Icon = ICONS[k];
            return (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  "py-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5",
                  kind === k ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--surface-light)] text-[var(--text-secondary)]"
                )}
              >
                <Icon size={20} />
                <span className="capitalize">{k}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Year</label>
            <NumberInput value={year} onChange={setYear} min={1} max={50} suffix="years" />
          </div>
          {kind === "house" && (
            <>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Home Price</label>
                <NumberInput value={amount} onChange={setAmount} prefix="$" min={10_000} max={20_000_000} />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Down Payment</label>
                <NumberInput value={downPayment} onChange={setDownPayment} prefix="$" min={0} max={amount} />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Mortgage Rate</label>
                <NumberInput value={mortgageRate} onChange={setMortgageRate} suffix="%" min={1} max={15} />
              </div>
            </>
          )}
          {kind === "rent" && (
            <div>
              <label className="text-xs text-[var(--text-secondary)]">Monthly Rent</label>
              <NumberInput value={monthlyRent} onChange={setMonthlyRent} prefix="$" min={0} max={50_000} />
            </div>
          )}
          {(kind === "car" || kind === "custom") && (
            <>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Amount</label>
                <NumberInput value={amount} onChange={setAmount} prefix="$" min={0} max={10_000_000} />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Label (optional)</label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-[var(--surface-light)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--green)]"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={submit}>Add</Button>
        </div>
      </Card>
    </div>
  );
}
