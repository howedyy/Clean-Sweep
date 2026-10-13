"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck, ArrowRight, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/section";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Segmented, Stepper } from "@/components/ui/controls";
import { useBooking } from "@/components/booking/booking-provider";
import { Logo3D } from "@/components/3d/logo-3d";
import {
  estimatePrice,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  COMMERCIAL_HOURS,
  COMMERCIAL_TYPES,
  COMMERCIAL_TYPE_LABELS,
} from "@/lib/pricing";
import { formatGBP } from "@/lib/utils";
import type { BookingFormValues } from "@/lib/validation";

export function Hero() {
  const { openBooking } = useBooking();
  
  // Quick Estimator State
  const [serviceType, setServiceType] = useState<BookingFormValues["serviceType"]>("commercial");
  const [bedrooms, setBedrooms] = useState<BookingFormValues["bedrooms"]>("2");
  const [bathrooms, setBathrooms] = useState<BookingFormValues["bathrooms"]>("1");
  const [commercialType, setCommercialType] = useState<BookingFormValues["commercialType"]>("offices");
  const [commercialHours, setCommercialHours] = useState<BookingFormValues["commercialHours"]>("3");

  const estimate = estimatePrice({
    service: serviceType,
    bedrooms,
    bathrooms,
    commercialHours,
    addons: [],
    frequency: "one-off",
  });

  const handleBook = () => {
    openBooking({
      serviceType,
      bedrooms,
      bathrooms,
      commercialType,
      commercialHours,
      frequency: "one-off",
      addons: [],
    });
  };

  return (
    <section id="home" className="relative overflow-hidden bg-brand-soft/80 backdrop-blur-md pt-20 pb-20 sm:pt-28 sm:pb-28">
      {/* Background ambient gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[100px] opacity-40 pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-7">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,1fr] lg:gap-8 items-center">
          
          {/* Left: Copy & Trust Elements */}
          <div className="max-w-2xl">
            <Reveal y={20}>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-hover shadow-sm ring-1 ring-line">
                  <span className="size-2 rounded-full bg-brand animate-pulse" />
                  Reliable • Professional • Family Run
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50/90 px-3 py-1.5 text-xs font-semibold text-teal-800 ring-1 ring-teal-200/80 shadow-xs">
                  <span className="size-2 rounded-full bg-teal-500 animate-ping" />
                  Live 3D Tour • Scroll to Open Eye
                </div>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[3.8rem] lg:leading-[1.12]">
                Professional Cleaning &
                <span className="block text-brand">Property Services</span>
              </h1>
            </Reveal>
            
            <Reveal delay={0.1} y={20}>
              <p className="mt-6 text-lg text-muted sm:text-xl leading-relaxed">
                A trusted family-run business providing cleaning and property support services to domestic and commercial clients across London and the UK. High standards, flexible scheduling, and competitive pricing.
              </p>
            </Reveal>
            
            <Reveal delay={0.2} y={20}>
              <div className="mt-8 flex flex-wrap gap-3.5 items-center">
                <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-sm ring-1 ring-line">
                  <div className="flex -space-x-0.5 text-amber-400">
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                  </div>
                  <span className="text-xs font-semibold text-ink">5-Star Client Feedback</span>
                </div>
                
                <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-sm ring-1 ring-line">
                  <ShieldCheck className="size-4 text-brand" />
                  <span className="text-xs font-semibold text-ink">Public Liability Insured</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-sm ring-1 ring-line">
                  <BadgeCheck className="size-4 text-brand" />
                  <span className="text-xs font-semibold text-ink">COSHH & H&S Practices</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-sm ring-1 ring-line">
                  <span className="size-2 rounded-full bg-teal-500" />
                  <span className="text-xs font-semibold text-ink">Commercial & Domestic</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: Quick Estimator Widget */}
          <Reveal delay={0.3} y={30} className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-line">
              <h3 className="font-display text-xl font-bold text-ink mb-6">Quick Price Estimator</h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-ink">Service Type</label>
                  <Segmented
                    label="Service Type"
                    options={[
                      { value: "commercial", label: "Commercial" },
                      { value: "regular", label: "Domestic" },
                      { value: "deep", label: "Deep Clean" },
                      { value: "tenancy", label: "Tenancy" },
                    ]}
                    value={serviceType}
                    onChange={setServiceType}
                  />
                </div>

                {serviceType === "commercial" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Stepper
                        label="Premises"
                        unit={(v) => COMMERCIAL_TYPE_LABELS[v as keyof typeof COMMERCIAL_TYPE_LABELS] ?? v}
                        value={commercialType}
                        options={COMMERCIAL_TYPES}
                        onChange={(v) => setCommercialType(v as any)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Stepper
                        label="Est. Hours"
                        unit={(v) => `${v} hrs`}
                        value={commercialHours}
                        options={COMMERCIAL_HOURS}
                        onChange={(v) => setCommercialHours(v as any)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Stepper
                        label="Bedrooms"
                        unit={(v) => v}
                        value={bedrooms}
                        options={BEDROOM_OPTIONS}
                        onChange={setBedrooms}
                      />
                    </div>
                    <div className="space-y-3">
                      <Stepper
                        label="Bathrooms"
                        unit={(v) => v}
                        value={bathrooms}
                        options={BATHROOM_OPTIONS}
                        onChange={setBathrooms}
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-line mt-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted">Estimated price</p>
                    <p className="font-display text-3xl font-bold tabular-nums text-ink">
                      <AnimatedNumber value={estimate.total} format={formatGBP} />
                    </p>
                  </div>
                  <Button size="lg" onClick={handleBook} className="group px-6">
                    Book Now
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
          
        </div>
      </div>
    </section>
  );
}
