"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CircleAlert, Lock, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch, type FieldPath } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { estimatePrice, SUBSCRIPTION_DISCOUNT } from "@/lib/pricing";
import { cn, formatGBP } from "@/lib/utils";
import { BOOKING_STEP_FIELDS, bookingSchema, type BookingFormValues } from "@/lib/validation";
import type { BookingPrefill } from "./booking-provider";
import { StepCustomer, StepSchedule, StepScope } from "./booking-steps";
import { BookingSuccess, type SubmitStatus } from "./booking-success";

const STEPS = ["Scope", "Schedule", "Your details"] as const;

const DEFAULTS: BookingFormValues = {
  serviceType: "commercial",
  bedrooms: "2",
  bathrooms: "1",
  commercialType: "offices",
  commercialHours: "3",
  specialistType: "gardening",
  specialistHours: "2",
  frequency: "one-off",
  addons: [],
  postcode: "",
  preferredDate: "",
  timeSlot: "morning",
  fullName: "",
  phone: "",
  email: "",
  notes: "",
  company: "",
};

const slide = {
  enter: (dir: number) => ({ x: dir * 36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -36, opacity: 0 }),
};

export function BookingModal({
  open,
  onOpenChange,
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: { prefill?: BookingPrefill; nonce: number };
}) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<BookingFormValues | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const seenNonce = useRef(0);

  // New session: apply prefill (or start fresh after a completed booking).
  // Opening without a prefill mid-booking keeps the visitor's progress.
  useEffect(() => {
    if (!open || session.nonce === seenNonce.current) return;
    seenNonce.current = session.nonce;
    if (!session.prefill && status !== "success") return;
    const prev = form.getValues();
    form.reset({
      ...DEFAULTS,
      // Remember contact details for repeat bookings in the same visit.
      fullName: prev.fullName,
      phone: prev.phone,
      email: prev.email,
      ...session.prefill,
    });
    setStep(0);
    setStatus("idle");
    setServerError(null);
    setBookingId(null);
  }, [open, session, status, form]);

  const [
    serviceType,
    bedrooms,
    bathrooms,
    commercialHours,
    specialistHours,
    frequency,
    addons,
  ] = useWatch({
    control: form.control,
    name: [
      "serviceType",
      "bedrooms",
      "bathrooms",
      "commercialHours",
      "specialistHours",
      "frequency",
      "addons",
    ],
  });
  const estimate = estimatePrice({
    service: serviceType ?? "commercial",
    bedrooms,
    bathrooms,
    commercialHours,
    specialistHours,
    addons,
    frequency,
  });

  const goTo = useCallback(
    (next: number) => {
      setDir(next > step ? 1 : -1);
      setStep(next);
      bodyRef.current?.scrollTo({ top: 0 });
    },
    [step],
  );

  const next = async () => {
    const ok = await form.trigger(BOOKING_STEP_FIELDS[step] as unknown as FieldPath<BookingFormValues>[]);
    if (ok) goTo(step + 1);
  };

  const onSubmit = async (values: BookingFormValues) => {
    // Optimistic: show the confirmation view immediately, then reconcile.
    setSubmitted(values);
    setServerError(null);
    setStatus("pending");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        bookingId?: string;
        message?: string;
        fieldErrors?: Partial<Record<keyof BookingFormValues, string[]>>;
      };

      if (!res.ok || !data.ok || !data.bookingId) {
        if (data.fieldErrors) {
          let firstStep = 2;
          for (const [field, messages] of Object.entries(data.fieldErrors)) {
            const name = field as keyof BookingFormValues;
            form.setError(name, { message: messages?.[0] });
            const idx = BOOKING_STEP_FIELDS.findIndex((f) => (f as readonly string[]).includes(name));
            if (idx >= 0) firstStep = Math.min(firstStep, idx);
          }
          goTo(firstStep);
        }
        throw new Error(data.message ?? "We couldn't confirm your booking. Please try again.");
      }

      setBookingId(data.bookingId);
      setStatus("success");
      void celebrate();
    } catch (err) {
      setStatus("error");
      setServerError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Connection problem — please check your internet and try again.",
      );
    }
  };

  const showSuccess = status === "pending" || status === "success";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cs-overlay fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby="booking-desc"
          className={cn(
            "cs-dialog fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl focus:outline-none",
            // Mobile: bottom sheet with a fixed height (no jumping between steps)
            "inset-x-0 bottom-0 h-[min(92dvh,780px)] rounded-t-[28px]",
            // Desktop: centred dialog
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[min(720px,90dvh)] sm:w-[min(680px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
          )}
        >
          {/* Grab handle (mobile) */}
          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" aria-hidden />

          {/* Header */}
          <div className="shrink-0 border-b border-line px-5 pb-4 pt-3 sm:px-7 sm:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-display text-xl font-bold text-ink sm:text-2xl">
                  {showSuccess ? "Booking confirmed" : "Book your clean"}
                </Dialog.Title>
                <Dialog.Description id="booking-desc" className="mt-0.5 text-sm text-muted">
                  {showSuccess
                    ? "Sit back, we've got it from here."
                    : `Step ${step + 1} of 3 · ${STEPS[step]} · takes under 60 seconds`}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close booking" className="-mr-2 -mt-1">
                  <X className="size-5" />
                </Button>
              </Dialog.Close>
            </div>
            {!showSuccess && (
              <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden>
                {STEPS.map((label, i) => (
                  <div key={label} className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full bg-brand"
                      initial={false}
                      animate={{ width: i <= step ? "100%" : "0%" }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {showSuccess && submitted ? (
            <BookingSuccess
              status={status}
              bookingId={bookingId}
              values={submitted}
              total={estimatePrice({
                service: submitted.serviceType,
                bedrooms: submitted.bedrooms,
                bathrooms: submitted.bathrooms,
                commercialHours: submitted.commercialHours,
                specialistHours: submitted.specialistHours,
                addons: submitted.addons,
                frequency: submitted.frequency,
              }).total}
              onClose={() => onOpenChange(false)}
            />
          ) : (
            <FormProvider {...form}>
              <form
                noValidate
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step < 2) void next();
                  else void form.handleSubmit(onSubmit)(e);
                }}
              >
                {/* Body */}
                <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
                  {serverError && (
                    <div
                      role="alert"
                      className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200"
                    >
                      <CircleAlert className="mt-0.5 size-4 shrink-0" />
                      {serverError}
                    </div>
                  )}
                  <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      {step === 0 && <StepScope />}
                      {step === 1 && <StepSchedule />}
                      {step === 2 && <StepCustomer onEdit={goTo} />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer: live price + navigation */}
                <div className="shrink-0 border-t border-line bg-surface/80 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-7">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted">Estimated total</p>
                      <p className="font-display text-2xl font-bold tabular-nums text-ink">
                        <AnimatedNumber value={estimate.total} format={formatGBP} />
                      </p>
                      <p className="truncate text-xs text-muted">
                        {estimate.discounted
                          ? `Incl. ${SUBSCRIPTION_DISCOUNT * 100}% subscriber saving · VAT incl.`
                          : estimate.hours
                            ? `Approx. ${estimate.hours} hrs · VAT included`
                            : "Fixed price · VAT included"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {step > 0 && (
                        <Button variant="outline" size="icon" className="size-12" aria-label="Back" onClick={() => goTo(step - 1)}>
                          <ArrowLeft className="size-5" />
                        </Button>
                      )}
                      <Button type="submit" size="lg" className="h-12 px-5 sm:px-7">
                        {step < 2 ? (
                          <>
                            Continue <ArrowRight className="size-4" />
                          </>
                        ) : (
                          <>
                            <Lock className="size-4" /> Confirm booking
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </FormProvider>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

async function celebrate() {
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#0D9488", "#14B8A6", "#5EEAD4", "#CCFBF1", "#FBBF24"];
  const base = { colors, zIndex: 9999, disableForReducedMotion: true, ticks: 220 };
  confetti({ ...base, particleCount: 120, spread: 75, startVelocity: 42, origin: { y: 0.55 } });
  setTimeout(() => {
    confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
  }, 180);
}
