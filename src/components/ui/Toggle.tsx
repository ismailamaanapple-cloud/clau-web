"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Accessible iOS-style switch. Geometry is dialed in so the knob slides cleanly
 * from edge to edge without overshooting either side, and the bg-color animates
 * in sync with the knob translate.
 *
 * Track: 44×24, knob: 20×20 with 2px padding both sides → 20px travel.
 */
export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        disabled && "opacity-50 cursor-not-allowed",
        checked ? "bg-[var(--green)]" : "bg-[var(--border)]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow",
          "transform transition-transform duration-200 ease-in-out",
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        )}
      />
    </button>
  );
}
