"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EDUCATION_TOPICS, CATEGORY_COLORS, EducationTopic } from "@/lib/data/education";
import { cn } from "@/lib/cn";
import { Clock, ArrowRight } from "lucide-react";

type Category = EducationTopic["category"] | "All";

const CATEGORIES: Category[] = [
  "All",
  "ETFs",
  "Bonds",
  "FIRE",
  "Strategy",
  "Portfolios",
  "Accounts",
  "Risk",
  "Advanced",
];

export function LearnPage() {
  const [active, setActive] = useState<Category>("All");
  const filtered =
    active === "All" ? EDUCATION_TOPICS : EDUCATION_TOPICS.filter((t) => t.category === active);

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Learn</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
          Bite-sized articles on investing, ETFs, bonds, FIRE, and portfolio strategy.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const isActive = c === active;
          const color = c === "All" ? "var(--green)" : CATEGORY_COLORS[c as EducationTopic["category"]];
          return (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition",
                isActive
                  ? "text-black"
                  : "text-[var(--text-secondary)] border-[var(--border)] hover:text-white"
              )}
              style={{
                background: isActive ? color : undefined,
                borderColor: isActive ? color : undefined,
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const color = CATEGORY_COLORS[t.category];
          return (
            <Link key={t.id} href={`/learn/${t.id}`}>
              <Card className="h-full hover:bg-[var(--card-hover)] cursor-pointer transition group flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                    style={{ color, background: `${color}22` }}
                  >
                    {t.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    <Clock size={11} /> {t.readMinutes} min
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-[var(--green)] transition leading-snug">
                  {t.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed flex-1">
                  {t.summary}
                </p>
                <div className="mt-4 flex items-center text-xs text-[var(--text-muted)] group-hover:text-[var(--green)] transition">
                  Read <ArrowRight size={12} className="ml-1" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
