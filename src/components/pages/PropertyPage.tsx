"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { Building2, Home as HomeIcon, KeyRound, PiggyBank, RefreshCw, LayoutGrid, Info } from "lucide-react";
import { RentalCalcMode } from "@/components/property/RentalCalcMode";
import { BuyVsRentMode } from "@/components/property/BuyVsRentMode";
import { MortgagePayoffMode } from "@/components/property/MortgagePayoffMode";
import { RefinanceMode } from "@/components/property/RefinanceMode";
import { MultiPropertyMode } from "@/components/property/MultiPropertyMode";

type Mode = "rental" | "buy-vs-rent" | "payoff" | "refinance" | "multi";

interface ModeDef {
  id: Mode;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
}

const MODES: ModeDef[] = [
  {
    id: "rental",
    label: "Rental Calculator",
    icon: HomeIcon,
    description: "Underwrite a rental purchase end-to-end: cash flow after every expense, cap rate, cash-on-cash return, and a head-to-head with putting the same cash in stocks.",
  },
  {
    id: "buy-vs-rent",
    label: "Buy vs Rent",
    icon: KeyRound,
    description: "Should you buy a home to live in, or rent and invest the down payment? Models opportunity cost, equity buildup, tax deductions, and shows the break-even year.",
  },
  {
    id: "payoff",
    label: "Payoff vs Invest",
    icon: PiggyBank,
    description: "Pay extra on the mortgage to kill it early, or send that money to the market? Compares both strategies over your full loan term.",
  },
  {
    id: "refinance",
    label: "Refinance",
    icon: RefreshCw,
    description: "Should you refinance? Calculates monthly savings, break-even months on closing costs, and lifetime interest saved — including cash-out scenarios.",
  },
  {
    id: "multi",
    label: "Multi-Property",
    icon: LayoutGrid,
    description: "Track multiple rentals in one place. See combined cash flow, total portfolio value, and per-unit performance. Add and remove units on the fly.",
  },
];

export function PropertyPage() {
  const [mode, setMode] = useState<Mode>("rental");
  const current = MODES.find((m) => m.id === mode)!;

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
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5">
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

      {mode === "rental" && <RentalCalcMode />}
      {mode === "buy-vs-rent" && <BuyVsRentMode />}
      {mode === "payoff" && <MortgagePayoffMode />}
      {mode === "refinance" && <RefinanceMode />}
      {mode === "multi" && <MultiPropertyMode />}
    </div>
  );
}
