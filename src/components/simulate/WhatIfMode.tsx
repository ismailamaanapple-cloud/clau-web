"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Coffee, Beer, Sparkles } from "lucide-react";

type Scenario = "coffee" | "bar" | "custom";

const PRESETS: Record<
  Scenario,
  {
    title: string;
    icon: React.ComponentType<{ size?: number }>;
    description: string;
    perEventCost: number;
    replacementCost: number;
    eventsPerWeek: number;
    label: string;
    replacementLabel: string;
  }
> = {
  coffee: {
    title: "$7 Starbucks vs $1 home coffee",
    icon: Coffee,
    description:
      "What if you replaced the daily coffee shop run with brewing at home? Invest the savings — see the result.",
    perEventCost: 7,
    replacementCost: 1,
    eventsPerWeek: 7,
    label: "Coffee shop cost",
    replacementLabel: "Home coffee cost",
  },
  bar: {
    title: "$100 weekend bar tab",
    icon: Beer,
    description: "What if those weekly nights out went into VTI instead?",
    perEventCost: 100,
    replacementCost: 0,
    eventsPerWeek: 1,
    label: "Cost per weekend",
    replacementLabel: "Replacement cost",
  },
  custom: {
    title: "Your habit, your choice",
    icon: Sparkles,
    description: "Set any per-event cost, replacement, and frequency.",
    perEventCost: 15,
    replacementCost: 0,
    eventsPerWeek: 5,
    label: "Habit cost",
    replacementLabel: "Replacement cost",
  },
};

export function WhatIfMode() {
  const [scenario, setScenario] = useState<Scenario>("coffee");
  const preset = PRESETS[scenario];
  const [perCost, setPerCost] = useState(preset.perEventCost);
  const [replacement, setReplacement] = useState(preset.replacementCost);
  const [perWeek, setPerWeek] = useState(preset.eventsPerWeek);
  const [years, setYears] = useState(30);
  const [annualReturn, setAnnualReturn] = useState(8);

  const reset = (s: Scenario) => {
    const p = PRESETS[s];
    setScenario(s);
    setPerCost(p.perEventCost);
    setReplacement(p.replacementCost);
    setPerWeek(p.eventsPerWeek);
  };

  const data = useMemo(() => {
    const weeklySavings = (perCost - replacement) * perWeek;
    const monthlySavings = (weeklySavings * 52) / 12;
    const r = annualReturn / 100 / 12;
    const months = years * 12;
    const points: { year: number; saved: number; invested: number }[] = [];
    let invested = 0;
    let totalSaved = 0;
    points.push({ year: 0, saved: 0, invested: 0 });
    for (let m = 1; m <= months; m++) {
      invested = invested * (1 + r) + monthlySavings;
      totalSaved += monthlySavings;
      if (m % 12 === 0) {
        points.push({ year: m / 12, saved: totalSaved, invested });
      }
    }
    return { points, weeklySavings, monthlySavings };
  }, [perCost, replacement, perWeek, years, annualReturn]);

  const final = data.points[data.points.length - 1];
  const gains = (final?.invested ?? 0) - (final?.saved ?? 0);

  return (
    <div className="space-y-6">
      {/* Scenario picker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(Object.keys(PRESETS) as Scenario[]).map((s) => {
          const p = PRESETS[s];
          const Icon = p.icon;
          const active = scenario === s;
          return (
            <button
              key={s}
              onClick={() => reset(s)}
              className={cn(
                "text-left p-5 rounded-2xl border transition",
                active
                  ? "border-[var(--green)] bg-[var(--green-muted)]"
                  : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]"
              )}
            >
              <Icon size={22} />
              <h3 className="font-bold text-white mt-2">{p.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{p.description}</p>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Final Value (Invested)</CardTitle>
          <StatValue size="xl" className="neon-text">{formatCurrency(final?.invested ?? 0)}</StatValue>
          <p className="text-sm text-[var(--text-secondary)] mt-2">after {years} years at {annualReturn}%</p>
        </Card>
        <Card>
          <CardTitle>Total Saved</CardTitle>
          <StatValue>{formatCurrency(final?.saved ?? 0)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatCurrency(data.monthlySavings)}/mo · {formatCurrency(data.weeklySavings)}/wk
          </p>
        </Card>
        <Card>
          <CardTitle>Investment Gains</CardTitle>
          <StatValue className="text-[var(--green-light)]">{formatCurrency(gains)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Compound interest doing its job.</p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardTitle>{years}-Year Growth</CardTitle>
        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="whatIfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 13 }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Area type="monotone" dataKey="invested" stroke="var(--green)" strokeWidth={2.5} fill="url(#whatIfGrad)" />
              <Area type="monotone" dataKey="saved" stroke="var(--text-muted)" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Solid line: invested + compound. Dashed: cash saved only.
        </p>
      </Card>

      {/* Controls */}
      <Card>
        <CardTitle>Adjust the scenario</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Slider label={preset.label} value={perCost} onChange={setPerCost} min={0} max={500} step={1} prefix="$" />
          <Slider label={preset.replacementLabel} value={replacement} onChange={setReplacement} min={0} max={500} step={1} prefix="$" />
          <Slider label="Times per week" value={perWeek} onChange={setPerWeek} min={1} max={21} step={1} />
          <Slider label="Years" value={years} onChange={setYears} min={1} max={50} step={1} suffix=" years" />
          <Slider label="Annual Return" value={annualReturn} onChange={setAnnualReturn} min={2} max={15} step={0.5} suffix="%" />
        </div>
      </Card>
    </div>
  );
}
