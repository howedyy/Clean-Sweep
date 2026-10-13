import { randomInt } from "node:crypto";
import { z } from "zod";
import { ADDONS, estimatePrice, SERVICES, TIME_SLOT_LABELS } from "@/lib/pricing";
import { formatUkPostcode, normaliseUkPhone, bookingSchema } from "@/lib/validation";
import { formatGBP } from "@/lib/utils";
import { clientIp, rateLimit, sanitiseForSheet } from "@/lib/server-utils";

/**
 * POST /api/book
 * 1. Validates the payload with the shared Zod schema (UK postcode + phone).
 * 2. Recomputes the price server-side (never trusts the client total).
 * 3. Relays the booking to the Google Apps Script webhook (spec §5).
 */
export async function POST(request: Request) {
  if (!rateLimit(`book:${clientIp(request)}`, 5, 60_000)) {
    return Response.json(
      { ok: false, message: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        message: "Please check the highlighted fields.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const bookingId = `CSO-${randomInt(100000, 1000000)}`;

  // Honeypot tripped: pretend success, write nothing.
  if (data.company) {
    return Response.json({ ok: true, bookingId });
  }

  if (!isWithinBookingWindow(data.preferredDate)) {
    return Response.json(
      {
        ok: false,
        message: "Please choose a date within the next 30 days.",
        fieldErrors: { preferredDate: ["Please choose a date within the next 30 days"] },
      },
      { status: 422 },
    );
  }

  const estimate = estimatePrice({
    service: data.serviceType,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    commercialHours: data.commercialHours,
    specialistHours: data.specialistHours,
    addons: data.addons,
    frequency: data.frequency,
  });
  const subscribed = estimate.discounted;

  const propertySpecs =
    data.serviceType === "commercial"
      ? `${data.commercialType ?? "Offices"} (${data.commercialHours ?? "3"} hrs)`
      : data.serviceType === "specialist"
      ? `${data.specialistType ?? "Gardening"} (${data.specialistHours ?? "2"} hrs)`
      : `${data.bedrooms ?? "2"} bed / ${data.bathrooms ?? "1"} bath`;

  // Shape matches the Apps Script `doPost` in spec.md §5.1.
  const payload = {
    bookingId,
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    phone: normaliseUkPhone(data.phone)!,
    postcode: data.postcode ? formatUkPostcode(data.postcode) : "London & Surrounding Areas",
    serviceType: `${SERVICES[data.serviceType]?.label ?? "Cleaning"}${subscribed ? " (Contract −15%)" : " (One-off)"}`,
    propertySpecs,
    addons: data.addons.length ? data.addons.map((a) => ADDONS[a]?.label).filter(Boolean).join(", ") : "None",
    preferredDate: toUkDate(data.preferredDate),
    timeSlot: `${TIME_SLOT_LABELS[data.timeSlot]?.label ?? "Day"} ${TIME_SLOT_LABELS[data.timeSlot]?.range ?? ""}`,
    estimatedPrice: formatGBP(estimate.total),
    notes: data.notes ?? "",
  };

  const webhookUrl = process.env.GOOGLE_SCRIPT_WEBHOOK_URL;
  if (!webhookUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api/book] GOOGLE_SCRIPT_WEBHOOK_URL not set — booking logged only:", payload);
      return Response.json({ ok: true, bookingId, devMode: true });
    }
    console.error("[api/book] GOOGLE_SCRIPT_WEBHOOK_URL is not configured");
    return Response.json(
      { ok: false, message: "Online booking is temporarily unavailable. Please call us to book." },
      { status: 503 },
    );
  }

  try {
    // Apps Script answers POSTs with a 302 to script.googleusercontent.com; fetch follows it.
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitiseForSheet(payload)),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await res.json().catch(() => null)) as { result?: string; message?: string } | null;

    if (!res.ok || result?.result !== "success") {
      console.error("[api/book] Webhook rejected booking", res.status, result);
      throw new Error("Webhook error");
    }
  } catch (err) {
    console.error("[api/book] Failed to relay booking", err);
    return Response.json(
      { ok: false, message: "We couldn't confirm your booking just now. Please try again in a moment." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, bookingId });
}

/** "2026-10-08" -> "08/10/2026" */
function toUkDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Accepts tomorrow … +31 days (London time), with a day of slack for client timezones. */
function isWithinBookingWindow(iso: string) {
  const londonToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
  const toDay = (s: string) => Math.floor(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 86_400_000);
  const diff = toDay(iso) - toDay(londonToday);
  return Number.isFinite(diff) && diff >= 0 && diff <= 31;
}
