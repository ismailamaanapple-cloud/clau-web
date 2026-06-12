"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Mode = "signin" | "signup";

export function AuthScreen() {
  const router = useRouter();
  const { configured, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "email">(null);
  const [error, setError] = useState<string | null>(null);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy("email");
    const res = mode === "signin"
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password);
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if ("needsConfirmation" in res && res.needsConfirmation) { setSentConfirmation(true); return; }
    router.push("/");
  };

  if (sentConfirmation) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center text-center gap-4">
          <CheckCircle2 className="text-[var(--green)]" size={48} />
          <h1 className="text-2xl font-bold text-white">Check your inbox</h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            We sent a confirmation link to <span className="text-white font-semibold">{email}</span>. Click it to finish creating your account.
          </p>
          <Link href="/" className="text-sm text-[var(--green)] hover:underline mt-2">Back to app</Link>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Link href="/" className="self-start inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-white mb-2">
        <ArrowLeft size={16} /> Back to app
      </Link>

      <div className="text-center mb-2">
        <Logo size={48} withText={false} />
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          {mode === "signin" ? "Sign in to sync your plan across devices." : "Save your progress and access it anywhere."}
        </p>
      </div>

      {!configured && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3 text-xs text-[var(--yellow)] leading-relaxed">
          Sign-in isn&apos;t connected yet. Add your Supabase keys to <code>.env.local</code> (see README) — until then the app saves locally in this browser.
        </div>
      )}

      {/* Email */}
      <form onSubmit={handleEmail} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          className="w-full bg-[var(--surface-light)] border border-[var(--border-light)] focus:border-[var(--green)] rounded-xl px-4 py-3 text-white outline-none transition"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="w-full bg-[var(--surface-light)] border border-[var(--border-light)] focus:border-[var(--green)] rounded-xl px-4 py-3 text-white outline-none transition"
        />
        {error && <p className="text-sm text-[var(--red)]">{error}</p>}
        <Button size="lg" className="w-full" disabled={busy !== null || !configured}>
          {busy === "email" ? <Loader2 className="animate-spin inline mr-2" size={18} /> : <Mail className="inline mr-2" size={18} />}
          {mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        {mode === "signin" ? "New to CLAU?" : "Already have an account?"}{" "}
        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
          className="text-[var(--green)] font-semibold hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--background)] relative overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[260px] h-[260px] rounded-full bg-[var(--green-muted)] blur-3xl animate-orb-1" />
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-[var(--green-muted)] blur-3xl animate-orb-2" />
      </div>
      <div className="relative w-full max-w-sm flex flex-col gap-4 animate-slide-up">{children}</div>
    </div>
  );
}
