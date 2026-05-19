"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { Building2, Home as HomeIcon, KeyRound, PiggyBank, RefreshCw, LayoutGrid } from "lucide-react";
import { RentalCalcMode } from "@/components/property/RentalCalcMode";
import { BuyVsRentMode } from "@/components/property/BuyVsRentMode";
import { MortgagePayoffMode } from "@/components/property/MortgagePayoffMode";
import { RefinanceMode } from "@/components/property/RefinanceMode";
import { MultiPropertyMode } from "@/components/property/MultiPropertyMode";

type Mode = "rental" | "buy-vs-rent" | "payoff" | "refinance" | "multi";

const MODES: { id: Mode; label: string; shortLabel: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "rental", label: "Rental Calculator", shortLabel: "Rental", icon: HomeIcon },
  { id: "buy-vs-rent", label: "Buy vs Rent", shortLabel: "Buy vs Rent", icon: KeyRound },
  { id: "payoff", label: "Payoff vs Invest", shortLabel: "Payoff", icon: PiggyBank },
  { id: "refinance", label: "Refinance", shortLabel: "Refi", icon: RefreshCw },
  { id: "multi", label: "Multi-Property", shortLabel: "Portfolio", icon: LayoutGrid },
];

export function PropertyPage() {
  const [mode, setMode] = useState<Mode>("rental");

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Building2 className="text-[var(--green)]" size={32} /> Property
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
          Underwrite rentals, compare buy vs rent, plan payoffs and refinances — all in one place.
        </p>
      </header>

      <Card className="!p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
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

      {mode === "rental" && <RentalCalcMode />}
      {mode === "buy-vs-rent" && <BuyVsRentMode />}
      {mode === "payoff" && <MortgagePayoffMode />}
      {mode === "refinance" && <RefinanceMode />}
      {mode === "multi" && <MultiPropertyMode />}
    </div>
  );
}
