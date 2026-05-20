"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { useUser } from "@/lib/UserContext";
import { coastFireNumber, coastFireCurve, baristaFireNumber } from "@/lib/fireMath";
import { formatCurrency } from "@/lib/format";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend,
} from "recharts";
import { Coffee, Anchor } from "lucide-react";

export function CoastFireMode() {
  const { profile } = useUser();
  const [currentAge, setCurrentAge] = useState(profile.age ?? 30);
  const [retireAge, setRetireAge] = useState(profile.retirementAge ?? 65);
  const [fireTarget, setFireTarget] = useState(profile.fireTarget ?? 2_000_000);
  const [currentInvested, setCurrentInvested] = useState(profile.initialInvestment ?? 50_000);
  const [realReturnPct, setRealReturnPct] = useState(5);
  const [annualExpenses, setAnnualExpenses] = useState(60_000);
  const [partTimeIncome, setPartTimeIncome] = useState(20_000);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const coastNumber = useMemo(
    () => coastFireNumber({ fireTarget, currentAge, retireAge, realReturnPct }),
    [fireTarget, currentAge, retireAge, realReturnPct]
  );
  const baristaNumber = useMemo(
    () => baristaFireNumber({ annualExpenses, partTimeIncome, withdrawalRatePct: withdrawalRate }),
    [annualExpenses, partTimeIncome, withdrawalRate]
  );
  const curve = useMemo(
    () => coastFireCurve({ fireTarget, currentAge, retireAge, realReturnPct }),
    [fireTarget, currentAge, retireAge, realReturnPct]
  );
  const reachedCoast = currentInvested >= coastNumber;
  const distanceToCoast = coastNumber - currentInvested;

  const data = curve.map((p) => ({ age: p.age, coastTarget: p.coastTarget, you: currentInvested }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Card glow className="bg-gradient-radial-green md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Anchor size={16} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">Coast FIRE Number</CardTitle>
          </div>
          <StatValue size="xl">{formatCurrency(coastNumber, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
            Hit this and you never have to invest another dollar — growth alone gets you to{" "}
            {formatCurrency(fireTarget, true)} by {retireAge}.
          </p>
        </Card>

        <Card>
          <CardTitle>Status</CardTitle>
          <StatValue size="lg" style={{ color: reachedCoast ? "var(--green)" : "var(--yellow)" }} className="!text-current">
            {reachedCoast ? "Coasting ✓" : "Not Yet"}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {reachedCoast
              ? `You're ${formatCurrency(currentInvested - coastNumber, true)} above your coast number.`
              : `${formatCurrency(distanceToCoast, true)} more invested to start coasting.`}
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Coffee size={16} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">Barista FIRE</CardTitle>
          </div>
          <StatValue size="lg">{formatCurrency(baristaNumber, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            With {formatCurrency(partTimeIncome)} of part-time income covering part of your spend.
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>Coast Target by Age</CardTitle>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          The line shows the minimum invested balance you&apos;d need at each age to coast to FIRE. Your dot tracks where you are today.
        </p>
        <div className="h-64 sm:h-80 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="coastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="age" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}`} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(l) => `Age ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="coastTarget"
                name="Coast Target"
                stroke="var(--green)"
                strokeWidth={2.5}
                fill="url(#coastFill)"
              />
              <ReferenceLine
                y={currentInvested}
                stroke="#FFB020"
                strokeDasharray="5 5"
                label={{ value: `You: ${formatCurrency(currentInvested, true)}`, fill: "#FFB020", fontSize: 11, position: "insideTopRight" }}
              />
              <ReferenceLine
                x={currentAge}
                stroke="var(--text-muted)"
                strokeDasharray="2 2"
                label={{ value: "Today", fill: "var(--text-muted)", fontSize: 10, position: "top" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Coast FIRE Inputs</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Current Age" value={currentAge} onChange={setCurrentAge} min={18} max={70} step={1} suffix=" yrs" />
            <Slider label="Retire Age" value={retireAge} onChange={setRetireAge} min={currentAge + 1} max={80} step={1} suffix=" yrs" />
            <Slider label="FIRE Target (today's $)" value={fireTarget} onChange={setFireTarget} min={100_000} max={50_000_000} step={10_000} prefix="$" />
            <Slider label="Currently Invested" value={currentInvested} onChange={setCurrentInvested} min={0} max={50_000_000} step={5_000} prefix="$" />
            <Slider label="Real Return (after inflation)" value={realReturnPct} onChange={setRealReturnPct} min={1} max={12} step={0.25} suffix="%" />
          </div>
        </Card>
        <Card>
          <CardTitle>Barista FIRE Inputs</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Annual Expenses" value={annualExpenses} onChange={setAnnualExpenses} min={10_000} max={500_000} step={1_000} prefix="$" />
            <Slider label="Part-Time Income" value={partTimeIncome} onChange={setPartTimeIncome} min={0} max={200_000} step={1_000} prefix="$" />
            <Slider label="Safe Withdrawal Rate" value={withdrawalRate} onChange={setWithdrawalRate} min={2} max={6} step={0.1} suffix="%" />
          </div>
          <div className="mt-4 p-4 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="text-white font-semibold">Barista FIRE</span> means you have enough invested that part-time work + 4% withdrawals together cover your full expenses — no more full-time grind needed.
          </div>
        </Card>
      </div>
    </div>
  );
}
