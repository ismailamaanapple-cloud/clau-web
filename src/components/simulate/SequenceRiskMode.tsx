"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { sequenceStressTest } from "@/lib/fireMath";
import { formatCurrency } from "@/lib/format";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend,
} from "recharts";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function SequenceRiskMode() {
  const [startBalance, setStartBalance] = useState(2_000_000);
  const [years, setYears] = useState(35);
  const [withdrawal, setWithdrawal] = useState(80_000);
  const [inflation, setInflation] = useState(3);
  const [baseReturn, setBaseReturn] = useState(7);
  const [crashYear, setCrashYear] = useState(2);
  const [crashSize, setCrashSize] = useState(-40);
  const [recovery, setRecovery] = useState(4);

  const result = useMemo(() => sequenceStressTest({
    startBalance,
    yearsInRetirement: years,
    annualWithdrawal: withdrawal,
    inflationPct: inflation,
    baseReturnPct: baseReturn,
    crashYear,
    crashMagnitudePct: crashSize,
    recoveryYears: recovery,
  }), [startBalance, years, withdrawal, inflation, baseReturn, crashYear, crashSize, recovery]);

  const chartData = result.baseline.series.map((p, i) => ({
    year: p.year,
    baseline: p.balance,
    crash: result.withCrash.series[i]?.balance ?? null,
  }));

  const baselineSurvived = result.baseline.endBalance > 0;
  const crashSurvived = result.withCrash.endBalance > 0;
  const damage = result.baseline.endBalance - result.withCrash.endBalance;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Card glow={baselineSurvived} className={baselineSurvived ? "bg-gradient-radial-green" : ""}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">Steady Returns Path</CardTitle>
          </div>
          <StatValue size="lg" style={{ color: baselineSurvived ? "var(--green)" : "var(--red)" }} className="!text-current">
            {formatCurrency(result.baseline.endBalance, true)}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {baselineSurvived ? `Survived ${years} years` : `Ran out at year ${result.baseline.ranOutAtYear}`}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-[var(--red)]" />
            <CardTitle className="!mb-0">With Crash</CardTitle>
          </div>
          <StatValue size="lg" style={{ color: crashSurvived ? "var(--yellow)" : "var(--red)" }} className="!text-current">
            {formatCurrency(result.withCrash.endBalance, true)}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {crashSurvived ? `Survived ${years} years` : `Ran out at year ${result.withCrash.ranOutAtYear}`}
          </p>
        </Card>
        <Card>
          <CardTitle>Sequence Damage</CardTitle>
          <StatValue size="lg" style={{ color: "var(--red)" }} className="!text-current">
            -{formatCurrency(Math.max(0, damage), true)}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Same average return, dramatically different outcome.
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>Portfolio Trajectory</CardTitle>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Both scenarios have the same average return — but a bad year early in retirement does massively more damage than the same bad year later. This is sequence-of-returns risk.
        </p>
        <div className="h-72 sm:h-96 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="baseline" name="Steady Returns" stroke="var(--green)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="crash" name="With Crash" stroke="var(--red)" strokeWidth={2.5} dot={false} />
              <ReferenceLine x={crashYear} stroke="#FFB020" strokeDasharray="3 3" label={{ value: "Crash", fill: "#FFB020", fontSize: 11, position: "top" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Portfolio</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Starting Balance" value={startBalance} onChange={setStartBalance} min={100_000} max={50_000_000} step={50_000} prefix="$" />
            <Slider label="Years in Retirement" value={years} onChange={setYears} min={5} max={60} step={1} suffix=" yrs" />
            <Slider label="Annual Withdrawal" value={withdrawal} onChange={setWithdrawal} min={10_000} max={500_000} step={1_000} prefix="$" />
            <Slider label="Inflation" value={inflation} onChange={setInflation} min={0} max={10} step={0.25} suffix="%" />
            <Slider label="Base Return" value={baseReturn} onChange={setBaseReturn} min={1} max={15} step={0.25} suffix="%" />
          </div>
        </Card>
        <Card>
          <CardTitle>Crash Scenario</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Crash Year" value={crashYear} onChange={setCrashYear} min={1} max={years} step={1} suffix=" yrs in" />
            <Slider label="Crash Size" value={crashSize} onChange={setCrashSize} min={-70} max={-5} step={1} suffix="%" />
            <Slider label="Recovery Years" value={recovery} onChange={setRecovery} min={1} max={15} step={1} suffix=" yrs" />
          </div>
          <div className="mt-4 p-4 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="text-white font-semibold">Try this:</span> Set the crash to year 1 vs year 20 — the early crash often ruins the plan even though the average return is identical.
          </div>
        </Card>
      </div>
    </div>
  );
}
