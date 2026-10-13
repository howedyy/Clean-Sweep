"use client";

import { motion } from "framer-motion";
import { CalendarDays, Check, MapPin, Pencil } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Segmented, Stepper } from "@/components/ui/controls";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import {
  ADDON_IDS,
  ADDONS,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  COMMERCIAL_HOURS,
  COMMERCIAL_TYPES,
  COMMERCIAL_TYPE_LABELS,
  FROM_PRICES,
  SERVICE_IDS,
  SERVICES,
  SPECIALIST_HOURS,
  SPECIALIST_TYPES,
  SPECIALIST_TYPE_LABELS,
  TIME_SLOT_LABELS,
  TIME_SLOTS,
  type AddonId,
} from "@/lib/pricing";
import { cn, formatGBPWhole } from "@/lib/utils";
import {
  formatUkPostcode,
  isValidEmail,
  isValidUkPhone,
  isValidUkPostcode,
  type BookingFormValues,
} from "@/lib/validation";
import { ADDON_ICONS, SERVICE_ICONS, SLOT_ICONS, bathLabel, bedLabel, hourLabel } from "./meta";

const opt = { shouldValidate: true, shouldDirty: true } as const;

function StepLabel({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-2">
      <h3 className="font-sans text-sm font-semibold tracking-normal text-ink">{children}</h3>
      {aside && <span className="text-xs text-muted">{aside}</span>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 1 — Scope                                                             */
/* -------------------------------------------------------------------------- */
export function StepScope() {
  const { control, setValue } = useFormContext<BookingFormValues>();
  const [
    service = "commercial",
    frequency = "one-off",
    bedrooms = "2",
    bathrooms = "1",
    commercialType = "offices",
    commercialHours = "3",
    specialistType = "gardening",
    specialistHours = "2",
    addons = [],
  ] = useWatch({
    control,
    name: [
      "serviceType",
      "frequency",
      "bedrooms",
      "bathrooms",
      "commercialType",
      "commercialHours",
      "specialistType",
      "specialistHours",
      "addons",
    ],
  });

  const toggleAddon = (id: AddonId) =>
    setValue("addons", addons.includes(id) ? addons.filter((a) => a !== id) : [...addons, id], opt);

  const isSubscribable = SERVICES[service]?.subscribable;

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <section>
        <StepLabel aside="Choose from our core services">Service</StepLabel>
        <div role="radiogroup" aria-label="Service" className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {SERVICE_IDS.map((id) => {
            const Icon = SERVICE_ICONS[id];
            const active = service === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setValue("serviceType", id, opt)}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 rounded-2xl p-3 text-left ring-1 transition-all duration-200 active:scale-[0.98] sm:p-3.5",
                  active ? "bg-brand-soft ring-2 ring-brand" : "bg-white ring-line hover:ring-brand/40",
                  id === "specialist" && "col-span-2 sm:col-span-1",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-xl transition-colors",
                      active ? "bg-brand text-white" : "bg-surface text-brand",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  {active && (
                    <motion.span
                      layoutId="svc-check"
                      className="grid size-4 place-items-center rounded-full bg-brand text-white"
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </motion.span>
                  )}
                </div>
                <div>
                  <span className="block text-[13px] font-semibold leading-tight text-ink sm:text-sm">
                    {SERVICES[id].short}
                  </span>
                  <span className="block text-[11px] text-muted mt-0.5">
                    from {formatGBPWhole(FROM_PRICES[id])}
                    {(id === "commercial" || id === "regular") && "/hr"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Frequency */}
      <section>
        <StepLabel aside={!isSubscribable ? "One-off service" : undefined}>
          How often?
        </StepLabel>
        <Segmented
          label="Frequency"
          value={isSubscribable ? frequency : "one-off"}
          onChange={(v) => isSubscribable && setValue("frequency", v, opt)}
          options={[
            { value: "one-off", label: "One-off clean" },
            { value: "subscription", label: "Regular contract (Save 15%)" },
          ]}
          className={cn(!isSubscribable && "pointer-events-none opacity-50")}
        />
      </section>

      {/* Dynamic Property Specifications based on Service */}
      {service === "commercial" ? (
        <section className="space-y-4 rounded-2xl bg-surface/50 p-4 ring-1 ring-line">
          <div>
            <StepLabel aside="Offices, retail or communal">Premises Type</StepLabel>
            <Segmented
              label="Commercial Premises"
              value={commercialType}
              onChange={(v) => setValue("commercialType", v as any, opt)}
              options={COMMERCIAL_TYPES.map((t) => ({
                value: t,
                label: COMMERCIAL_TYPE_LABELS[t],
              }))}
            />
          </div>
          <div>
            <StepLabel aside="£25 per hour">Estimated Initial Hours</StepLabel>
            <Stepper
              label="Hours"
              value={commercialHours}
              options={COMMERCIAL_HOURS}
              unit={hourLabel}
              onChange={(v) => setValue("commercialHours", v as any, opt)}
            />
          </div>
        </section>
      ) : service === "specialist" ? (
        <section className="space-y-4 rounded-2xl bg-surface/50 p-4 ring-1 ring-line">
          <div>
            <StepLabel aside="Gardening, odd jobs & property support">Service Focus</StepLabel>
            <Segmented
              label="Specialist Focus"
              value={specialistType}
              onChange={(v) => setValue("specialistType", v as any, opt)}
              options={SPECIALIST_TYPES.map((t) => ({
                value: t,
                label: SPECIALIST_TYPE_LABELS[t],
              }))}
            />
          </div>
          <div>
            <StepLabel aside="Bespoke project rate">Estimated Hours</StepLabel>
            <Stepper
              label="Hours"
              value={specialistHours}
              options={SPECIALIST_HOURS}
              unit={hourLabel}
              onChange={(v) => setValue("specialistHours", v as any, opt)}
            />
          </div>
        </section>
      ) : (
        <section>
          <StepLabel>Property size</StepLabel>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <Stepper
              label="Bedrooms"
              value={bedrooms}
              options={BEDROOM_OPTIONS}
              unit={bedLabel}
              onChange={(v) => setValue("bedrooms", v, opt)}
            />
            <Stepper
              label="Bathrooms"
              value={bathrooms}
              options={BATHROOM_OPTIONS}
              unit={bathLabel}
              onChange={(v) => setValue("bathrooms", v, opt)}
            />
          </div>
        </section>
      )}

      {/* Specialist Add-ons */}
      <section>
        <StepLabel aside="Optional specialist services">Specialist Add-ons</StepLabel>
        <div className="grid gap-2 sm:grid-cols-3 sm:gap-2.5">
          {ADDON_IDS.map((id) => {
            const Icon = ADDON_ICONS[id];
            const on = addons.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleAddon(id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-2xl p-2.5 text-left ring-1 transition-all duration-200 active:scale-[0.98] sm:p-3",
                  on ? "bg-brand-soft ring-2 ring-brand" : "bg-white ring-line hover:ring-brand/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-xl transition-colors",
                    on ? "bg-brand text-white" : "bg-surface text-muted",
                  )}
                >
                  {on ? <Check className="size-3.5" strokeWidth={3} /> : <Icon className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink leading-tight">{ADDONS[id].label}</span>
                  <span className="block text-[11px] text-muted">+{formatGBPWhole(ADDONS[id].price)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 2 — Schedule & Postcode                                               */
/* -------------------------------------------------------------------------- */
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function formatLongDate(iso: string, weekday: "long" | "short" = "long") {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { weekday, day: "numeric", month: weekday === "long" ? "long" : "short" }).format(
    new Date(y, m - 1, d),
  );
}

export function StepSchedule() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormValues>();
  const [preferredDate, timeSlot] = useWatch({
    control,
    name: ["preferredDate", "timeSlot"],
  });
  const railRef = useRef<HTMLDivElement>(null);

  // Next 30 days, starting tomorrow. Only computed client-side once the modal opens.
  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i + 1);
      return d;
    });
  }, []);

  useEffect(() => {
    railRef.current
      ?.querySelector<HTMLElement>('[aria-checked="true"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  const wd = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
  const mo = new Intl.DateTimeFormat("en-GB", { month: "short" });

  return (
    <div className="space-y-6">

      <section>
        <StepLabel aside={preferredDate ? formatLongDate(preferredDate) : "Next 30 days"}>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-brand" /> Date
          </span>
        </StepLabel>
        <div className="relative -mx-5 sm:-mx-7">
          <div
            ref={railRef}
            role="radiogroup"
            aria-label="Preferred date"
            className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:px-7"
          >
            {days.map((d) => {
              const iso = toISODate(d);
              const active = iso === preferredDate;
              return (
                <button
                  key={iso}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={formatLongDate(iso)}
                  onClick={() => setValue("preferredDate", iso, opt)}
                  className={cn(
                    "flex h-[76px] w-[62px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl ring-1 transition-all duration-200 active:scale-95",
                    active
                      ? "bg-brand text-white shadow-brand ring-brand"
                      : "bg-white text-ink ring-line hover:ring-brand/40",
                  )}
                >
                  <span className={cn("text-[11px] font-medium uppercase", active ? "text-teal-100" : "text-muted")}>
                    {wd.format(d)}
                  </span>
                  <span className="font-display text-xl font-bold leading-tight">{d.getDate()}</span>
                  <span className={cn("text-[11px]", active ? "text-teal-100" : "text-muted")}>{mo.format(d)}</span>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white" aria-hidden />
        </div>
        <p role={errors.preferredDate ? "alert" : undefined} className="mt-1 min-h-5 text-xs font-medium text-rose-600">
          {errors.preferredDate?.message}
        </p>
      </section>

      <section>
        <StepLabel>Arrival window</StepLabel>
        <div role="radiogroup" aria-label="Time slot" className="grid grid-cols-2 gap-2 sm:gap-3">
          {TIME_SLOTS.map((slot) => {
            const Icon = SLOT_ICONS[slot];
            const active = slot === timeSlot;
            return (
              <button
                key={slot}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setValue("timeSlot", slot, opt)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition-all duration-200 active:scale-[0.98]",
                  active ? "bg-brand-soft ring-2 ring-brand" : "bg-white ring-line hover:ring-brand/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    active ? "bg-brand text-white" : "bg-amber-50 text-amber-500",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{TIME_SLOT_LABELS[slot].label}</span>
                  <span className="block text-xs tabular-nums text-muted">{TIME_SLOT_LABELS[slot].range}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 3 — Customer info                                                     */
/* -------------------------------------------------------------------------- */
export function StepCustomer({ onEdit }: { onEdit: (step: number) => void }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<BookingFormValues>();
  const v = useWatch({ control }) as BookingFormValues;

  const phoneValid = isValidUkPhone(v.phone ?? "");
  const emailValid = isValidEmail(v.email ?? "");

  const serviceSpecText =
    v.serviceType === "commercial"
      ? `${COMMERCIAL_TYPE_LABELS[v.commercialType ?? "offices"]}, ${v.commercialHours ?? "3"} hrs`
      : v.serviceType === "specialist"
      ? `${SPECIALIST_TYPE_LABELS[v.specialistType ?? "gardening"]}, ${v.specialistHours ?? "2"} hrs`
      : `${bedLabel(v.bedrooms ?? "2")}, ${bathLabel(v.bathrooms ?? "1")}`;

  return (
    <div className="space-y-5">
      {/* Compact summary with quick edit links */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line">
        <SummaryCell
          label="Service"
          value={`${SERVICES[v.serviceType]?.short ?? "Service"} · ${serviceSpecText}`}
          onEdit={() => onEdit(0)}
        />
        <SummaryCell
          label="Preferred schedule"
          value={`${v.preferredDate ? formatLongDate(v.preferredDate, "short") : "—"} · ${TIME_SLOT_LABELS[v.timeSlot]?.label ?? "Window"}`}
          onEdit={() => onEdit(1)}
        />
      </div>

      <Field id="fullName" label="Full name" error={errors.fullName?.message} valid={(v.fullName ?? "").trim().length >= 2}>
        <TextInput
          id="fullName"
          placeholder="e.g. Sarah Mitchell"
          autoComplete="name"
          error={!!errors.fullName}
          valid={(v.fullName ?? "").trim().length >= 2}
          aria-describedby="fullName-error"
          {...register("fullName")}
        />
      </Field>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field id="phone" label="UK phone number" error={errors.phone?.message} valid={phoneValid}>
          <span className="pointer-events-none absolute left-1.5 top-1.5 grid h-9 place-items-center rounded-lg bg-surface px-2.5 text-sm font-semibold text-muted ring-1 ring-line">
            +44
          </span>
          <TextInput
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="7566 227825"
            autoComplete="tel"
            className="pl-[4.25rem]"
            error={!!errors.phone}
            valid={phoneValid}
            aria-describedby="phone-error"
            {...register("phone")}
          />
        </Field>
        <Field id="email" label="Email address" error={errors.email?.message} valid={emailValid}>
          <TextInput
            id="email"
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={!!errors.email}
            valid={emailValid}
            aria-describedby="email-error"
            {...register("email")}
          />
        </Field>
      </div>

      <Field id="notes" label="Access & requirements" hint="Optional" error={errors.notes?.message}>
        <TextArea
          id="notes"
          rows={3}
          placeholder="e.g. Commercial access details, key safe code, or specialist priorities..."
          error={!!errors.notes}
          {...register("notes")}
        />
      </Field>

      {/* Honeypot (hidden from humans & assistive tech) */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <p className="text-xs text-muted">
        By confirming you agree to our terms. No payment is taken now — you&apos;ll only pay after your clean,
        and you can reschedule free of charge up to 24 hours before.
      </p>
    </div>
  );
}

function SummaryCell({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-2 bg-surface p-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 text-[13px] font-medium leading-snug text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label.toLowerCase()}`}
        className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white hover:text-brand"
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}
