"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useUser } from "@/lib/UserContext";
import { Home, LineChart, Sparkles, BookOpen, User as UserIcon, Building2, Wrench } from "lucide-react";
import { cn } from "@/lib/cn";
import { Onboarding } from "@/components/onboarding/Onboarding";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/simulate", label: "Simulate", icon: Sparkles },
  { href: "/invest", label: "Invest", icon: LineChart },
  { href: "/property", label: "Property", icon: Building2 },
  { href: "/plan", label: "Plan", icon: Wrench },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function Shell({ children }: { children: ReactNode }) {
  const { profile, loaded } = useUser();
  const pathname = usePathname();
  const isLegal = pathname === "/terms" || pathname === "/privacy";

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Logo size={48} />
      </div>
    );
  }

  if (!profile.hasOnboarded && !isLegal) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[var(--border)] bg-[var(--surface)] px-5 py-7 sticky top-0 h-screen">
        <Logo size={36} />
        <nav className="mt-10 flex flex-col gap-1.5">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition",
                  active
                    ? "bg-[var(--green-muted)] text-[var(--green)]"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--card-hover)]"
                )}
              >
                <Icon size={18} strokeWidth={2.2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto text-xs text-[var(--text-muted)] leading-snug pt-6 border-t border-[var(--border)]">
          CLAU does not provide financial advice. Educational use only.
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between">
        <Logo size={26} />
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                active ? "text-[var(--green)]" : "text-[var(--text-muted)] active:text-white"
              )}
            >
              <Icon size={20} strokeWidth={2.2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 min-w-0 px-4 md:px-10 pt-14 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pt-10 md:pb-10 md:py-10">
        {children}
      </main>
    </div>
  );
}
