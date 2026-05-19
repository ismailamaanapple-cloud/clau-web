"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface NetWorthSnapshot {
  id: string;
  date: string; // ISO yyyy-mm-dd
  netWorth: number;
  assets: number;
  liabilities: number;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string; // ISO yyyy-mm-dd
  currentAmount: number;
  monthlyContribution: number;
  category: "house" | "wedding" | "education" | "travel" | "emergency" | "sabbatical" | "vehicle" | "other";
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  monthlyAmount: number;
  type: "fixed" | "variable" | "discretionary";
}

export interface UserProfile {
  hasOnboarded: boolean;
  name?: string;
  age?: number;
  retirementAge?: number;
  initialInvestment?: number;
  monthlyContribution?: number;
  fireTarget?: number;
  annualReturn?: number;
  houseValue?: number;
  carValue?: number;
  cashValue?: number;
  equitiesValue?: number;
  // Detailed net worth calculator results
  homeEquity?: number;
  checking?: number;
  retirement?: number;
  investmentRealEstate?: number;
  otherAssets?: number;
  mortgage?: number;
  studentLoans?: number;
  autoLoans?: number;
  creditCardDebt?: number;
  personalLoans?: number;
  otherDebts?: number;
  // Tracking
  netWorthSnapshots?: NetWorthSnapshot[];
  goals?: SavingsGoal[];
  expenses?: ExpenseCategory[];
  monthlyIncome?: number;
}

const STORAGE_KEY = "clau-user-profile-v1";

const defaultProfile: UserProfile = {
  hasOnboarded: false,
  annualReturn: 8,
};

interface UserContextValue {
  profile: UserProfile;
  loaded: boolean;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile({ ...defaultProfile, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  }, [profile, loaded]);

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <UserContext.Provider value={{ profile, loaded, updateProfile, resetProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
