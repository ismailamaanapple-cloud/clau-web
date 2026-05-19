"use client";

import { useState, useMemo } from "react";
import { LineChart as LineIcon, Plus, Trash2, TrendingUp } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUser, type NetWorthSnapshot } from "@/lib/UserContext";
import { formatCurrency, formatPercent } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function NetWorthHistory() {
  const { profile, updateProfile } = useUser();
  const snaps: NetWorthSnapshot[] = useMemo(() => {
    const list = profile.netWorthSnapshots ?? [];
    return [...list].sort((a, b) => a.date.localeCompare(b.date));
  }, [profile.netWorthSnapshots]);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [assets, setAssets] = useState(profile.checking ?? 0);
  const [liabilities, setLiabilities] = useState(profile.mortgage ?? 0);
  const [note, setNote] = useState("");

  const add = () => {
    const snap: NetWorthSnapshot = {
      id: `${Date.now()}`,
      date, assets, liabilities, netWorth: assets - liabilities, note: note.trim() || undefined,
    };
    updateProfile({ netWorthSnapshots: [...snaps, snap] });
    setNote("");
  };
  const remove = (id: string) => updateProfile({ netWorthSnapshots: snaps.filter((s) => s.id !== id) });

  const first = snaps[0];
  const last = snaps[snaps.length - 1];
  const totalGrowth = first && last ? last.netWorth - first.netWorth : 0;
  const growthPct = first && first.netWorth > 0 ? (totalGrowth / first.netWorth) * 100 : 0;
  const monthsBetween = first && last ? Math.max(1, monthsDiff(first.date, last.date)) : 1;
  const monthlyAvg = totalGrowth / monthsBetween;

  return (
    <PlanLayout
      title="Net Worth Snapshots"
      icon={<LineIcon size={28} />}
      subtitle="Log a monthly snapshot, watch the trend, see how much progress you're actually making. Stored locally in your browser."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Current Net Worth</CardTitle>
          <StatValue size="xl">{formatCurrency(last?.netWorth ?? 0, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">{snaps.length} snapshot{snaps.length !== 1 && "s"} logged</p>
        </Card>
        <Card>
          <CardTitle>Total Growth</CardTitle>
          <StatValue size="lg" style={{ color: totalGrowth >= 0 ? "var(--green)" : "var(--red)" }} className="!text-current">
            {totalGrowth >= 0 ? "+" : ""}{formatCurrency(totalGrowth, true)}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Since first snapshot</p>
        </Card>
        <Card>
          <CardTitle>% Change</CardTitle>
          <StatValue size="lg" style={{ color: growthPct >= 0 ? "var(--green)" : "var(--red)" }} className="!text-current">
            {growthPct >= 0 ? "+" : ""}{formatPercent(growthPct, 1)}
          </StatValue>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={14} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">Avg / Month</CardTitle>
          </div>
          <StatValue size="lg">{formatCurrency(monthlyAvg, true)}</StatValue>
        </Card>
      </div>

      {snaps.length > 1 && (
        <Card>
          <CardTitle>Trend</CardTitle>
          <div className="h-64 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snaps} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--green)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
                <Area type="monotone" dataKey="netWorth" stroke="var(--green)" strokeWidth={2.5} fill="url(#nwFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Add Snapshot</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-white outline-none w-full" />
          </Field>
          <Field label="Assets">
            <CurrencyInput value={assets} onChange={setAssets} />
          </Field>
          <Field label="Liabilities">
            <CurrencyInput value={liabilities} onChange={setLiabilities} />
          </Field>
          <Field label="Net Worth">
            <span className="text-[var(--green)] font-bold">{formatCurrency(assets - liabilities, true)}</span>
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Note (optional)">
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bonus hit, market dip, etc." className="bg-transparent text-white outline-none w-full" />
          </Field>
        </div>
        <Button onClick={add} className="w-full mt-3">
          <Plus size={16} className="inline mr-2" /> Save Snapshot
        </Button>
      </Card>

      {snaps.length > 0 && (
        <Card>
          <CardTitle>All Snapshots</CardTitle>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-[var(--text-muted)] text-xs uppercase tracking-widest">
                  <th className="text-left px-2 py-2">Date</th>
                  <th className="text-right px-2 py-2">Assets</th>
                  <th className="text-right px-2 py-2">Liab.</th>
                  <th className="text-right px-2 py-2">Net Worth</th>
                  <th className="text-left px-2 py-2">Note</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {[...snaps].reverse().map((s) => (
                  <tr key={s.id} className="border-t border-[var(--border)]">
                    <td className="px-2 py-2 text-white font-semibold">{s.date}</td>
                    <td className="px-2 py-2 text-right text-[var(--text-secondary)]">{formatCurrency(s.assets, true)}</td>
                    <td className="px-2 py-2 text-right text-[var(--text-muted)]">{formatCurrency(s.liabilities, true)}</td>
                    <td className="px-2 py-2 text-right text-[var(--green)] font-semibold">{formatCurrency(s.netWorth, true)}</td>
                    <td className="px-2 py-2 text-[var(--text-secondary)] truncate max-w-xs">{s.note ?? "—"}</td>
                    <td className="px-2 py-2 text-right">
                      <button onClick={() => remove(s.id)} className="text-[var(--text-muted)] hover:text-[var(--red)] transition p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {snaps.length === 0 && (
        <Card className="text-center py-10 text-[var(--text-muted)]">
          No snapshots yet. Add one above to start tracking your net worth over time.
        </Card>
      )}
    </PlanLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function CurrencyInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[var(--text-secondary)] text-sm">$</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="bg-transparent text-white font-semibold outline-none w-full" />
    </div>
  );
}

function monthsDiff(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}
