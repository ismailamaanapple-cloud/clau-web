"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PortfolioScenarios } from "@/components/invest/PortfolioScenarios";
import { CustomPortfolio } from "@/components/invest/CustomPortfolio";
import { cn } from "@/lib/cn";

export function InvestPage() {
  const [tab, setTab] = useState<"scenarios" | "custom">("scenarios");

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Invest</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
          Run scenarios on real ETFs and stocks — projections, dividends, and retirement income.
        </p>
      </header>

      <Card className="!p-2">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setTab("scenarios")}
            className={cn(
              "py-2.5 rounded-xl text-sm font-semibold transition",
              tab === "scenarios"
                ? "bg-[var(--green-muted)] text-[var(--green)]"
                : "text-[var(--text-secondary)] hover:text-white"
            )}
          >
            Portfolio Scenarios
          </button>
          <button
            onClick={() => setTab("custom")}
            className={cn(
              "py-2.5 rounded-xl text-sm font-semibold transition",
              tab === "custom"
                ? "bg-[var(--green-muted)] text-[var(--green)]"
                : "text-[var(--text-secondary)] hover:text-white"
            )}
          >
            Custom Portfolio
          </button>
        </div>
      </Card>

      {tab === "scenarios" ? <PortfolioScenarios /> : <CustomPortfolio />}
    </div>
  );
}
