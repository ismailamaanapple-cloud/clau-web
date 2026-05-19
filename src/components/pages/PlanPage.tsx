"use client";

import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";
import {
  Wrench, Layers, PieChart, ArrowRightLeft, BarChart3, Target, LineChart, TrendingDown, DollarSign, Banknote, HeartPulse,
} from "lucide-react";

const TOOLS = [
  {
    section: "Taxes & Accounts",
    items: [
      { href: "/plan/account-waterfall", icon: Layers, title: "Account Waterfall", desc: "Where should my next dollar go? 401k match → HSA → Roth → backdoor → brokerage." },
      { href: "/plan/tax-brackets", icon: PieChart, title: "Tax Bracket Visualizer", desc: "Interactive federal + state bracket chart. See effective vs marginal rates." },
      { href: "/plan/roth-conversion", icon: ArrowRightLeft, title: "Roth Conversion Ladder", desc: "Year-by-year plan to move money from traditional to Roth with the 5-year wait." },
      { href: "/plan/withdrawal-strategy", icon: BarChart3, title: "Withdrawal Strategy", desc: "In retirement: which buckets do you draw from first, and what's the tax bill?" },
    ],
  },
  {
    section: "Tracking & Goals",
    items: [
      { href: "/plan/net-worth-history", icon: LineChart, title: "Net Worth Snapshots", desc: "Log monthly snapshots, watch the trend over time." },
      { href: "/plan/goals", icon: Target, title: "Goal Planner", desc: "Track multiple savings goals — house, wedding, sabbatical, college." },
    ],
  },
  {
    section: "Quick Utilities",
    items: [
      { href: "/plan/inflation", icon: TrendingDown, title: "Inflation Calculator", desc: "What's $1M today worth in 30 years? Real-vs-nominal value, both directions." },
      { href: "/plan/salary-impact", icon: DollarSign, title: "Raise Impact", desc: "How much does a $10K raise move your FIRE date?" },
      { href: "/plan/bond-ladder", icon: Banknote, title: "Bond / T-Bill Ladder", desc: "Build a 4-rung ladder, see annual income and effective yield." },
      { href: "/plan/healthcare", icon: HeartPulse, title: "Healthcare Bridge", desc: "Pre-Medicare cost estimator with ACA subsidies based on MAGI." },
    ],
  },
];

export function PlanPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Wrench className="text-[var(--green)]" size={32} /> Plan
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
          The full toolkit: taxes, accounts, goal tracking, and quick calculators for the questions personal finance keeps throwing at you.
        </p>
      </header>

      {TOOLS.map((section) => (
        <section key={section.section}>
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-3">{section.section}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:bg-[var(--card-hover)] cursor-pointer transition group h-full">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-[var(--green-muted)] p-2 shrink-0">
                        <Icon className="text-[var(--green)]" size={18} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="!mb-1 !normal-case !tracking-normal !text-white !text-base group-hover:text-[var(--green)] transition">{item.title}</CardTitle>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
