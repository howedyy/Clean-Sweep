"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck, ArrowRight, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/section";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Segmented, Stepper } from "@/components/ui/controls";
import { useBooking } from "@/components/booking/booking-provider";
import { estimatePrice, BEDROOM_OPTIONS, BATHROOM_OPTIONS } from "@/lib/pricing";
import { formatGBP } from "@/lib/utils";
import type { BookingFormValues } from "@/lib/validation";

export function Hero() {
  const { openBooking } = useBooking();
  
  // Quick Estimator State
  const [serviceType, setServiceType] = useState<BookingFormValues["serviceType"]>("regular");
  const [bedrooms, setBedrooms] = useState<BookingFormValues["bedrooms"]>("2");
  const [bathrooms, setBathrooms] = useState<BookingFormValues["bathrooms"]>("1");

  const estimate = estimatePrice({ service: serviceType, bedrooms, bathrooms, addons: [], frequency: "one-off" });

  const handleBook = () => {
    openBooking({ serviceType, bedrooms, bathrooms, frequency: "one-off", addons: [] });
  };

  return (
    <section id="home" className="relative overflow-hidden bg-brand-soft pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background blobs for visual flair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/10 rounded-full blur-[100px] opacity-70" />
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-7">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,1fr] lg:gap-8 items-center">
          
          {/* Left: Copy & Trust Elements */}
          <div className="max-w-2xl">
            <Reveal y={20}>
              <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[4rem] lg:leading-[1.1]">
                Spotless Spaces, Zero Hassle.
                <span className="block text-brand">Book in 60 Seconds.</span>
              </h1>
            </Reveal>
            
            <Reveal delay={0.1} y={20}>
              <p className="mt-6 text-lg text-muted sm:text-xl leading-relaxed">
                Fully vetted, DBS-checked professionals using eco-friendly products. Transparent pricing from £17/hr with guaranteed deposit return standards across the UK.
              </p>
            </Reveal>
            
            <Reveal delay={0.2} y={20}>
              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-line">
                  <div className="flex -space-x-1 text-amber-400">
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                  </div>
                  <span className="text-xs font-semibold text-ink">4.9/5 Trustpilot</span>
                </div>
                
                <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-line">
                  <ShieldCheck className="size-4 text-brand" />
                  <span className="text-xs font-semibold text-ink">DBS-Checked Staff</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-line">
                  <BadgeCheck className="size-4 text-brand" />
                  <span className="text-xs font-semibold text-ink">100% Satisfaction Guarantee</span>
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
                      { value: "regular", label: "Regular" },
                      { value: "deep", label: "Deep Clean" },
                      { value: "tenancy", label: "End of Tenancy" },
                    ]}
                    value={serviceType}
                    onChange={setServiceType}
                  />
                </div>

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
