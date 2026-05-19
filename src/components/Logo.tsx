"use client";

import { cn } from "@/lib/cn";

export function Logo({ size = 40, withText = true, className }: { size?: number; withText?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative flex items-center justify-center rounded-2xl bg-[var(--background)] border border-[var(--green)] animate-pulse-glow"
        style={{ width: size, height: size }}
      >
        <span
          className="font-black neon-text"
          style={{ fontSize: size * 0.55, letterSpacing: "-0.05em" }}
        >
          C
        </span>
      </div>
      {withText && (
        <span
          className="font-extralight tracking-[0.35em] text-white"
          style={{ fontSize: size * 0.5 }}
        >
          CLAU
        </span>
      )}
    </div>
  );
}
