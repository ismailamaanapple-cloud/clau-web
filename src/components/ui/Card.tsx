"use client";

import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 md:p-6 transition",
        glow && "shadow-[0_0_30px_rgba(0,200,5,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-2", className)}>
      {children}
    </h3>
  );
}

export function StatValue({
  children,
  className,
  size = "lg",
  style,
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  style?: CSSProperties;
}) {
  const sizes = {
    sm: "text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl md:text-4xl",
    xl: "text-3xl sm:text-4xl md:text-5xl",
  };
  return (
    <div className={cn("font-bold text-white tracking-tight", sizes[size], className)} style={style}>{children}</div>
  );
}
