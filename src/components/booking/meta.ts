import {
  Building2,
  CookingPot,
  Grid2x2,
  House,
  KeyRound,
  Sparkles,
  Sun,
  Sunset,
  Trees,
  Waves,
  Wrench,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import type { AddonId, ServiceId, TimeSlot } from "@/lib/pricing";

export const SERVICE_ICONS: Record<ServiceId, LucideIcon> = {
  commercial: Building2,
  regular: House,
  deep: Sparkles,
  tenancy: KeyRound,
  specialist: Trees,
};

export const ADDON_ICONS: Record<AddonId, LucideIcon> = {
  carpet: Waves,
  windows: Grid2x2,
  oven: CookingPot,
  gardening: Leaf,
  oddjobs: Wrench,
};

export const SLOT_ICONS: Record<TimeSlot, LucideIcon> = {
  morning: Sun,
  afternoon: Sunset,
};

export const bedLabel = (v: string) => `${v} bed`;
export const bathLabel = (v: string) => `${v} bath`;
export const hourLabel = (v: string) => `${v} hrs`;
