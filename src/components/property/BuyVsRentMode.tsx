"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle, StatValue } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Toggle } from "@/components/ui/Toggle";
import { formatCurrency } from "@/lib/format";
import { simulateBuyVsRent, type BuyVsRentInputs } from "@/lib/realEstate";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Home as HomeIcon, Key } from "lucide-react";

export function BuyVsRentMode() {
  const [homePrice, setHomePrice] = useState(600_000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(7);
  const [term, setTerm] = useState<15 | 30>(30);
  const [closingPct, setClosingPct] = useState(3);
  const [taxPct, setTaxPct] = useState(1.2);
  const [insurance, setInsurance] = useState(150);
  const [maintPct, setMaintPct] = useState(1);
  const [hoa, setHoa] = useState(0);
  const [apprPct, setApprPct] = useState(3);
  const [sellPct, setSellPct] = useState(6);
  const [margTax, setMargTax] = useState(0.24);
  const [itemizes, setItemizes] = useState(false);

  const [rent, setRent] = useState(2_800);
  const [rentGrowth, setRentGrowth] = useState(3);
  const [rentersIns, setRentersIns] = useState(20);

  const [invReturn, setInvReturn] = useState(8);
  const [inflation, setInflation] = useState(3);
  const [years, setYears] = useState(15);

  const result = useMemo(() => {
    const inputs: BuyVsRentInputs = {
      homePrice, downPaymentPct: downPct, interestRatePct: rate, loanTermYears: term,
      closingCostsPct: closingPct, propertyTaxPct: taxPct, insuranceMonthly: insurance,
      maintenancePct: maintPct, hoaMonthly: hoa, appreciationPct: apprPct, sellingCostsPct: sellPct,
      marginalTaxRate: margTax, itemizesDeductions: itemizes,
      monthlyRent: rent, rentGrowthPct: rentGrowth, rentersInsuranceMonthly: rentersIns,
      investmentReturnPct: invReturn, inflationPct: inflation, years,
    };
    return simulateBuyVsRent(inputs);
  }, [
    homePrice, downPct, rate, term, closingPct, taxPct, insurance, maintPct, hoa,
    apprPct, sellPct, margTax, itemizes, rent, rentGrowth, rentersIns, invReturn, inflation, years,
  ]);

  const final = result.yearly[result.yearly.length - 1];
  const winColor = result.recommendation === "buy" ? "var(--green)" : result.recommendation === "rent" ? "#FFB020" : "var(--text-secondary)";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="bg-gradient-radial-green">
          <CardTitle>Recommendation</CardTitle>
          <StatValue size="xl" style={{ color: winColor }} className="!text-current capitalize">
            {result.recommendation === "neutral" ? "It's a wash" : result.recommendation}
          </StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Over {years} years, {result.recommendation === "buy" ? "buying wins by" : result.recommendation === "rent" ? "renting wins by" : "they're within"}{" "}
            {formatCurrency(Math.abs(result.finalDifference), true)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <HomeIcon size={16} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">If You Buy</CardTitle>
          </div>
          <StatValue size="lg">{formatCurrency(final.buyNetWorth, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Home equity after selling costs</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-[var(--green)]" />
            <CardTitle className="!mb-0">If You Rent + Invest</CardTitle>
          </div>
          <StatValue size="lg">{formatCurrency(final.rentNetWorth, true)}</StatValue>
          <p className="text-xs text-[var(--text-muted)] mt-1">Portfolio after capital gains tax</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Net Worth Over Time</CardTitle>
        {result.breakEvenYear !== null && (
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Break-even: <span className="text-white font-semibold">Year {result.breakEvenYear}</span> — buying overtakes renting around then.
          </p>
        )}
        <div className="h-64 sm:h-80 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.yearly} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="buyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFB020" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FFB020" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => formatCurrency(Number(v), true)} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="buyNetWorth" name="Buy (home equity)" stroke="var(--green)" strokeWidth={2.5} fill="url(#buyFill)" />
              <Area type="monotone" dataKey="rentNetWorth" name="Rent + Invest" stroke="#FFB020" strokeWidth={2.5} fill="url(#rentFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle>If You Buy</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Home Price" value={homePrice} onChange={setHomePrice} min={50_000} max={40_000_000} step={10_000} prefix="$" />
            <Slider label="Down Payment" value={downPct} onChange={setDownPct} min={0} max={100} step={1} suffix="%" />
            <Slider label="Mortgage Rate" value={rate} onChange={setRate} min={0} max={20} step={0.125} suffix="%" />
            <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
              <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Loan Term</div>
              <div className="flex gap-2">
                {([15, 30] as const).map((t) => (
                  <button key={t} onClick={() => setTerm(t)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${term === t ? "bg-[var(--green-muted)] text-[var(--green)]" : "bg-[var(--card)] text-[var(--text-secondary)]"}`}>{t}-yr</button>
                ))}
              </div>
            </div>
            <Slider label="Closing Costs" value={closingPct} onChange={setClosingPct} min={0} max={10} step={0.25} suffix="%" />
            <Slider label="Property Tax (annual)" value={taxPct} onChange={setTaxPct} min={0} max={5} step={0.05} suffix="%" />
            <Slider label="Insurance" value={insurance} onChange={setInsurance} min={0} max={5_000} step={10} prefix="$" suffix="/mo" />
            <Slider label="Maintenance (annual)" value={maintPct} onChange={setMaintPct} min={0} max={5} step={0.1} suffix="%" />
            <Slider label="HOA" value={hoa} onChange={setHoa} min={0} max={5_000} step={25} prefix="$" suffix="/mo" />
            <Slider label="Appreciation" value={apprPct} onChange={setApprPct} min={-5} max={15} step={0.25} suffix="% /yr" />
            <Slider label="Selling Costs" value={sellPct} onChange={setSellPct} min={0} max={12} step={0.25} suffix="%" />
          </div>
        </Card>
        <Card>
          <CardTitle>If You Rent</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Monthly Rent" value={rent} onChange={setRent} min={500} max={100_000} step={50} prefix="$" suffix="/mo" />
            <Slider label="Rent Growth" value={rentGrowth} onChange={setRentGrowth} min={0} max={15} step={0.25} suffix="% /yr" />
            <Slider label="Renter's Insurance" value={rentersIns} onChange={setRentersIns} min={0} max={500} step={5} prefix="$" suffix="/mo" />
          </div>
          <CardTitle className="mt-6">Shared Assumptions</CardTitle>
          <div className="space-y-3 mt-3">
            <Slider label="Investment Return" value={invReturn} onChange={setInvReturn} min={0} max={20} step={0.25} suffix="% /yr" />
            <Slider label="Inflation" value={inflation} onChange={setInflation} min={0} max={10} step={0.25} suffix="% /yr" />
            <Slider label="Years to Compare" value={years} onChange={setYears} min={1} max={40} step={1} suffix=" yrs" />
            <Slider label="Marginal Tax Rate" value={margTax * 100} onChange={(v) => setMargTax(v / 100)} min={0} max={45} step={1} suffix="%" />
            <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 flex items-center justify-between">
              <div className="text-sm text-[var(--text-secondary)] font-medium">Itemize deductions?</div>
              <Toggle checked={itemizes} onChange={setItemizes} label="Itemize deductions" />
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed">
        <span className="text-white font-semibold">How it works:</span> The renter starts with the buyer&apos;s down payment + closing costs invested in stocks. Each month, if buying is more expensive, the renter invests the difference. Buying wins via equity buildup + appreciation; renting wins via lower carrying costs and compounding investments.
      </div>
    </div>
  );
}
