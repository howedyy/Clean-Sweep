"use client";

import { Eye, FileCheck, CalendarCheck, CheckCheck } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/ui/section";

const STEPS = [
  {
    step: "01",
    title: "Site visit",
    icon: Eye,
    description: "We discuss your premises, access, schedule and priorities in person or via walkthrough.",
  },
  {
    step: "02",
    title: "Tailored quotation",
    icon: FileCheck,
    description: "You receive a clear, no-obligation quote based on the exact services and scope required.",
  },
  {
    step: "03",
    title: "Agreed schedule",
    icon: CalendarCheck,
    description: "We confirm tasks, frequency and timing around your household or commercial operations.",
  },
  {
    step: "04",
    title: "Quality checks",
    icon: CheckCheck,
    description: "We review standards and respond to feedback throughout the service to guarantee five-star quality.",
  },
];

export function Process() {
  return (
    <section id="how-we-work" className="py-20 sm:py-28 bg-surface border-y border-line">
      <div className="mx-auto max-w-7xl px-5 sm:px-7">
        <SectionHeading
          eyebrow="Our Process"
          title="How We Work"
          description="A smooth, dependable 4-step process designed to give you complete peace of mind."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.step} delay={i * 0.1} y={20} className="flex h-full flex-col">
                <div className="relative flex flex-col h-full rounded-3xl bg-white p-7 shadow-sm ring-1 ring-line hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display text-3xl font-extrabold text-brand/30">
                      {item.step}
                    </span>
                    <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                      <Icon className="size-5" />
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink mb-3">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed flex-1">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Motto Callout Banner */}
        <Reveal delay={0.3} y={15} className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-full bg-brand-soft px-6 py-2.5 text-sm font-semibold text-brand-hover ring-1 ring-brand/20">
            <span>Clear scope.</span>
            <span className="text-brand/40" aria-hidden>•</span>
            <span>Agreed timing.</span>
            <span className="text-brand/40" aria-hidden>•</span>
            <span>Consistent service.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
