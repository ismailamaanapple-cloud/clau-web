"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ETFS, POPULAR_STOCKS } from "@/lib/data/etfs";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Holding {
  symbol: string;
  name: string;
  avgReturn: number;
  dividendYield: number;
  allocation: number;
}

export const DEFAULT_HOLDINGS: Holding[] = [
  { ...ETFS.find((e) => e.symbol === "VOO")!, allocation: 70 },
  { ...ETFS.find((e) => e.symbol === "QQQ")!, allocation: 30 },
];

// Editable list of ETF/stock holdings with allocation sliders. Allocations are
// rebalanced proportionally so they always sum to 100%.
export function HoldingsEditor({
  holdings,
  onChange,
}: {
  holdings: Holding[];
  onChange: (holdings: Holding[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const totalAllocation = holdings.reduce((s, h) => s + h.allocation, 0);

  const updateAllocation = (symbol: string, newPct: number) => {
    const others = holdings.filter((h) => h.symbol !== symbol);
    const remaining = 100 - newPct;
    const sumOthers = others.reduce((s, h) => s + h.allocation, 0);
    onChange(
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
      onChange(remaining);
      return;
    }
    onChange(remaining.map((h) => ({ ...h, allocation: (h.allocation / sum) * 100 })));
  };

  const addHolding = (h: Omit<Holding, "allocation">) => {
    if (holdings.some((x) => x.symbol === h.symbol)) return;
    const each = 100 / (holdings.length + 1);
    onChange([
      ...holdings.map((x) => ({ ...x, allocation: each })),
      { ...h, allocation: each },
    ]);
    setShowAdd(false);
  };

  return (
    <>
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
    </>
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
