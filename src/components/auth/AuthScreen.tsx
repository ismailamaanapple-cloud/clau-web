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
  const { configured, signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "google" | "apple" | "email">(null);
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

  const oauth = async (provider: "google" | "apple") => {
    setError(null);
    setBusy(provider);
    const res = provider === "google" ? await signInWithGoogle() : await signInWithApple();
    if (res.error) { setError(res.error); setBusy(null); }
    // On success the browser redirects away, so no need to reset busy.
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

      {/* Social */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => oauth("google")}
          disabled={busy !== null || !configured}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-white text-[#1f1f1f] font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50"
        >
          {busy === "google" ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
          Continue with Google
        </button>
        <button
          onClick={() => oauth("apple")}
          disabled={busy !== null || !configured}
          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50"
        >
          {busy === "apple" ? <Loader2 className="animate-spin" size={18} /> : <AppleIcon />}
          Continue with Apple
        </button>
      </div>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 4.75 12 4.75z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
