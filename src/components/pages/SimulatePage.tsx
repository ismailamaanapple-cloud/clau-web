"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { WhatIfMode } from "@/components/simulate/WhatIfMode";
import { MonteCarloMode } from "@/components/simulate/MonteCarloMode";
import { NetWorthMode } from "@/components/simulate/NetWorthMode";
import { LoansMode } from "@/components/simulate/LoansMode";
import { cn } from "@/lib/cn";
import { Sparkles, TrendingUp, Home as HomeIcon, GraduationCap } from "lucide-react";

type Mode = "what-if" | "monte-carlo" | "net-worth" | "loans";

const MODES: { id: Mode; label: string; shortLabel: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "what-if", label: "What If", shortLabel: "What If", icon: Sparkles },
  { id: "monte-carlo", label: "Monte Carlo", shortLabel: "Monte Carlo", icon: TrendingUp },
  { id: "net-worth", label: "Net Worth Timeline", shortLabel: "Net Worth", icon: HomeIcon },
  { id: "loans", label: "Student Loans", shortLabel: "Loans", icon: GraduationCap },
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

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Simulate</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
          Stress-test scenarios, compare strategies, and visualize the impact of small habits.
        </p>
      </header>

      <Card className="!p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-1.5 rounded-xl text-xs sm:text-sm font-semibold transition",
                  active
                    ? "bg-[var(--green-muted)] text-[var(--green)]"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--card-hover)]"
                )}
              >
                <Icon size={16} />
                <span className="sm:hidden">{m.shortLabel}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {mode === "what-if" && <WhatIfMode />}
      {mode === "monte-carlo" && <MonteCarloMode />}
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
