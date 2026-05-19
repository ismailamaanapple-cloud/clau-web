"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { simulateLoanStrategy } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { cn } from "@/lib/cn";

export function LoansMode() {
  const [annualIncome, setAnnualIncome] = useState(120_000);
  const [savingsRate, setSavingsRate] = useState(20);
  const [balance, setBalance] = useState(60_000);
  const [interestRate, setInterestRate] = useState(7);
  const [minPayment, setMinPayment] = useState(600);
  const [extraPayment, setExtraPayment] = useState(500);
  const [lumpSum, setLumpSum] = useState(0);
  const [lumpSumYear, setLumpSumYear] = useState(2);
  const [investReturn, setInvestReturn] = useState(8);
  const [years, setYears] = useState(20);

  const months = years * 12;

  const payoff = useMemo(() =>
    simulateLoanStrategy({
      balance,
      annualRate: interestRate,
      minPayment,
      extraPayment,
      lumpSum,
      lumpSumYear,
      monthlyIncome: annualIncome / 12,
      savingsRate,
      investReturnPct: investReturn,
      months,
      payOffEarly: true,
    }),
    [balance, interestRate, minPayment, extraPayment, lumpSum, lumpSumYear, annualIncome, savingsRate, investReturn, months]
  );

  const invest = useMemo(() =>
    simulateLoanStrategy({
      balance,
      annualRate: interestRate,
      minPayment,
      extraPayment,
      lumpSum,
      lumpSumYear,
      monthlyIncome: annualIncome / 12,
      savingsRate,
      investReturnPct: investReturn,
      months,
      payOffEarly: false,
    }),
    [balance, interestRate, minPayment, extraPayment, lumpSum, lumpSumYear, annualIncome, savingsRate, investReturn, months]
  );

  const chartData = useMemo(() => {
    const data: { year: number; payoff: number; invest: number; loanPayoff: number; loanInvest: number }[] = [];
    for (let m = 0; m <= months; m += 12) {
      data.push({
        year: m / 12,
        payoff: payoff.netWorthByMonth[m] ?? 0,
        invest: invest.netWorthByMonth[m] ?? 0,
        loanPayoff: payoff.loanByMonth[m] ?? 0,
        loanInvest: invest.loanByMonth[m] ?? 0,
      });
    }
    return data;
  }, [payoff, invest, months]);

  const diff = payoff.finalNetWorth - invest.finalNetWorth;
  const payoffWins = diff > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StrategyCard
          title="Pay Off Early"
          subtitle={`+${formatCurrency(extraPayment)}/mo extra`}
          netWorth={payoff.finalNetWorth}
          totalInterest={payoff.totalInterest}
          payoffMonth={payoff.payoffMonth}
          color="red"
          best={payoffWins}
        />
        <StrategyCard
          title="Minimum + Invest"
          subtitle={`Invest +${formatCurrency(extraPayment)}/mo instead`}
          netWorth={invest.finalNetWorth}
          totalInterest={invest.totalInterest}
          payoffMonth={invest.payoffMonth}
          color="green"
          best={!payoffWins}
        />
      </div>

      <Card glow>
        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">Net Worth Difference</p>
          <p className={cn("text-4xl font-black mt-1", payoffWins ? "text-[var(--red)]" : "text-[var(--green)]")}>
            {formatCurrency(Math.abs(diff))}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {payoffWins ? "Paying off early" : "Investing extra"} comes out ahead after {years} years.
          </p>
        </div>
      </Card>

      <Card>
        <CardTitle>Net Worth Over Time</CardTitle>
        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} />
              <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} width={60} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="payoff" name="Pay Off Early" stroke="var(--red)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="invest" name="Min + Invest" stroke="var(--green)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Loan Balance</CardTitle>
        <div className="h-60 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" style={{ fontSize: 11 }} tickFormatter={(y) => (y % 5 === 0 ? `Yr ${y}` : "")} />
              <YAxis tickFormatter={(v) => formatCurrency(v as number, true)} stroke="var(--text-muted)" style={{ fontSize: 11 }} width={60} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="loanPayoff" name="Pay Off Early" stroke="var(--red)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="loanInvest" name="Min + Invest" stroke="var(--green)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Inputs</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Slider label="Annual Income" value={annualIncome} onChange={setAnnualIncome} min={20_000} max={2_000_000} step={1000} prefix="$" />
          <Slider label="Savings Rate" value={savingsRate} onChange={setSavingsRate} min={0} max={80} step={1} suffix="%" />
          <Slider label="Student Loan Balance" value={balance} onChange={setBalance} min={10_000} max={800_000} step={1000} prefix="$" />
          <Slider label="Interest Rate" value={interestRate} onChange={setInterestRate} min={1} max={15} step={0.25} suffix="%" />
          <Slider label="Minimum Payment" value={minPayment} onChange={setMinPayment} min={200} max={10_000} step={50} prefix="$" />
          <Slider label="Extra Payment / Invest" value={extraPayment} onChange={setExtraPayment} min={0} max={20_000} step={50} prefix="$" />
          <Slider label="Lump Sum" value={lumpSum} onChange={setLumpSum} min={0} max={500_000} step={1000} prefix="$" />
          {lumpSum > 0 && <Slider label="Lump Sum Year" value={lumpSumYear} onChange={setLumpSumYear} min={1} max={10} step={1} suffix=" yr" />}
          <Slider label="Investment Return" value={investReturn} onChange={setInvestReturn} min={3} max={15} step={0.5} suffix="%" />
          <Slider label="Timeline" value={years} onChange={setYears} min={5} max={40} step={1} suffix=" years" />
        </div>
      </Card>

      <Card>
        <CardTitle>Recommendation</CardTitle>
        <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
          With a loan rate of <span className="text-white font-semibold">{interestRate}%</span> and an expected investment return of <span className="text-white font-semibold">{investReturn}%</span>:{" "}
          {investReturn > interestRate + 1
            ? "investing the difference is mathematically favored. But consider the psychological value of being debt-free."
            : investReturn < interestRate
            ? "paying off the loan early is the guaranteed winner — your debt rate exceeds your expected returns."
            : "the math is close — favor whichever helps you sleep better at night."}
          {lumpSum > 0 && payoffWins ? " The lump sum payment in year " + lumpSumYear + " significantly reduces total interest." : ""}
        </p>
      </Card>
    </div>
  );
}

function StrategyCard({
  title,
  subtitle,
  netWorth,
  totalInterest,
  payoffMonth,
  color,
  best,
}: {
  title: string;
  subtitle: string;
  netWorth: number;
  totalInterest: number;
  payoffMonth: number | null;
  color: "red" | "green";
  best: boolean;
}) {
  return (
    <Card glow={best} className={best ? "border-[var(--green)]" : undefined}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        {best && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--green)] text-black">BEST</span>}
      </div>
      <StatValue size="lg" style={{ color: color === "red" ? "var(--red)" : "var(--green)" }} className="!text-current">{formatCurrency(netWorth, true)}</StatValue>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Mini label="Total Interest" value={formatCurrency(totalInterest, true)} />
        <Mini label="Payoff" value={payoffMonth ? `${Math.ceil(payoffMonth / 12)} yr` : "Not paid"} />
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface-light)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
