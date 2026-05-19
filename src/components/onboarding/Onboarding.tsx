"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { useUser } from "@/lib/UserContext";
import { formatCurrency, capitalGainsTaxRate } from "@/lib/format";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

type Step = "welcome" | "name" | "age" | "retire-age" | "initial" | "monthly" | "fire";

export function Onboarding() {
  const { updateProfile } = useUser();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [initial, setInitial] = useState(10_000);
  const [monthly, setMonthly] = useState(1_500);
  const [fireTarget, setFireTarget] = useState(2_000_000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(
    Math.round((2_000_000 * 0.04) / 12)
  );
  const [fireMode, setFireMode] = useState<"target" | "withdraw">("target");

  const updateFire = (target: number) => {
    setFireTarget(target);
    setMonthlyWithdrawal(Math.round((target * 0.04) / 12));
  };
  const updateWithdraw = (withdraw: number) => {
    setMonthlyWithdrawal(withdraw);
    setFireTarget(Math.round((withdraw * 12) / 0.04));
  };

  const annualWithdraw = monthlyWithdrawal * 12;
  const taxRate = capitalGainsTaxRate(annualWithdraw);
  const monthlyAfterTax = Math.round((monthlyWithdrawal * (1 - taxRate)) * 100) / 100;

  const finish = () => {
    updateProfile({
      hasOnboarded: true,
      name: name || "Friend",
      age,
      retirementAge: retireAge,
      initialInvestment: initial,
      monthlyContribution: monthly,
      fireTarget,
      annualReturn: 8,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] relative overflow-hidden px-4 py-10">
      {/* Floating background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[260px] h-[260px] rounded-full bg-[var(--green-muted)] blur-3xl animate-orb-1" />
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-[var(--green-muted)] blur-3xl animate-orb-2" />
        <div className="absolute top-[50%] left-[55%] w-[200px] h-[200px] rounded-full bg-[var(--green-muted)] blur-3xl animate-orb-3" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {step === "welcome" && (
          <div className="flex flex-col items-center text-center gap-8">
            <Logo size={64} withText={false} />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white mb-3">
                Welcome to <span className="neon-text font-extralight tracking-[0.25em] ml-1">CLAU</span>
              </h1>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Plan your path to financial independence with Monte Carlo simulations,
                portfolio projections, and FIRE math — all in one place.
              </p>
            </div>
            <Button size="lg" className="w-full" onClick={() => setStep("name")}>
              Get Started
            </Button>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              By continuing you agree to our{" "}
              <Link href="/terms" className="text-[var(--green)] underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[var(--green)] underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        )}

        {step === "name" && (
          <OnboardingStep
            title="What's your name?"
            subtitle="We'll use it to personalize your experience."
            onBack={() => setStep("welcome")}
            onNext={() => setStep("age")}
            disabled={!name.trim()}
          >
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[var(--surface-light)] border border-[var(--border-light)] focus:border-[var(--green)] rounded-xl px-4 py-4 text-lg outline-none text-white"
            />
          </OnboardingStep>
        )}

        {step === "age" && (
          <OnboardingStep
            title={`Hi ${name}, how old are you?`}
            subtitle="We'll use your age to personalize timelines and projections."
            onBack={() => setStep("name")}
            onNext={() => setStep("retire-age")}
          >
            <NumberInput value={age} onChange={setAge} suffix="years" min={16} max={100} />
          </OnboardingStep>
        )}

        {step === "retire-age" && (
          <OnboardingStep
            title="At what age do you want to retire?"
            subtitle={`You're ${age} now — that's ${Math.max(1, retireAge - age)} years to FIRE. FIRE = Financial Independence, Retire Early.`}
            onBack={() => setStep("age")}
            onNext={() => setStep("initial")}
          >
            <NumberInput value={retireAge} onChange={setRetireAge} suffix="years" min={age + 1} max={100} />
          </OnboardingStep>
        )}

        {step === "initial" && (
          <OnboardingStep
            title="How much have you already invested?"
            subtitle="Your starting balance — set 0 if you're starting fresh."
            onBack={() => setStep("retire-age")}
            onNext={() => setStep("monthly")}
          >
            <NumberInput value={initial} onChange={setInitial} prefix="$" min={0} max={50_000_000} />
          </OnboardingStep>
        )}

        {step === "monthly" && (
          <OnboardingStep
            title="How much will you invest monthly?"
            subtitle="Recurring contributions are what make compound interest work."
            onBack={() => setStep("initial")}
            onNext={() => setStep("fire")}
          >
            <NumberInput value={monthly} onChange={setMonthly} prefix="$" min={0} max={100_000} />
          </OnboardingStep>
        )}

        {step === "fire" && (
          <OnboardingStep
            title="What's your FIRE number?"
            subtitle="Enter target net worth or desired monthly retirement income — we'll calculate the other using the 4% rule."
            onBack={() => setStep("monthly")}
            onNext={finish}
            nextLabel="Finish"
          >
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setFireMode("target")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  fireMode === "target"
                    ? "bg-[var(--green-muted)] text-[var(--green)]"
                    : "bg-[var(--surface-light)] text-[var(--text-secondary)]"
                }`}
              >
                Target Net Worth
              </button>
              <button
                type="button"
                onClick={() => setFireMode("withdraw")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  fireMode === "withdraw"
                    ? "bg-[var(--green-muted)] text-[var(--green)]"
                    : "bg-[var(--surface-light)] text-[var(--text-secondary)]"
                }`}
              >
                Monthly Income
              </button>
            </div>
            {fireMode === "target" ? (
              <NumberInput
                value={fireTarget}
                onChange={updateFire}
                prefix="$"
                min={100_000}
                max={50_000_000}
              />
            ) : (
              <NumberInput
                value={monthlyWithdrawal}
                onChange={updateWithdraw}
                prefix="$"
                suffix="/mo"
                min={500}
                max={500_000}
              />
            )}

            <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4 mt-3 space-y-2">
              <Row label="Net Worth" value={formatCurrency(fireTarget)} />
              <Row label="Monthly Withdrawal (pre-tax)" value={formatCurrency(monthlyWithdrawal)} />
              <Row label={`Capital Gains Tax (${(taxRate * 100).toFixed(0)}%)`} value={formatCurrency(monthlyWithdrawal * taxRate)} subtle />
              <Row label="Monthly Income After Tax" value={formatCurrency(monthlyAfterTax)} highlight />
            </div>
          </OnboardingStep>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight, subtle }: { label: string; value: string; highlight?: boolean; subtle?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${subtle ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
        {label}
      </span>
      <span className={`font-bold ${highlight ? "text-[var(--green)] text-lg" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function OnboardingStep({
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  disabled,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <button
        onClick={onBack}
        className="self-start text-sm text-[var(--text-secondary)] hover:text-white flex items-center gap-1"
      >
        <ChevronLeft size={16} /> Back
      </button>
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-3 leading-tight">{title}</h1>
        <p className="text-[var(--text-secondary)] leading-relaxed">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      <Button size="lg" className="w-full mt-2" disabled={disabled} onClick={onNext}>
        {nextLabel} <ChevronRight className="inline ml-1" size={18} />
      </Button>
    </div>
  );
}
