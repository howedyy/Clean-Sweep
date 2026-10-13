"use client";

import { motion } from "framer-motion";
import { CalendarDays, Check, Copy, MapPin, PartyPopper, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ADDONS, SERVICES, TIME_SLOT_LABELS } from "@/lib/pricing";
import { formatGBP } from "@/lib/utils";
import type { BookingFormValues } from "@/lib/validation";
import { formatLongDate } from "./booking-steps";
import { bathLabel, bedLabel } from "./meta";

export type SubmitStatus = "idle" | "pending" | "success" | "error";

export function BookingSuccess({
  status,
  bookingId,
  values,
  total,
  onClose,
}: {
  status: SubmitStatus;
  bookingId: string | null;
  values: BookingFormValues;
  total: number;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const firstName = values.fullName.trim().split(/\s+/)[0];
  const confirmed = status === "success" && bookingId;

  const copy = async () => {
    if (!bookingId) return;
    await navigator.clipboard?.writeText(bookingId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const rows = [
    {
      icon: Sparkles,
      label: SERVICES[values.serviceType].label,
      sub: `${bedLabel(values.bedrooms)}, ${bathLabel(values.bathrooms)}${
        values.addons.length ? ` · ${values.addons.map((a) => ADDONS[a].label).join(", ")}` : ""
      }`,
    },
    {
      icon: CalendarDays,
      label: formatLongDate(values.preferredDate),
      sub: `${TIME_SLOT_LABELS[values.timeSlot].label} arrival, ${TIME_SLOT_LABELS[values.timeSlot].range}`,
    },
    { icon: MapPin, label: values.postcode.toUpperCase(), sub: "Service address postcode" },
  ];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
      <div className="flex flex-col items-center text-center">
        <div className="relative grid size-20 place-items-center">
          {confirmed && (
            <motion.span
              className="absolute inset-0 rounded-full bg-brand/20"
              initial={{ scale: 0.6, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              aria-hidden
            />
          )}
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="relative grid size-20 place-items-center rounded-full bg-brand text-white shadow-brand"
          >
            {confirmed ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.05 }}>
                <Check className="size-10" strokeWidth={3} />
              </motion.span>
            ) : (
              <span className="size-9 animate-spin rounded-full border-[3px] border-white/30 border-t-white" aria-hidden />
            )}
          </motion.span>
        </div>

        <h3 className="mt-5 text-2xl font-bold text-ink" aria-live="polite">
          {confirmed ? (
            <span className="inline-flex items-center gap-2">
              You&apos;re booked in, {firstName}! <PartyPopper className="size-6 text-amber-500" />
            </span>
          ) : (
            "Securing your slot…"
          )}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          {confirmed
            ? `We'll be in touch at ${values.email} to introduce your vetted cleaner.`
            : "Just a moment while we confirm availability with your local team."}
        </p>

        {/* Reference ID — fixed-height slot, so nothing shifts when it resolves */}
        <div className="mt-6 flex h-[72px] w-full max-w-xs items-center justify-between rounded-2xl bg-brand-soft px-4 ring-1 ring-brand/20">
          <div className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-hover">Booking reference</p>
            {confirmed ? (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-xl font-bold tracking-wide tabular-nums text-ink"
              >
                {bookingId}
              </motion.p>
            ) : (
              <span className="mt-1.5 block h-5 w-28 animate-pulse rounded bg-teal-200/60" />
            )}
          </div>
          <Button variant="outline" size="icon" className="size-9" disabled={!confirmed} onClick={copy} aria-label="Copy booking reference">
            {copied ? <Check className="size-4 text-brand" /> : <Copy className="size-4" />}
          </Button>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-2xl ring-1 ring-line">
        {rows.map(({ icon: Icon, label, sub }) => (
          <li key={label} className="flex items-center gap-3 p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-brand">
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{label}</p>
              <p className="truncate text-xs text-muted">{sub}</p>
            </div>
          </li>
        ))}
        <li className="flex items-center justify-between p-3.5">
          <span className="text-sm font-medium text-muted">Estimated total (VAT incl.)</span>
          <span className="font-display text-lg font-bold tabular-nums text-ink">{formatGBP(total)}</span>
        </li>
      </ul>

      <Button size="lg" className="mt-6 w-full" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}
