/**
 * Single source of truth for Clean Swap pricing.
 * Imported by the UI (live estimates) AND by /api/book (server-side recompute),
 * so a tampered client payload can never change the price written to the sheet.
 * All prices are in GBP and include VAT.
 */

export const SERVICE_IDS = ["regular", "deep", "tenancy"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const BEDROOM_OPTIONS = ["1", "2", "3+"] as const;
export type Bedrooms = (typeof BEDROOM_OPTIONS)[number];

export const BATHROOM_OPTIONS = ["1", "2+"] as const;
export type Bathrooms = (typeof BATHROOM_OPTIONS)[number];

export const FREQUENCIES = ["one-off", "subscription"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const ADDON_IDS = ["oven", "windows", "carpet"] as const;
export type AddonId = (typeof ADDON_IDS)[number];

export const TIME_SLOTS = ["morning", "afternoon"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const HOURLY_RATE = 18;
export const SUBSCRIPTION_DISCOUNT = 0.15;

export const SERVICES: Record<
  ServiceId,
  { label: string; short: string; subscribable: boolean }
> = {
  regular: { label: "Regular Domestic Clean", short: "Regular Domestic", subscribable: true },
  deep: { label: "Deep Clean", short: "Deep Clean", subscribable: true },
  tenancy: { label: "End of Tenancy Clean", short: "End of Tenancy", subscribable: false },
};

export const ADDONS: Record<AddonId, { label: string; price: number }> = {
  oven: { label: "Oven Clean", price: 35 },
  windows: { label: "Inside Windows", price: 25 },
  carpet: { label: "Carpet Steam", price: 45 },
};

export const TIME_SLOT_LABELS: Record<TimeSlot, { label: string; range: string }> = {
  morning: { label: "Morning", range: "08:00–12:00" },
  afternoon: { label: "Afternoon", range: "12:00–16:00" },
};

/** Starting ("From") prices shown on service cards. */
export const FROM_PRICES = { regular: HOURLY_RATE, deep: 120, tenancy: 165 } as const;

const bedIndex = (b: Bedrooms) => BEDROOM_OPTIONS.indexOf(b); // 0,1,2
const bathIndex = (b: Bathrooms) => BATHROOM_OPTIONS.indexOf(b); // 0,1

/** Estimated hours for a regular clean (1 bed / 1 bath = 3h). */
export function regularHours(bedrooms: Bedrooms, bathrooms: Bathrooms) {
  return 3 + bedIndex(bedrooms) * 1 + bathIndex(bathrooms) * 0.5;
}

function basePrice(service: ServiceId, bedrooms: Bedrooms, bathrooms: Bathrooms) {
  switch (service) {
    case "regular":
      return regularHours(bedrooms, bathrooms) * HOURLY_RATE;
    case "deep":
      return 120 + bedIndex(bedrooms) * 40 + bathIndex(bathrooms) * 30;
    case "tenancy":
      return 165 + bedIndex(bedrooms) * 50 + bathIndex(bathrooms) * 35;
  }
}

export interface EstimateInput {
  service: ServiceId;
  bedrooms: Bedrooms;
  bathrooms: Bathrooms;
  addons?: readonly AddonId[];
  frequency?: Frequency;
}

export interface Estimate {
  base: number;
  discount: number;
  addonsTotal: number;
  total: number;
  hours: number | null;
  discounted: boolean;
}

export function estimatePrice({
  service,
  bedrooms,
  bathrooms,
  addons = [],
  frequency = "one-off",
}: EstimateInput): Estimate {
  const base = basePrice(service, bedrooms, bathrooms);
  const discounted = frequency === "subscription" && SERVICES[service].subscribable;
  const discount = discounted ? round2(base * SUBSCRIPTION_DISCOUNT) : 0;
  const addonsTotal = [...new Set(addons)].reduce((sum, id) => sum + ADDONS[id].price, 0);
  return {
    base,
    discount,
    addonsTotal,
    total: round2(base - discount + addonsTotal),
    hours: service === "regular" ? regularHours(bedrooms, bathrooms) : null,
    discounted,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
