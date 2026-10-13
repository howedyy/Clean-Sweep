"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { BookingFormValues } from "@/lib/validation";
import { BookingModal } from "./booking-modal";

export type BookingPrefill = Partial<
  Pick<
    BookingFormValues,
    | "serviceType"
    | "bedrooms"
    | "bathrooms"
    | "commercialType"
    | "commercialHours"
    | "specialistType"
    | "specialistHours"
    | "frequency"
    | "addons"
  >
>;

interface BookingContextValue {
  /** Open the 3-step booking modal, optionally pre-populated (estimator, service cards). */
  openBooking: (prefill?: BookingPrefill) => void;
  /** Scroll to the contact form with a pre-filled subject (e.g. office quotes). */
  requestQuote: (subject: string) => void;
  quoteRequest: { subject: string; nonce: number } | null;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<{ prefill?: BookingPrefill; nonce: number }>({ nonce: 0 });
  const [quoteRequest, setQuoteRequest] = useState<BookingContextValue["quoteRequest"]>(null);

  const openBooking = useCallback((prefill?: BookingPrefill) => {
    setSession((s) => ({ prefill, nonce: s.nonce + 1 }));
    setOpen(true);
  }, []);

  const requestQuote = useCallback((subject: string) => {
    setQuoteRequest((q) => ({ subject, nonce: (q?.nonce ?? 0) + 1 }));
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(
    () => ({ openBooking, requestQuote, quoteRequest }),
    [openBooking, requestQuote, quoteRequest],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal open={open} onOpenChange={setOpen} session={session} />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
