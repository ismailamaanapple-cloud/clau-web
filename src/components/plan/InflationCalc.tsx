"use client";

import { useState, useMemo } from "react";
import { TrendingDown } from "lucide-react";
import { PlanLayout } from "./_shared";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency } from "@/lib/format";
import { futureValueOf, realValueOf } from "@/lib/fireMath";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export function InflationCalc() {
  const [amount, setAmount] = useState(1_000_000);
  const [years, setYears] = useState(30);
  const [inflation, setInflation] = useState(3);

  const future = useMemo(() => futureValueOf(amount, years, inflation), [amount, years, inflation]);
  const real = useMemo(() => realValueOf(amount, years, inflation), [amount, years, inflation]);

  const data = Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    nominal: amount,
    realValue: realValueOf(amount, y, inflation),
    needNominal: futureValueOf(amount, y, inflation),
  }));

  return (
    <PlanLayout
      title="Inflation Calculator"
      icon={<TrendingDown size={28} />}
      subtitle="What your money is actually worth over time — and how much you will need to keep the same buying power."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Today&apos;s Amount</CardTitle>
          <StatValue size="xl">{formatCurrency(amount, true)}</StatValue>
        </Card>
        <Card>
          <CardTitle>Real value in {years} yrs</CardTitle>
          <StatValue size="lg" style={{ color: "var(--red)" }} className="!text-current">{formatCurrency(real, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">What it will actually buy</p>
        </Card>
        <Card>
          <CardTitle>You&apos;d need (nominal)</CardTitle>
          <StatValue size="lg" style={{ color: "var(--green)" }} className="!text-current">{formatCurrency(future, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">To preserve today&apos;s buying power</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Buying-Power Decay</CardTitle>
        <div className="h-64 sm:h-80 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="realValue" name="Real value of today&apos;s $" stroke="var(--red)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="needNominal" name="$ needed to match today&apos;s value" stroke="var(--green)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <Slider label="Amount" value={amount} onChange={setAmount} min={1_000} max={100_000_000} step={1_000} prefix="$" />
          <Slider label="Years" value={years} onChange={setYears} min={1} max={60} step={1} suffix=" yrs" />
          <Slider label="Inflation Rate" value={inflation} onChange={setInflation} min={0} max={15} step={0.1} suffix="% /yr" />
        </div>
      </Card>
    </PlanLayout>
  );
}
