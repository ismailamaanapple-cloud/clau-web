"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { useUser } from "@/lib/UserContext";
import { formatCurrency } from "@/lib/format";
import { Pencil, LogOut, FileText, Shield, Calculator, Home as HomeIcon, Car, Wallet, TrendingUp } from "lucide-react";
import { NetWorthCalculator } from "@/components/profile/NetWorthCalculator";

export function ProfilePage() {
  const { profile, updateProfile, resetProfile } = useUser();
  const [editing, setEditing] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const [name, setName] = useState(profile.name ?? "");
  const [age, setAge] = useState(profile.age ?? 30);
  const [house, setHouse] = useState(profile.houseValue ?? 0);
  const [car, setCar] = useState(profile.carValue ?? 0);
  const [cash, setCash] = useState(profile.cashValue ?? 0);
  const [equities, setEquities] = useState(profile.equitiesValue ?? 0);

  const netWorthBreakdown = useMemo(() => {
    // Prefer detailed homeEquity if set, otherwise fall back to houseValue
    const homeAsset = profile.homeEquity && profile.homeEquity > 0 ? profile.homeEquity : profile.houseValue ?? 0;
    const assets =
      homeAsset +
      (profile.cashValue ?? 0) +
      (profile.checking ?? 0) +
      (profile.equitiesValue ?? 0) +
      (profile.retirement ?? 0) +
      (profile.carValue ?? 0) +
      (profile.investmentRealEstate ?? 0) +
      (profile.otherAssets ?? 0);
    const liabilities =
      (profile.mortgage ?? 0) +
      (profile.studentLoans ?? 0) +
      (profile.autoLoans ?? 0) +
      (profile.creditCardDebt ?? 0) +
      (profile.personalLoans ?? 0) +
      (profile.otherDebts ?? 0);
    return { assets, liabilities, net: assets - liabilities };
  }, [profile]);

  const netWorth = netWorthBreakdown.net;

  const save = () => {
    updateProfile({ name, age, houseValue: house, carValue: car, cashValue: cash, equitiesValue: equities });
    setEditing(false);
  };

  const initials = (profile.name ?? "C").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Profile</h1>
        <button
          onClick={() => { if (confirm("Sign out & reset all local data?")) resetProfile(); }}
          className="text-[var(--text-muted)] hover:text-[var(--red)]"
          title="Reset"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Identity */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-light)] flex items-center justify-center text-2xl font-black text-black">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[var(--surface-light)] border border-[var(--border-light)] rounded-lg px-3 py-1.5 text-white outline-none text-lg font-bold focus:border-[var(--green)]"
              />
            ) : (
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            )}
            <p className="text-sm text-[var(--text-secondary)]">
              {editing ? (
                <>
                  Age{" "}
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value || "0"))}
                    className="bg-[var(--surface-light)] border border-[var(--border-light)] rounded-lg px-2 py-1 text-white outline-none w-20 focus:border-[var(--green)]"
                  />
                </>
              ) : (
                `Age ${profile.age} · Retirement at ${profile.retirementAge}`
              )}
            </p>
          </div>
          <button
            onClick={() => (editing ? save() : setEditing(true))}
            className="rounded-xl bg-[var(--surface-light)] border border-[var(--border-light)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white"
          >
            {editing ? "Save" : <Pencil size={14} />}
          </button>
        </div>
      </Card>

      {/* Net Worth */}
      <Card glow className="bg-gradient-radial-green">
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Net Worth</CardTitle>
          <Button size="sm" variant="secondary" onClick={() => setCalcOpen(true)}>
            <Calculator size={14} className="inline mr-1" /> Recalculate
          </Button>
        </div>
        <StatValue size="xl" className="neon-text">{formatCurrency(netWorth)}</StatValue>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-lg bg-[var(--surface-light)] px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Assets</div>
            <div className="text-sm font-bold text-white">{formatCurrency(netWorthBreakdown.assets)}</div>
          </div>
          <div className="rounded-lg bg-[var(--surface-light)] px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Liabilities</div>
            <div className="text-sm font-bold text-[var(--red)]">{formatCurrency(netWorthBreakdown.liabilities)}</div>
          </div>
        </div>
      </Card>

      {/* Quick Assets */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Quick Assets</CardTitle>
          {editing && <Button size="sm" onClick={save}>Save</Button>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AssetField icon={<HomeIcon size={16} />} label="House Value" value={house} editing={editing} onChange={setHouse} />
          <AssetField icon={<Car size={16} />} label="Car Value" value={car} editing={editing} onChange={setCar} />
          <AssetField icon={<Wallet size={16} />} label="Cash" value={cash} editing={editing} onChange={setCash} />
          <AssetField icon={<TrendingUp size={16} />} label="Equities" value={equities} editing={editing} onChange={setEquities} />
        </div>
      </Card>

      {/* Legal */}
      <Card>
        <CardTitle>Legal</CardTitle>
        <div className="mt-2 divide-y divide-[var(--border)]">
          <Link href="/terms" className="flex items-center gap-3 py-3 text-[var(--text-secondary)] hover:text-white">
            <FileText size={18} /> Terms of Service
            <span className="ml-auto text-xs text-[var(--text-muted)]">→</span>
          </Link>
          <Link href="/privacy" className="flex items-center gap-3 py-3 text-[var(--text-secondary)] hover:text-white">
            <Shield size={18} /> Privacy Policy
            <span className="ml-auto text-xs text-[var(--text-muted)]">→</span>
          </Link>
        </div>
      </Card>

      <p className="text-center text-xs text-[var(--text-muted)]">
        CLAU is educational only — not financial advice.
      </p>

      {calcOpen && <NetWorthCalculator onClose={() => setCalcOpen(false)} />}
    </div>
  );
}

function AssetField({
  icon,
  label,
  value,
  onChange,
  editing,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (n: number) => void;
  editing: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
        <span className="text-[var(--green)]">{icon}</span> {label}
      </div>
      {editing ? (
        <NumberInput value={value} onChange={onChange} prefix="$" min={0} max={50_000_000} />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-light)] px-4 py-3 font-bold text-white">
          {formatCurrency(value)}
        </div>
      )}
    </div>
  );
}
