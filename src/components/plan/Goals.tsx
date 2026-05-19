"use client";

import { useState, useMemo } from "react";
import { Target, Plus, Trash2, Home, Heart, GraduationCap, Plane, Shield, Pause, Car, Wallet } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUser, type SavingsGoal } from "@/lib/UserContext";
import { formatCurrency } from "@/lib/format";

const CATEGORIES: { id: SavingsGoal["category"]; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "house", label: "Home", icon: Home },
  { id: "wedding", label: "Wedding", icon: Heart },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "emergency", label: "Emergency Fund", icon: Shield },
  { id: "sabbatical", label: "Sabbatical", icon: Pause },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "other", label: "Other", icon: Wallet },
];

export function Goals() {
  const { profile, updateProfile } = useUser();
  const goals: SavingsGoal[] = useMemo(() => profile.goals ?? [], [profile.goals]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Partial<SavingsGoal>>({
    name: "", targetAmount: 50_000, targetDate: oneYearFromNow(),
    currentAmount: 0, monthlyContribution: 500, category: "other",
  });

  const addGoal = () => {
    if (!draft.name?.trim()) return;
    const g: SavingsGoal = {
      id: `${Date.now()}`, name: draft.name!.trim(),
      targetAmount: draft.targetAmount ?? 0, targetDate: draft.targetDate!,
      currentAmount: draft.currentAmount ?? 0, monthlyContribution: draft.monthlyContribution ?? 0,
      category: draft.category!, createdAt: new Date().toISOString(),
    };
    updateProfile({ goals: [...goals, g] });
    setAdding(false);
    setDraft({ name: "", targetAmount: 50_000, targetDate: oneYearFromNow(), currentAmount: 0, monthlyContribution: 500, category: "other" });
  };
  const removeGoal = (id: string) => updateProfile({ goals: goals.filter((g) => g.id !== id) });

  const totals = useMemo(() => ({
    target: goals.reduce((s, g) => s + g.targetAmount, 0),
    saved: goals.reduce((s, g) => s + g.currentAmount, 0),
    monthly: goals.reduce((s, g) => s + g.monthlyContribution, 0),
  }), [goals]);

  return (
    <PlanLayout
      title="Goal Planner"
      icon={<Target size={28} />}
      subtitle="Track every savings goal in one place — house deposit, wedding, sabbatical, kid's college. See what's on track and what needs more love."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Total Saved</CardTitle>
          <StatValue size="lg" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(totals.saved, true)}</StatValue>
        </Card>
        <Card>
          <CardTitle>Total Goal</CardTitle>
          <StatValue size="lg">{formatCurrency(totals.target, true)}</StatValue>
        </Card>
        <Card>
          <CardTitle>Monthly Savings</CardTitle>
          <StatValue size="lg">{formatCurrency(totals.monthly)}</StatValue>
        </Card>
        <Card>
          <CardTitle>Active Goals</CardTitle>
          <StatValue size="lg">{goals.length}</StatValue>
        </Card>
      </div>

      <div className="space-y-3">
        {goals.map((g) => (
          <GoalCard key={g.id} goal={g} onRemove={() => removeGoal(g.id)} />
        ))}
      </div>

      {adding ? (
        <Card glow>
          <CardTitle>New Goal</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <Field label="Goal Name">
              <input type="text" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Down payment, Honeymoon..." className="bg-transparent text-white outline-none w-full" autoFocus />
            </Field>
            <Field label="Category">
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as SavingsGoal["category"] })} className="bg-transparent text-white outline-none w-full appearance-none">
                {CATEGORIES.map((c) => <option key={c.id} value={c.id} className="bg-[var(--card)]">{c.label}</option>)}
              </select>
            </Field>
            <Field label="Target Amount">
              <CurrencyInput value={draft.targetAmount ?? 0} onChange={(v) => setDraft({ ...draft, targetAmount: v })} />
            </Field>
            <Field label="Already Saved">
              <CurrencyInput value={draft.currentAmount ?? 0} onChange={(v) => setDraft({ ...draft, currentAmount: v })} />
            </Field>
            <Field label="Monthly Contribution">
              <CurrencyInput value={draft.monthlyContribution ?? 0} onChange={(v) => setDraft({ ...draft, monthlyContribution: v })} />
            </Field>
            <Field label="Target Date">
              <input type="date" value={draft.targetDate} onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })} className="bg-transparent text-white outline-none w-full" />
            </Field>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={addGoal} className="flex-1">Save Goal</Button>
            <Button variant="ghost" onClick={() => setAdding(false)} className="flex-1">Cancel</Button>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setAdding(true)} className="w-full">
          <Plus size={16} className="inline mr-2" /> Add Goal
        </Button>
      )}

      {goals.length === 0 && !adding && (
        <Card className="text-center py-10 text-[var(--text-muted)]">
          No goals yet. Add one above to start tracking.
        </Card>
      )}
    </PlanLayout>
  );
}

function GoalCard({ goal, onRemove }: { goal: SavingsGoal; onRemove: () => void }) {
  const cat = CATEGORIES.find((c) => c.id === goal.category) ?? CATEGORIES[CATEGORIES.length - 1];
  const Icon = cat.icon;
  const pct = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
  const monthsLeft = Math.max(0, monthsBetween(new Date().toISOString().slice(0, 10), goal.targetDate));
  const projected = goal.currentAmount + goal.monthlyContribution * monthsLeft;
  const onTrack = projected >= goal.targetAmount;
  const shortfall = Math.max(0, goal.targetAmount - projected);
  const neededMonthly = monthsLeft > 0 ? (goal.targetAmount - goal.currentAmount) / monthsLeft : 0;

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-[var(--green-muted)] p-2.5 shrink-0">
          <Icon size={20} className="text-[var(--green)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-white text-base">{goal.name}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                Target {goal.targetDate} · {monthsLeft} mo left
              </div>
            </div>
            <button onClick={onRemove} className="text-[var(--text-muted)] hover:text-[var(--red)] transition p-1">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-[var(--text-secondary)]">
                {formatCurrency(goal.currentAmount, true)} of {formatCurrency(goal.targetAmount, true)}
              </span>
              <span className={`text-xs font-bold ${onTrack ? "text-[var(--green)]" : "text-[var(--yellow)]"}`}>
                {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div className="h-full bg-[var(--green)] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
            <div>
              <div className="text-[var(--text-muted)]">Saving /mo</div>
              <div className="text-white font-semibold mt-0.5">{formatCurrency(goal.monthlyContribution)}</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)]">Projected</div>
              <div className={`font-semibold mt-0.5 ${onTrack ? "text-[var(--green)]" : "text-[var(--yellow)]"}`}>{formatCurrency(projected, true)}</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)]">{onTrack ? "Surplus" : "Need /mo"}</div>
              <div className={`font-semibold mt-0.5 ${onTrack ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                {onTrack ? `+${formatCurrency(projected - goal.targetAmount, true)}` : formatCurrency(neededMonthly)}
              </div>
            </div>
          </div>

          {!onTrack && monthsLeft > 0 && (
            <div className="mt-3 text-xs text-[var(--yellow)] rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2.5">
              You&apos;re short {formatCurrency(shortfall, true)} at current pace. Bump monthly to {formatCurrency(neededMonthly)} to hit target.
            </div>
          )}
        </div>
      </div>
    </Card>
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

function oneYearFromNow(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function monthsBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}
