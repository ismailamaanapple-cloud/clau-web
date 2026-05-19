"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export function PlanLayout({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <Link href="/plan" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-white">
        <ArrowLeft size={16} /> Back to Plan
      </Link>
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span className="text-[var(--green)]">{icon}</span>
          {title}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}
