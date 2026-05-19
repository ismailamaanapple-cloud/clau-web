"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { ETFS, POPULAR_STOCKS } from "@/lib/data/etfs";
import { projectGrowth } from "@/lib/finance";
import { formatCurrency, capitalGainsTaxRate } from "@/lib/format";
import { useUser } from "@/lib/UserContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Plus, X, MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

interface Holding {
  symbol: string;
  name: string;
  avgReturn: number;
  dividendYield: number;
  allocation: number;
}

const defaultHoldings: Holding[] = [
  { ...ETFS.find((e) => e.symbol === "VTI")!, allocation: 70 },
  { ...ETFS.find((e) => e.symbol === "BND")!, allocation: 30 },
];

export function CustomPortfolio() {
  const { profile } = useUser();
  const age = profile.age ?? 30;
  const retirementAge = profile.retirementAge ?? 60;
  const [initialInv, setInitialInv] = useState(profile.initialInvestment ?? 25_000);
  const [monthly, setMonthly] = useState(profile.monthlyContribution ?? 2_000);
  const [years, setYears] = useState(Math.max(5, retirementAge - age));
  const [holdings, setHoldings] = useState<Holding[]>(defaultHoldings);
  const [showAdd, setShowAdd] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const weightedReturn = holdings.reduce((sum, h) => sum + h.avgReturn * (h.allocation / 100), 0);
  const weightedDividend = holdings.reduce((sum, h) => sum + h.dividendYield * (h.allocation / 100), 0);
  const totalAllocation = holdings.reduce((s, h) => s + h.allocation, 0);

  const projection = useMemo(
    () => projectGrowth(initialInv, monthly, years, weightedReturn),
    [initialInv, monthly, years, weightedReturn]
  );
  const finalValue = projection[projection.length - 1]?.total ?? 0;

  // Compute retirement income at a specific year
  const computeIncome = (portfolioValue: number) => {
    const annualWithdraw = portfolioValue * 0.04;
    const annualDividend = portfolioValue * (weightedDividend / 100);
    const totalIncome = annualWithdraw + annualDividend;
    const capRate = capitalGainsTaxRate(annualWithdraw);
    const capTax = annualWithdraw * capRate;
    const divTax = annualDividend * 0.35;
    const afterTax = totalIncome - capTax - divTax;
    return { annualWithdraw, annualDividend, totalIncome, capRate, capTax, divTax, afterTax };
  };

  const activeYear = hoveredYear ?? years;
  const activePoint = projection.find((p) => p.year === activeYear) ?? projection[projection.length - 1];
  const activeValue = activePoint?.total ?? 0;
  const activeIncome = computeIncome(activeValue);

  // Final-year aggregates for top cards
  const finalIncome = computeIncome(finalValue);

  const updateAllocation = (symbol: string, newPct: number) => {
    const others = holdings.filter((h) => h.symbol !== symbol);
    const remaining = 100 - newPct;
    const sumOthers = others.reduce((s, h) => s + h.allocation, 0);
    setHoldings(
      holdings.map((h) => {
        if (h.symbol === symbol) return { ...h, allocation: newPct };
        if (sumOthers === 0) return h;
        return { ...h, allocation: (h.allocation / sumOthers) * remaining };
      })
    );
  };

  const removeHolding = (symbol: string) => {
    const remaining = holdings.filter((h) => h.symbol !== symbol);
    const sum = remaining.reduce((s, h) => s + h.allocation, 0);
    if (sum === 0) {
      setHoldings(remaining);
      return;
    }
    setHoldings(remaining.map((h) => ({ ...h, allocation: (h.allocation / sum) * 100 })));
  };

  const addHolding = (h: Omit<Holding, "allocation">) => {
    if (holdings.some((x) => x.symbol === h.symbol)) return;
    const each = 100 / (holdings.length + 1);
    setHoldings([
      ...holdings.map((x) => ({ ...x, allocation: each })),
      { ...h, allocation: each },
    ]);
    setShowAdd(false);
  };

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

      {/* Holdings */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <CardTitle>Holdings</CardTitle>
            <p className={cn("text-xs mt-1", Math.round(totalAllocation) === 100 ? "text-[var(--text-muted)]" : "text-[var(--yellow)]")}>
              Total allocation: {totalAllocation.toFixed(0)}% {Math.round(totalAllocation) !== 100 && "(should equal 100%)"}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="inline mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {holdings.map((h) => (
            <div key={h.symbol} className="p-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-white">{h.symbol}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">{h.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {h.avgReturn.toFixed(1)}% · {h.dividendYield.toFixed(1)}% div
                  </span>
                  <button onClick={() => removeHolding(h.symbol)} className="text-[var(--text-muted)] hover:text-[var(--red)]">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={h.allocation}
                  onChange={(e) => updateAllocation(h.symbol, parseFloat(e.target.value))}
                  className="flex-1 accent-[var(--green)]"
                />
                <div className="w-14 text-right font-bold text-[var(--green)]">{h.allocation.toFixed(0)}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showAdd && (
        <AddSymbolModal
          onClose={() => setShowAdd(false)}
          onAdd={addHolding}
          existing={holdings.map((h) => h.symbol)}
        />
      )}
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

function AddSymbolModal({
  onClose,
  onAdd,
  existing,
}: {
  onClose: () => void;
  onAdd: (h: { symbol: string; name: string; avgReturn: number; dividendYield: number }) => void;
  existing: string[];
}) {
  const [query, setQuery] = useState("");
  const all = useMemo(
    () => [
      ...ETFS.map((e) => ({ symbol: e.symbol, name: e.name, avgReturn: e.avgReturn, dividendYield: e.dividendYield, kind: "ETF" })),
      ...POPULAR_STOCKS.map((s) => ({ symbol: s.symbol, name: s.name, avgReturn: s.avgReturn ?? 10, dividendYield: s.dividendYield ?? 0, kind: "Stock" })),
    ],
    []
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((x) => !existing.includes(x.symbol))
      .filter((x) => !q || x.symbol.toLowerCase().includes(q) || x.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [all, query, existing]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardTitle>Add a Stock or ETF</CardTitle>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ticker or name (e.g. AAPL, Vanguard)"
          className="w-full mt-2 bg-[var(--surface-light)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--green)]"
        />
        <div className="space-y-1.5 mt-3">
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">No matches</p>
          )}
          {filtered.map((opt) => (
            <button
              key={opt.symbol}
              onClick={() =>
                onAdd({
                  symbol: opt.symbol,
                  name: opt.name,
                  avgReturn: opt.avgReturn,
                  dividendYield: opt.dividendYield,
                })
              }
              className="w-full text-left p-3 rounded-xl bg-[var(--surface-light)] hover:bg-[var(--card-hover)] flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-white">{opt.symbol}</div>
                <div className="text-xs text-[var(--text-muted)]">{opt.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--green)]">{opt.avgReturn.toFixed(1)}%</div>
                <div className="text-[10px] text-[var(--text-muted)]">{opt.kind}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}
