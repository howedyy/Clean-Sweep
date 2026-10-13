"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Segmented control (radio group) with a sliding active pill                 */
/* -------------------------------------------------------------------------- */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: ReactNode }[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("relative grid gap-1 rounded-2xl bg-surface p-1 ring-1 ring-line", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-xl px-2 font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              size === "sm" ? "h-9 text-xs sm:text-sm" : "h-11 text-sm",
              active ? "text-white" : "text-muted hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-xl bg-brand shadow-brand"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 block truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stepper: cycles through a fixed list of options (e.g. 1, 2, 3+)            */
/* -------------------------------------------------------------------------- */
export function Stepper<T extends string>({
  value,
  onChange,
  options,
  label,
  unit,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  label: string;
  unit: (v: T) => string;
}) {
  const index = options.indexOf(value);
  const btn =
    "grid size-9 place-items-center rounded-full bg-white text-ink ring-1 ring-line transition hover:ring-brand/50 hover:text-brand active:scale-95 disabled:opacity-35 disabled:pointer-events-none";
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-2.5 ring-1 ring-line">
      <span className="text-sm font-medium text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={index <= 0}
          onClick={() => onChange(options[index - 1])}
        >
          <Minus className="size-4" />
        </button>
        <output
          aria-live="polite"
          aria-label={label}
          className="w-14 text-center text-sm font-bold tabular-nums text-ink"
        >
          {unit(value)}
        </output>
        <button
          type="button"
          className={btn}
          aria-label={`More ${label.toLowerCase()}`}
          disabled={index >= options.length - 1}
          onClick={() => onChange(options[index + 1])}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
