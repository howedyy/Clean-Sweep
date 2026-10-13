import { z } from "zod";
import {
  ADDON_IDS,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  FREQUENCIES,
  SERVICE_IDS,
  TIME_SLOTS,
} from "./pricing";

/* -------------------------------------------------------------------------- */
/*                                UK postcodes                                */
/* -------------------------------------------------------------------------- */

// Royal Mail format (incl. GIR 0AA). Space optional; case-insensitive.
const UK_POSTCODE =
  /^(GIR ?0AA|[A-PR-UWYZ](\d{1,2}|[A-HK-Y]\d{1,2}|\d[A-HJKPSTUW]|[A-HK-Y]\d[ABEHMNPRV-Y]) ?\d[ABD-HJLNP-UW-Z]{2})$/i;

export function isValidUkPostcode(value: string) {
  return UK_POSTCODE.test(value.trim());
}

/** "sw1a1aa" -> "SW1A 1AA" */
export function formatUkPostcode(value: string) {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5) return value.toUpperCase();
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

/* -------------------------------------------------------------------------- */
/*                                 UK phones                                  */
/* -------------------------------------------------------------------------- */

/**
 * Accepts "07700 900123", "+44 7700 900123", "0044…", "7700900123", "020 7946 0018".
 * Returns E.164 ("+447700900123") or null when not a valid UK number.
 */
export function normaliseUkPhone(value: string): string | null {
  let digits = value.replace(/[\s().-]/g, "");
  if (digits.startsWith("+44")) digits = digits.slice(3);
  else if (digits.startsWith("0044")) digits = digits.slice(4);
  if (digits.startsWith("0")) digits = digits.slice(1);
  // Mobiles (7…) and geographic/non-geographic (1…, 2…, 3…): 9–10 national digits.
  return /^[1237]\d{8,9}$/.test(digits) ? `+44${digits}` : null;
}

export function isValidUkPhone(value: string) {
  return normaliseUkPhone(value) !== null;
}

export function isValidEmail(value: string) {
  return z.email().safeParse(value.trim()).success;
}

/* -------------------------------------------------------------------------- */
/*                                  Schemas                                   */
/* -------------------------------------------------------------------------- */

export const bookingSchema = z.object({
  // Step 1 — Scope
  serviceType: z.enum(SERVICE_IDS, { error: "Choose a service" }),
  bedrooms: z.enum(BEDROOM_OPTIONS),
  bathrooms: z.enum(BATHROOM_OPTIONS),
  frequency: z.enum(FREQUENCIES),
  addons: z.array(z.enum(ADDON_IDS)).max(ADDON_IDS.length),
  // Step 2 — Schedule & Postcode
  postcode: z.string().trim().refine(isValidUkPostcode, "Enter a valid UK postcode, e.g. SW1A 1AA"),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date for your clean"),
  timeSlot: z.enum(TIME_SLOTS, { error: "Pick a time slot" }),
  // Step 3 — Customer info
  fullName: z.string().trim().min(2, "Please enter your full name").max(80, "Name is too long"),
  phone: z.string().trim().refine(isValidUkPhone, "Enter a valid UK number, e.g. 07700 900123"),
  email: z.string().trim().refine(isValidEmail, "Enter a valid email address"),
  notes: z.string().trim().max(500, "Please keep notes under 500 characters").optional(),
  // Honeypot — real users never see or fill this.
  company: z.string().max(0).optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

export const BOOKING_STEP_FIELDS = [
  ["serviceType", "bedrooms", "bathrooms", "frequency", "addons"],
  ["postcode", "preferredDate", "timeSlot"],
  ["fullName", "phone", "email", "notes"],
] as const satisfies readonly (readonly (keyof BookingFormValues)[])[];

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().refine(isValidEmail, "Enter a valid email address"),
  subject: z.string().trim().min(3, "Add a short subject").max(120),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(2000),
  company: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
