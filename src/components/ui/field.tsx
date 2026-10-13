"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputBase =
  "block w-full rounded-xl border bg-white px-4 text-[15px] text-ink placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-4";

export function inputState(error?: boolean, valid?: boolean) {
  if (error) return "border-rose-300 focus:border-rose-400 focus:ring-rose-100";
  if (valid) return "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-50";
  return "border-line hover:border-slate-300 focus:border-brand focus:ring-brand/10";
}

/**
 * Label + control + (reserved-height) error line.
 * The message slot always occupies space, so validation never shifts layout.
 */
export function Field({
  id,
  label,
  hint,
  error,
  valid,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  valid?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      <div className="relative">
        {children}
        <AnimatePresence>
          {valid && !error && (
            <motion.span
              key="tick"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 28 }}
              className="pointer-events-none absolute right-3 top-3 text-emerald-500"
              aria-hidden
            >
              <CheckCircle2 className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p
        id={`${id}-error`}
        role={error ? "alert" : undefined}
        className={cn(
          "mt-1 flex min-h-5 items-center gap-1 text-xs font-medium text-rose-600 transition-opacity",
          error ? "opacity-100" : "opacity-0",
        )}
      >
        {error && <AlertCircle className="size-3.5" aria-hidden />}
        {error}
      </p>
    </div>
  );
}

export function TextInput({
  error,
  valid,
  className,
  ...props
}: ComponentProps<"input"> & { error?: boolean; valid?: boolean }) {
  return (
    <input
      aria-invalid={error || undefined}
      className={cn(inputBase, "h-12", inputState(error, valid), valid && "pr-11", className)}
      {...props}
    />
  );
}

export function TextArea({
  error,
  className,
  ...props
}: ComponentProps<"textarea"> & { error?: boolean }) {
  return (
    <textarea
      aria-invalid={error || undefined}
      className={cn(inputBase, "resize-none py-3", inputState(error), className)}
      {...props}
    />
  );
}
