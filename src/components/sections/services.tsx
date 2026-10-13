"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/ui/section";
import { useBooking } from "@/components/booking/booking-provider";
import { Segmented } from "@/components/ui/controls";
import type { BookingFormValues } from "@/lib/validation";

const SERVICES = [
  {
    id: "regular" as const,
    title: "Regular Domestic Clean",
    priceText: "From £18/hr",
    description: "Keep your home consistently spotless with our recurring service.",
    includes: ["Dusting & wiping all surfaces", "Vacuuming & mopping floors", "Bathroom sanitation", "Kitchen wipe-down", "General tidying"],
  },
  {
    id: "deep" as const,
    title: "Deep Clean",
    priceText: "From £120",
    description: "A comprehensive top-to-bottom scrub for a complete refresh.",
    includes: ["Everything in Regular Clean", "Inside window cleaning", "Skirting boards & doors", "Deep scrubbing of tiles/grout", "Appliance exteriors"],
  },
  {
    id: "tenancy" as const,
    title: "End of Tenancy Clean",
    priceText: "From £165",
    description: "Designed to guarantee tenant deposit return based on agency checklists.",
    includes: ["Intensive deep cleaning", "Inside all cupboards & wardrobes", "Oven deep clean included", "Limescale removal", "Deposit return guarantee"],
  },
  {
    id: "commercial" as const,
    title: "Office & Commercial",
    priceText: "Custom quote",
    description: "Flexible after-hours or scheduled workspace sanitization.",
    includes: ["Desk & workstation cleaning", "Communal area sanitization", "Waste management", "Restroom deep cleaning", "Flexible scheduling"],
  },
];

export function Services() {
  const { openBooking, requestQuote } = useBooking();
  const [frequency, setFrequency] = useState<BookingFormValues["frequency"]>("one-off");

  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-7">
        <SectionHeading
          eyebrow="Our Services"
          title="Simple, transparent pricing."
          description="Choose the right level of clean for your needs. No hidden fees."
        />

        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-xs">
            <Segmented
              label="Frequency"
              options={[
                { value: "one-off", label: "One-Off" },
                { value: "subscription", label: "Subscribe (Save 15%)" },
              ]}
              value={frequency}
              onChange={setFrequency}
            />
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => {
            const isCommercial = service.id === "commercial";
            
            return (
              <Reveal key={service.id} delay={i * 0.1} y={20} className="flex h-full flex-col">
                <div className="flex flex-col h-full rounded-3xl border border-line bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <h3 className="font-display text-xl font-bold text-ink">{service.title}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand">{service.priceText}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted mb-6">{service.description}</p>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                        <CheckCircle2 className="size-4 shrink-0 text-brand mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full mt-auto" 
                    variant={service.id === "tenancy" ? "primary" : "outline"}
                    onClick={() => {
                      if (isCommercial) {
                        requestQuote("Commercial Cleaning Quote");
                      } else {
                        openBooking({ serviceType: service.id as any, frequency });
                      }
                    }}
                  >
                    {isCommercial ? "Request Quote" : "Select Service"}
                  </Button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
