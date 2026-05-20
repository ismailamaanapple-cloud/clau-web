"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { runMonteCarlo, MonteCarloResult } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

export function MonteCarloMode() {
  const params = useSearchParams();
  const [initial, setInitial] = useState(() => Number(params.get("initial")) || 100_000);
  const [contribution, setContribution] = useState(() => Number(params.get("contrib")) || 24_000);
  const [yearsToRetire, setYearsToRetire] = useState(() => Number(params.get("years")) || 25);
  const [yearsInRetirement, setYearsInRetirement] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(() => Number(params.get("ret")) || 8);
  const [volatility, setVolatility] = useState(15);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const r = runMonteCarlo({
        initial,
        annualContribution: contribution,
        yearsToRetire,
        yearsInRetirement,
        expectedReturnPct: expectedReturn,
        volatilityPct: volatility,
        withdrawalRatePct: withdrawalRate,
        runs: 500,
      });
      setResult(r);
      setRunning(false);
    }, 100);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Chart data combines percentile bands per year — much cleaner than 500 lines.
  const chartData = useMemo(() => {
    if (!result) return [];
    return result.bands.map((b) => ({
      year: b.year,
      p10: b.p10,
      p25: b.p25,
      p50: b.p50,
      p75: b.p75,
      p90: b.p90,
      // Recharts stacks area "to" values; we'll render two stacked invisible Areas
      // for the bands. For 10-90: range = p90 - p10; for 25-75: range = p75 - p25
      range90: b.p90 - b.p10,
      range50: b.p75 - b.p25,
    }));
  }, [result]);

  const successColor =
    !result ? "white" :
    result.successRate >= 85 ? "var(--green)" :
    result.successRate >= 65 ? "var(--yellow)" : "var(--red)";

  return (
    <div className="space-y-6">
      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Card glow className="col-span-2 md:col-span-1 bg-gradient-radial-green">
              <CardTitle>Success Rate</CardTitle>
              <StatValue size="xl" style={{ color: successColor }} className="!text-current">
                {formatPercent(result.successRate, 0)}
              </StatValue>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {result.successCount} of {result.totalRuns} simulations succeeded
              </p>
            </Card>
            <Card>
              <CardTitle>Median Outcome</CardTitle>
              <StatValue>{formatCurrency(result.percentiles.p50, true)}</StatValue>
              <p className="text-xs text-[var(--text-muted)] mt-1">50th percentile final value</p>
            </Card>
            <Card>
              <CardTitle>10th / 90th</CardTitle>
              <div className="text-lg font-bold text-white">
                <span className="text-[var(--red)]">{formatCurrency(result.percentiles.p10, true)}</span>{" "}
                <span className="text-[var(--text-muted)] mx-1">/</span>{" "}
                <span className="text-[var(--green)]">{formatCurrency(result.percentiles.p90, true)}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">Bad-case / good-case range</p>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <CardTitle>Outcome Distribution · 500 simulations</CardTitle>
              <div className="text-xs text-[var(--text-muted)]">
                Retirement starts year {yearsToRetire}
              </div>
            </div>

            {/* Legend chips */}
            <div className="flex flex-wrap items-center gap-3 mb-2 text-[11px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "var(--green)", opacity: 0.18 }} /> 10th – 90th percentile
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "var(--green)", opacity: 0.4 }} /> 25th – 75th
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-0.5" style={{ background: "var(--green)" }} /> Median (50th)
              </span>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mc-band-90" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="mc-band-50" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickLine={false} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} />
                  <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }}
                    labelFormatter={(y) => `Year ${y}`}
                    formatter={(v: unknown, name: unknown) => {
                      const label = String(name);
                      // skip our hidden lower-band lines from tooltip
                      if (label === "_p10" || label === "_p25") return null as unknown as [string, string];
                      const map: Record<string, string> = { p50: "Median", p75: "75th", p90: "90th (best)" };
                      return [formatCurrency(Number(v)), map[label] ?? label];
                    }}
                  />
                  <ReferenceLine x={yearsToRetire} stroke="var(--yellow)" strokeDasharray="4 4" label={{ value: "Retire", fill: "var(--yellow)", fontSize: 10, position: "top" }} />

                  {/* Stacked-area trick: render the lower bound invisible, then the band on top */}
                  <Area type="monotone" dataKey="p10" stroke="none" fill="transparent" stackId="a" />
                  <Area type="monotone" dataKey="range90" stroke="none" fill="url(#mc-band-90)" stackId="a" />
                  <Area type="monotone" dataKey="p25" stroke="none" fill="transparent" stackId="b" />
                  <Area type="monotone" dataKey="range50" stroke="none" fill="url(#mc-band-50)" stackId="b" />

                  <Line type="monotone" dataKey="p50" stroke="var(--green)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              The shaded bands show where 50% (darker) and 80% (lighter) of all 500 simulated outcomes fall in each year. The line is the median.
            </p>
          </Card>
        </>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <CardTitle>Inputs</CardTitle>
          <Button onClick={run} size="sm" disabled={running}>
            {running ? "Running…" : "Run 500 Simulations"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Slider label="Initial Investment" value={initial} onChange={setInitial} min={0} max={5_000_000} step={1000} prefix="$" />
          <Slider label="Annual Contribution" value={contribution} onChange={setContribution} min={0} max={500_000} step={500} prefix="$" />
          <Slider label="Years to Retirement" value={yearsToRetire} onChange={setYearsToRetire} min={1} max={50} step={1} suffix=" years" />
          <Slider label="Years in Retirement" value={yearsInRetirement} onChange={setYearsInRetirement} min={5} max={50} step={1} suffix=" years" />
          <Slider label="Expected Annual Return" value={expectedReturn} onChange={setExpectedReturn} min={2} max={15} step={0.5} suffix="%" />
          <Slider label="Volatility (std dev)" value={volatility} onChange={setVolatility} min={5} max={30} step={0.5} suffix="%" />
          <Slider label="Withdrawal Rate" value={withdrawalRate} onChange={setWithdrawalRate} min={2} max={8} step={0.25} suffix="%" />
        </div>
      </Card>
    </div>
  );
}
