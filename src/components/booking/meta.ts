import {
  Building2,
  CookingPot,
  Grid2x2,
  House,
  KeyRound,
  Sparkles,
  Sun,
  Sunset,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { AddonId, ServiceId, TimeSlot } from "@/lib/pricing";

export const SERVICE_ICONS: Record<ServiceId | "office", LucideIcon> = {
  regular: House,
  deep: Sparkles,
  tenancy: KeyRound,
  office: Building2,
};

export const ADDON_ICONS: Record<AddonId, LucideIcon> = {
  oven: CookingPot,
  windows: Grid2x2,
  carpet: Waves,
};

export const SLOT_ICONS: Record<TimeSlot, LucideIcon> = {
  morning: Sun,
  afternoon: Sunset,
};

export const bedLabel = (v: string) => `${v} bed`;
export const bathLabel = (v: string) => `${v} bath`;
