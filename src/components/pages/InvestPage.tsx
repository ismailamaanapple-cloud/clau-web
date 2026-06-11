"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PortfolioScenarios } from "@/components/invest/PortfolioScenarios";
import { CustomPortfolio } from "@/components/invest/CustomPortfolio";
import { IncomeGoal } from "@/components/invest/IncomeGoal";
import { cn } from "@/lib/cn";

type Tab = "scenarios" | "custom" | "goal";

const TABS: { id: Tab; label: string }[] = [
  { id: "scenarios", label: "Portfolio Scenarios" },
  { id: "custom", label: "Custom Portfolio" },
  { id: "goal", label: "Income Goal" },
];

export function InvestPage() {
  const [tab, setTab] = useState<Tab>("scenarios");

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Invest</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
          Run scenarios on real ETFs and stocks — projections, dividends, and retirement income.
        </p>
      </header>

      <Card className="!p-2">
        <div className="grid grid-cols-3 gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition",
                tab === t.id
                  ? "bg-[var(--green-muted)] text-[var(--green)]"
                  : "text-[var(--text-secondary)] hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {tab === "scenarios" && <PortfolioScenarios />}
      {tab === "custom" && <CustomPortfolio />}
      {tab === "goal" && <IncomeGoal />}
    </div>
  );
}
