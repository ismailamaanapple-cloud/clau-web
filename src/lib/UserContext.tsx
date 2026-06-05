"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

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

function readLocal(): UserProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultProfile, ...JSON.parse(stored) };
  } catch (e) {
    console.error("Failed to load profile", e);
  }
  return defaultProfile;
}

function writeLocal(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

interface UserContextValue {
  profile: UserProfile;
  loaded: boolean;
  syncing: boolean;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load profile whenever auth state resolves/changes.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function load() {
      // Logged in + Supabase configured → cloud is source of truth.
      if (user && supabase) {
        setSyncing(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("data")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;

        if (!error && data?.data) {
          setProfile({ ...defaultProfile, ...(data.data as UserProfile) });
        } else {
          // First sign-in for this user → migrate whatever is in localStorage.
          const local = readLocal();
          setProfile(local);
          await supabase.from("profiles").upsert({
            id: user.id,
            data: local,
            updated_at: new Date().toISOString(),
          });
        }
        setSyncing(false);
      } else {
        // Guest mode.
        setProfile(readLocal());
      }
      setLoaded(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  // Persist on change: always cache locally; debounce-push to Supabase if signed in.
  useEffect(() => {
    if (!loaded) return;
    writeLocal(profile);

    if (user && supabase) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        supabase!
          .from("profiles")
          .upsert({ id: user.id, data: profile, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (error) console.error("Cloud sync failed", error.message);
          });
      }, 800);
    }
  }, [profile, loaded, user]);

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
    <UserContext.Provider value={{ profile, loaded, syncing, updateProfile, resetProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
