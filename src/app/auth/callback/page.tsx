"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Logo } from "@/components/Logo";

/**
 * OAuth landing page. The Supabase client (detectSessionInUrl) processes the
 * redirect automatically; we just wait for the session to resolve, then bounce
 * the user into the app.
 */
export default function AuthCallback() {
  const router = useRouter();
  const { authLoading, user } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const t = setTimeout(() => router.replace("/"), user ? 0 : 1200);
    return () => clearTimeout(t);
  }, [authLoading, user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--background)]">
      <Logo size={48} />
      <p className="text-sm text-[var(--text-secondary)] animate-pulse">Signing you in…</p>
    </div>
  );
}
