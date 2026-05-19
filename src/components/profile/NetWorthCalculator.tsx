"use client";

import { useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { useUser, UserProfile } from "@/lib/UserContext";
import { formatCurrency } from "@/lib/format";
import { Home as HomeIcon, Banknote, Wallet, TrendingUp, PiggyBank, Car, Building2, Sparkles, FileText, GraduationCap, Receipt, CreditCard, Landmark, Coins } from "lucide-react";

interface FieldDef {
  key: keyof UserProfile;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  type: "asset" | "liability";
}

const FIELDS: FieldDef[] = [
  { key: "homeEquity", label: "Home Equity", icon: HomeIcon, type: "asset" },
  { key: "cashValue", label: "Cash & Savings", icon: Banknote, type: "asset" },
  { key: "checking", label: "Checking", icon: Wallet, type: "asset" },
  { key: "equitiesValue", label: "Stocks & Bonds", icon: TrendingUp, type: "asset" },
  { key: "retirement", label: "Retirement Accounts", icon: PiggyBank, type: "asset" },
  { key: "carValue", label: "Vehicle Value", icon: Car, type: "asset" },
  { key: "investmentRealEstate", label: "Investment Real Estate", icon: Building2, type: "asset" },
  { key: "otherAssets", label: "Other Assets", icon: Sparkles, type: "asset" },
  { key: "mortgage", label: "Mortgage", icon: FileText, type: "liability" },
  { key: "studentLoans", label: "Student Loans", icon: GraduationCap, type: "liability" },
  { key: "autoLoans", label: "Auto Loans", icon: Receipt, type: "liability" },
  { key: "creditCardDebt", label: "Credit Card Debt", icon: CreditCard, type: "liability" },
  { key: "personalLoans", label: "Personal Loans", icon: Landmark, type: "liability" },
  { key: "otherDebts", label: "Other Debts", icon: Coins, type: "liability" },
];

export function NetWorthCalculator({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useUser();
  const [values, setValues] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    FIELDS.forEach((f) => {
      v[f.key as string] = (profile[f.key] as number) ?? 0;
    });
    return v;
  });

  const assets = FIELDS.filter((f) => f.type === "asset").reduce((s, f) => s + (values[f.key as string] || 0), 0);
  const liabilities = FIELDS.filter((f) => f.type === "liability").reduce((s, f) => s + (values[f.key as string] || 0), 0);
  const net = assets - liabilities;

  const save = () => {
    const patch: Partial<UserProfile> = {};
    FIELDS.forEach((f) => {
      // @ts-expect-error key indexing
      patch[f.key] = values[f.key as string];
    });
    updateProfile(patch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <CardTitle>Calculate Net Worth</CardTitle>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white">✕</button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Add each asset and liability. We&apos;ll calculate your net worth and save it to your profile.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
          <div className="rounded-xl bg-[var(--green-muted)] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[var(--green)]">Assets</div>
            <div className="font-bold text-white text-lg">{formatCurrency(assets)}</div>
          </div>
          <div className="rounded-xl bg-red-500/10 p-3">
            <div className="text-[10px] uppercase tracking-wider text-[var(--red)]">Liabilities</div>
            <div className="font-bold text-white text-lg">{formatCurrency(liabilities)}</div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-radial-green border border-[var(--green)] p-4 mb-5 text-center">
          <div className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Net Worth</div>
          <StatValue size="lg" className="neon-text">{formatCurrency(net)}</StatValue>
        </div>

        <Section title="Assets">
          {FIELDS.filter((f) => f.type === "asset").map((f) => (
            <Field key={f.key as string} field={f} value={values[f.key as string] || 0} onChange={(n) => setValues({ ...values, [f.key as string]: n })} />
          ))}
        </Section>

        <Section title="Liabilities">
          {FIELDS.filter((f) => f.type === "liability").map((f) => (
            <Field key={f.key as string} field={f} value={values[f.key as string] || 0} onChange={(n) => setValues({ ...values, [f.key as string]: n })} />
          ))}
        </Section>

        <div className="flex gap-2 mt-5 sticky bottom-0">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save}>Save Net Worth</Button>
        </div>
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ field, value, onChange }: { field: FieldDef; value: number; onChange: (n: number) => void }) {
  const Icon = field.icon;
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-[var(--surface-light)] flex items-center justify-center text-[var(--green)]">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-[var(--text-secondary)] mb-1">{field.label}</div>
        <NumberInput value={value} onChange={onChange} prefix="$" min={0} max={100_000_000} />
      </div>
    </div>
  );
}
