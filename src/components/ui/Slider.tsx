"use client";

import { useState, useRef, useEffect } from "react";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/format";

interface SliderProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  formatValue?: (n: number) => string;
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  formatValue,
}: SliderProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const displayValue = formatValue ? formatValue(value) : `${prefix ?? ""}${formatNumberWithCommas(value)}${suffix ?? ""}`;

  return (
    <div className="rounded-xl bg-[var(--surface-light)] border border-[var(--border)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-secondary)] font-medium">{label}</span>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={text}
            onChange={(e) => setText(e.target.value.replace(/[^\d.,-]/g, ""))}
            onBlur={() => {
              let n = parseFormattedNumber(text);
              if (n < min) n = min;
              if (n > max) n = max;
              onChange(n);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="text-base font-bold text-[var(--green)] bg-transparent border-b border-[var(--green)] outline-none text-right w-32"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setText(formatNumberWithCommas(value));
              setEditing(true);
            }}
            className="text-base font-bold text-[var(--green)] hover:underline"
          >
            {displayValue}
          </button>
        )}
      </div>
      <div className="relative h-1.5">
        <div className="absolute inset-0 rounded-full bg-[var(--border)]" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--green)]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer touch-pan-y"
          style={{ touchAction: "pan-y" }}
        />
        <div
          className="absolute -top-1.5 w-4 h-4 rounded-full bg-[var(--green)] shadow-[0_0_10px_rgba(0,200,5,0.6)] pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}
