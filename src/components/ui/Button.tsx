"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[var(--green)] text-black hover:bg-[var(--green-light)] shadow-[0_0_20px_rgba(0,200,5,0.4)]",
    secondary:
      "bg-[var(--surface-light)] text-white border border-[var(--border-light)] hover:bg-[var(--card-hover)]",
    ghost: "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--card-hover)]",
    danger: "bg-[var(--red)] text-white hover:opacity-90",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3.5 text-base rounded-xl",
  };
  return (
    <button
      {...rest}
      className={cn(
        "font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}
