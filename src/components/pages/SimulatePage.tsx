"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { WhatIfMode } from "@/components/simulate/WhatIfMode";
import { MonteCarloMode } from "@/components/simulate/MonteCarloMode";
import { NetWorthMode } from "@/components/simulate/NetWorthMode";
import { LoansMode } from "@/components/simulate/LoansMode";
import { CoastFireMode } from "@/components/simulate/CoastFireMode";
import { SavingsRateMode } from "@/components/simulate/SavingsRateMode";
import { SequenceRiskMode } from "@/components/simulate/SequenceRiskMode";
import { cn } from "@/lib/cn";
import { Sparkles, TrendingUp, Home as HomeIcon, GraduationCap, Anchor, Percent, AlertTriangle, Info } from "lucide-react";

type Mode = "what-if" | "monte-carlo" | "coast-fire" | "savings-rate" | "sequence-risk" | "net-worth" | "loans";

interface ModeDef {
  id: Mode;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
}

const MODES: ModeDef[] = [
  {
    id: "what-if",
    label: "What If",
    icon: Sparkles,
    description: "See how small daily habits compound over decades. Skip the latte, raise your contribution, work an extra year — watch how each tiny change moves your finish line.",
  },
  {
    id: "monte-carlo",
    label: "Monte Carlo",
    icon: TrendingUp,
    description: "Run 500 random market simulations to stress-test your plan. Instead of one rosy projection, see the range of outcomes and your real probability of success.",
  },
  {
    id: "coast-fire",
    label: "Coast FIRE",
    icon: Anchor,
    description: "The number you need invested today so you never have to contribute another dollar — growth alone gets you to FIRE. Also covers Barista FIRE for part-time work plans.",
  },
  {
    id: "savings-rate",
    label: "Savings Rate",
    icon: Percent,
    description: "The single most important chart in personal finance: your savings rate (not your salary) determines how many years until you can retire. Plot your spot on the curve.",
  },
  {
    id: "sequence-risk",
    label: "Sequence Risk",
    icon: AlertTriangle,
    description: "Same average return, very different outcomes. A 2008-style crash in year 1 of retirement does massively more damage than the same crash in year 20. Stress-test for it.",
  },
  {
    id: "net-worth",
    label: "Net Worth Timeline",
    icon: HomeIcon,
    description: "Plan major purchases and life events on a timeline. See how a house, sabbatical, or kid affects your long-term net worth and FIRE date.",
  },
  {
    id: "loans",
    label: "Student Loans",
    icon: GraduationCap,
    description: "Pay off student loans aggressively or invest the difference? Compare both strategies side-by-side with your specific balance, rate, and income.",
  },
];

function SimulateInner() {
  const params = useSearchParams();
  const initialMode = (params.get("mode") as Mode) || "what-if";
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    const m = params.get("mode") as Mode;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (m && MODES.some((x) => x.id === m)) setMode(m);
  }, [params]);

  const current = MODES.find((m) => m.id === mode)!;

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Simulate</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
          Stress-test scenarios, compare strategies, and visualize the impact of small habits.
        </p>
      </header>

      {/* Single-row scrollable tab bar */}
      <Card className="!p-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0",
                  active
                    ? "bg-[var(--green-muted)] text-[var(--green)]"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--card-hover)]"
                )}
              >
                <Icon size={16} />
                {m.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Mode description */}
      <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 flex items-start gap-3">
        <div className="rounded-lg bg-[var(--green-muted)] p-1.5 shrink-0 mt-0.5">
          <Info className="text-[var(--green)]" size={16} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{current.label}</div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-0.5">{current.description}</p>
        </div>
      </div>

      {mode === "what-if" && <WhatIfMode />}
      {mode === "monte-carlo" && <MonteCarloMode />}
      {mode === "coast-fire" && <CoastFireMode />}
      {mode === "savings-rate" && <SavingsRateMode />}
      {mode === "sequence-risk" && <SequenceRiskMode />}
      {mode === "net-worth" && <NetWorthMode />}
      {mode === "loans" && <LoansMode />}
    </div>
  );
}

export function SimulatePage() {
  return (
    <Suspense fallback={<Card>Loading…</Card>}>
      <SimulateInner />
    </Suspense>
  );
}
