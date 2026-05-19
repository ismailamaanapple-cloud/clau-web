"use client";

import { useState, useEffect, useRef } from "react";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

interface NumberInputProps {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
  className,
  inputClassName,
  autoFocus,
}: NumberInputProps) {
  const [text, setText] = useState(formatNumberWithCommas(value));
  const isEditing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing.current) {
      setText(formatNumberWithCommas(value));
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] px-4 py-3 focus-within:border-[var(--green)] transition",
        className
      )}
    >
      {prefix && <span className="text-[var(--text-secondary)] text-lg font-semibold">{prefix}</span>}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={text}
        onFocus={() => {
          isEditing.current = true;
        }}
        onBlur={() => {
          isEditing.current = false;
          let parsed = parseFormattedNumber(text);
          if (typeof min === "number" && parsed < min) parsed = min;
          if (typeof max === "number" && parsed > max) parsed = max;
          onChange(parsed);
          setText(formatNumberWithCommas(parsed));
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.]/g, "");
          setText(formatNumberWithCommas(raw));
          const n = parseFormattedNumber(raw);
          if (!isNaN(n)) onChange(n);
        }}
        step={step}
        className={cn(
          "flex-1 min-w-0 bg-transparent outline-none text-white text-lg font-semibold",
          inputClassName
        )}
      />
      {suffix && <span className="text-[var(--text-secondary)] text-sm font-medium">{suffix}</span>}
    </div>
  );
}
