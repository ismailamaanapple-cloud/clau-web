"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { formatCurrency } from "@/lib/format";
import { simulatePayoffVsInvest, mortgagePayment } from "@/lib/realEstate";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export function MortgagePayoffMode() {
  const [balance, setBalance] = useState(400_000);
  const [rate, setRate] = useState(6.5);
  const [monthsLeft, setMonthsLeft] = useState(300);
  const [extra, setExtra] = useState(500);
  const [invReturn, setInvReturn] = useState(8);
  const [margTax, setMargTax] = useState(0.24);
  const [itemizes, setItemizes] = useState(false);

  const basePI = useMemo(() => mortgagePayment(balance, rate, monthsLeft / 12), [balance, rate, monthsLeft]);

  const result = useMemo(() => simulatePayoffVsInvest({
    mortgageBalance: balance, interestRatePct: rate, monthsRemaining: monthsLeft,
    baseMonthlyPayment: basePI, extraPerMonth: extra,
    investmentReturnPct: invReturn, marginalTaxRate: margTax, itemizes,
  }), [balance, rate, monthsLeft, basePI, extra, invReturn, margTax, itemizes]);

  const chartData = result.payoffStrategy.netWorthByMonth.map((nw, m) => ({
    month: m, year: +(m / 12).toFixed(1),
    payoff: nw, invest: result.investStrategy.netWorthByMonth[m],
  })).filter((_, i) => i % 12 === 0); // yearly for clarity

  const finalPayoff = result.payoffStrategy.netWorthByMonth[result.payoffStrategy.netWorthByMonth.length - 1];
  const finalInvest = result.investStrategy.netWorthByMonth[result.investStrategy.netWorthByMonth.length - 1];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Better Choice</CardTitle>
          <StatValue size="xl" style={{ color: "var(--green)" }} className="!text-current capitalize">
            {result.betterChoice === "payoff" ? "Pay Off Early" : "Invest the Extra"}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Wins by {formatCurrency(Math.abs(result.finalDifference), true)} after {(monthsLeft / 12).toFixed(0)} years
          </p>
        </Card>
        <Card>
          <CardTitle>Pay Off Strategy</CardTitle>
          <StatValue size="lg">{formatCurrency(finalPayoff, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Mortgage gone in {((result.payoffStrategy.payoffMonth ?? monthsLeft) / 12).toFixed(1)} years
          </p>
        </Card>
        <Card>
          <CardTitle>Invest Extra Strategy</CardTitle>
          <StatValue size="lg">{formatCurrency(finalInvest, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Portfolio at end of {(monthsLeft / 12).toFixed(0)}-yr term</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Net Worth Over Time</CardTitle>
        <div className="h-64 sm:h-80 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="payoff" name="Pay Off Mortgage" stroke="var(--green)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="invest" name="Invest the Extra" stroke="#FFB020" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Slider label="Mortgage Balance" value={balance} onChange={setBalance} min={10_000} max={10_000_000} step={5_000} prefix="$" />
          <Slider label="Interest Rate" value={rate} onChange={setRate} min={0} max={20} step={0.125} suffix="%" />
          <Slider label="Months Remaining" value={monthsLeft} onChange={setMonthsLeft} min={12} max={480} step={12} suffix=" mo" />
          <Slider label="Extra Per Month" value={extra} onChange={setExtra} min={0} max={20_000} step={50} prefix="$" />
          <Slider label="Investment Return" value={invReturn} onChange={setInvReturn} min={0} max={20} step={0.25} suffix="% /yr" />
          <Slider label="Marginal Tax Rate" value={margTax * 100} onChange={(v) => setMargTax(v / 100)} min={0} max={45} step={1} suffix="%" />
        </div>
        <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 flex items-center justify-between mt-3">
          <div className="text-sm text-[var(--text-secondary)] font-medium">Itemize deductions?</div>
          <button onClick={() => setItemizes(v => !v)} className={`relative w-12 h-6 rounded-full transition ${itemizes ? "bg-[var(--green)]" : "bg-[var(--border)]"}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${itemizes ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </Card>

      <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed">
        <span className="text-white font-semibold">Rule of thumb:</span> If your after-tax mortgage rate is lower than your expected investment return, math favors investing. If your mortgage rate is higher (or you value the certainty), payoff often wins. Don&apos;t forget the psychological win of being debt-free.
      </div>
    </div>
  );
}
