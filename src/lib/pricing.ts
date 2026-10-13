/**
 * Single source of truth for Clean Sweep Oasis LTD pricing.
 * Imported by the UI (live estimates) AND by /api/book (server-side recompute),
 * so a tampered client payload can never change the price written to the sheet.
 * All prices are in GBP and include VAT.
 */

export const SERVICE_IDS = ["commercial", "regular", "deep", "tenancy", "specialist"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const BEDROOM_OPTIONS = ["1", "2", "3+"] as const;
export type Bedrooms = (typeof BEDROOM_OPTIONS)[number];

export const BATHROOM_OPTIONS = ["1", "2+"] as const;
export type Bathrooms = (typeof BATHROOM_OPTIONS)[number];

export const COMMERCIAL_TYPES = ["offices", "retail", "communal"] as const;
export type CommercialType = (typeof COMMERCIAL_TYPES)[number];

export const COMMERCIAL_HOURS = ["2", "3", "4", "6", "8+"] as const;
export type CommercialHours = (typeof COMMERCIAL_HOURS)[number];

export const SPECIALIST_TYPES = ["gardening", "oddjobs", "combined"] as const;
export type SpecialistType = (typeof SPECIALIST_TYPES)[number];

export const SPECIALIST_HOURS = ["2", "3", "4", "6+"] as const;
export type SpecialistHours = (typeof SPECIALIST_HOURS)[number];

export const FREQUENCIES = ["one-off", "subscription"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const ADDON_IDS = ["carpet", "windows", "oven", "gardening", "oddjobs"] as const;
export type AddonId = (typeof ADDON_IDS)[number];

export const TIME_SLOTS = ["morning", "afternoon"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const HOURLY_RATE = 18;
export const COMMERCIAL_HOURLY_RATE = 25;
export const SPECIALIST_HOURLY_RATE = 22;
export const SUBSCRIPTION_DISCOUNT = 0.15;

export const SERVICES: Record<
  ServiceId,
  { label: string; short: string; description: string; subscribable: boolean }
> = {
  commercial: {
    label: "Commercial Cleaning",
    short: "Commercial",
    description: "Offices, Retail Premises & Communal Areas",
    subscribable: true,
  },
  regular: {
    label: "Domestic Cleaning",
    short: "Domestic Clean",
    description: "One-Off Visits & Regular Visits",
    subscribable: true,
  },
  deep: {
    label: "Deep Clean",
    short: "Deep Clean",
    description: "Intensive top-to-bottom property scrub",
    subscribable: true,
  },
  tenancy: {
    label: "End of Tenancy Clean",
    short: "End of Tenancy",
    description: "Agency checklist standard deposit return",
    subscribable: false,
  },
  specialist: {
    label: "Gardening & Odd Jobs",
    short: "Gardening / Odd Jobs",
    description: "Outdoor maintenance, weeding & minor repairs",
    subscribable: false,
  },
};

export const COMMERCIAL_TYPE_LABELS: Record<CommercialType, string> = {
  offices: "Offices",
  retail: "Retail Premises",
  communal: "Communal Areas",
};

export const SPECIALIST_TYPE_LABELS: Record<SpecialistType, string> = {
  gardening: "Gardening",
  oddjobs: "Odd Jobs",
  combined: "Garden & Odd Jobs",
};

export const ADDONS: Record<AddonId, { label: string; price: number }> = {
  carpet: { label: "Carpet Clean", price: 45 },
  windows: { label: "Windows Cleaning", price: 25 },
  oven: { label: "Oven Clean", price: 35 },
  gardening: { label: "Gardening Tidy", price: 40 },
  oddjobs: { label: "Odd Jobs Support", price: 35 },
};

export const TIME_SLOT_LABELS: Record<TimeSlot, { label: string; range: string }> = {
  morning: { label: "Morning", range: "08:00–12:00" },
  afternoon: { label: "Afternoon", range: "12:00–16:00" },
};

/** Starting ("From") prices shown on service cards (from client presentation). */
export const FROM_PRICES: Record<ServiceId, number> = {
  commercial: COMMERCIAL_HOURLY_RATE,
  regular: HOURLY_RATE,
  deep: 120,
  tenancy: 150,
  specialist: 44, // 2 hrs @ £22
};

const bedIndex = (b: Bedrooms = "2") => BEDROOM_OPTIONS.indexOf(b); // 0,1,2
const bathIndex = (b: Bathrooms = "1") => BATHROOM_OPTIONS.indexOf(b); // 0,1

/** Estimated hours for a regular clean (1 bed / 1 bath = 3h). */
export function regularHours(bedrooms: Bedrooms = "2", bathrooms: Bathrooms = "1") {
  return 3 + bedIndex(bedrooms) * 1 + bathIndex(bathrooms) * 0.5;
}

function basePrice(
  service: ServiceId,
  bedrooms: Bedrooms = "2",
  bathrooms: Bathrooms = "1",
  commercialHours: CommercialHours = "3",
  specialistHours: SpecialistHours = "2",
) {
  switch (service) {
    case "commercial": {
      const h = parseInt(commercialHours, 10) || 3;
      return h * COMMERCIAL_HOURLY_RATE;
    }
    case "regular":
      return regularHours(bedrooms, bathrooms) * HOURLY_RATE;
    case "deep":
      return 120 + bedIndex(bedrooms) * 40 + bathIndex(bathrooms) * 30;
    case "tenancy":
      return 150 + bedIndex(bedrooms) * 45 + bathIndex(bathrooms) * 30;
    case "specialist": {
      const h = parseInt(specialistHours, 10) || 2;
      return h * SPECIALIST_HOURLY_RATE;
    }
  }
}

export interface EstimateInput {
  service: ServiceId;
  bedrooms?: Bedrooms;
  bathrooms?: Bathrooms;
  commercialType?: CommercialType;
  commercialHours?: CommercialHours;
  specialistType?: SpecialistType;
  specialistHours?: SpecialistHours;
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
  bedrooms = "2",
  bathrooms = "1",
  commercialHours = "3",
  specialistHours = "2",
  addons = [],
  frequency = "one-off",
}: EstimateInput): Estimate {
  const base = basePrice(service, bedrooms, bathrooms, commercialHours, specialistHours);
  const discounted = frequency === "subscription" && SERVICES[service]?.subscribable;
  const discount = discounted ? round2(base * SUBSCRIPTION_DISCOUNT) : 0;
  const addonsTotal = [...new Set(addons)].reduce((sum, id) => sum + (ADDONS[id]?.price ?? 0), 0);
  
  let hours: number | null = null;
  if (service === "commercial") hours = parseInt(commercialHours, 10) || 3;
  else if (service === "regular") hours = regularHours(bedrooms, bathrooms);
  else if (service === "specialist") hours = parseInt(specialistHours, 10) || 2;

  return {
    base,
    discount,
    addonsTotal,
    total: round2(base - discount + addonsTotal),
    hours,
    discounted,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
