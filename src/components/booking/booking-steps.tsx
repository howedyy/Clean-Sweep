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
  FROM_PRICES,
  SERVICE_IDS,
  SERVICES,
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
import { ADDON_ICONS, SERVICE_ICONS, SLOT_ICONS, bathLabel, bedLabel } from "./meta";

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
  const [service, frequency, bedrooms, bathrooms, addons] = useWatch({
    control,
    name: ["serviceType", "frequency", "bedrooms", "bathrooms", "addons"],
  });

  const toggleAddon = (id: AddonId) =>
    setValue("addons", addons.includes(id) ? addons.filter((a) => a !== id) : [...addons, id], opt);

  return (
    <div className="space-y-6">
      <section>
        <StepLabel>Service</StepLabel>
        <div role="radiogroup" aria-label="Service" className="grid grid-cols-3 gap-2 sm:gap-3">
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
                  "relative flex flex-col items-start gap-2 rounded-2xl p-3 text-left ring-1 transition-all duration-200 active:scale-[0.98] sm:p-4",
                  active ? "bg-brand-soft ring-2 ring-brand" : "bg-white ring-line hover:ring-brand/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl transition-colors",
                    active ? "bg-brand text-white" : "bg-surface text-brand",
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="text-[13px] font-semibold leading-tight text-ink sm:text-sm">
                  {SERVICES[id].short}
                </span>
                <span className="text-xs text-muted">
                  from {formatGBPWhole(FROM_PRICES[id])}
                  {id === "regular" && "/hr"}
                </span>
                {active && (
                  <motion.span
                    layoutId="svc-check"
                    className="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-brand text-white"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <StepLabel aside={!SERVICES[service].subscribable ? "One-off service" : undefined}>
          How often?
        </StepLabel>
        <Segmented
          label="Frequency"
          value={SERVICES[service].subscribable ? frequency : "one-off"}
          onChange={(v) => SERVICES[service].subscribable && setValue("frequency", v, opt)}
          options={[
            { value: "one-off", label: "One-off clean" },
            { value: "subscription", label: "Subscribe & save 15%" },
          ]}
          className={cn(!SERVICES[service].subscribable && "pointer-events-none opacity-50")}
        />
      </section>

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

      <section>
        <StepLabel aside="Optional">Add-ons</StepLabel>
        <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
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
                  "flex items-center gap-3 rounded-2xl p-3 text-left ring-1 transition-all duration-200 active:scale-[0.98]",
                  on ? "bg-brand-soft ring-2 ring-brand" : "bg-white ring-line hover:ring-brand/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                    on ? "bg-brand text-white" : "bg-surface text-muted",
                  )}
                >
                  {on ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-[18px]" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{ADDONS[id].label}</span>
                  <span className="block text-xs text-muted">+{formatGBPWhole(ADDONS[id].price)}</span>
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
    register,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormValues>();
  const [postcode, preferredDate, timeSlot] = useWatch({
    control,
    name: ["postcode", "preferredDate", "timeSlot"],
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
      <Field
        id="postcode"
        label="Postcode"
        hint="We cover Greater London & across the UK"
        error={errors.postcode?.message}
        valid={isValidUkPostcode(postcode)}
      >
        <MapPin className="pointer-events-none absolute left-4 top-3.5 size-5 text-slate-400" aria-hidden />
        <TextInput
          id="postcode"
          placeholder="e.g. SW1A 1AA"
          autoComplete="postal-code"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={9}
          className="pl-11 uppercase placeholder:normal-case"
          error={!!errors.postcode}
          valid={isValidUkPostcode(postcode)}
          aria-describedby="postcode-error"
          {...register("postcode", {
            onBlur: (e) => {
              if (e.target.value) setValue("postcode", formatUkPostcode(e.target.value), opt);
            },
          })}
        />
      </Field>

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

  return (
    <div className="space-y-5">
      {/* Compact summary with quick edit links */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line">
        <SummaryCell
          label="Service"
          value={`${SERVICES[v.serviceType].short} · ${bedLabel(v.bedrooms)}, ${bathLabel(v.bathrooms)}`}
          onEdit={() => onEdit(0)}
        />
        <SummaryCell
          label="When & where"
          value={`${v.preferredDate ? formatLongDate(v.preferredDate, "short") : "—"} · ${TIME_SLOT_LABELS[v.timeSlot].label} · ${v.postcode}`}
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
            placeholder="7700 900123"
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
            placeholder="you@example.co.uk"
            autoComplete="email"
            error={!!errors.email}
            valid={emailValid}
            aria-describedby="email-error"
            {...register("email")}
          />
        </Field>
      </div>

      <Field id="notes" label="Access notes" hint="Optional" error={errors.notes?.message}>
        <TextArea
          id="notes"
          rows={3}
          placeholder="e.g. Key safe by the front door, code 1234. Friendly cat called Biscuit."
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
