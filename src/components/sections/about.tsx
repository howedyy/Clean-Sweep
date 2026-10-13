"use client";

import { Shield, Leaf, RefreshCw } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/ui/section";
import { AnimatedNumber } from "@/components/ui/animated-number";

const GUARANTEES = [
  {
    icon: Shield,
    title: "Vetted & DBS-Checked",
    description: "Strict 5-step background vetting for all our professional cleaning staff.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly & Pet Safe",
    description: "Non-toxic, plant-based cleaning solutions provided as standard.",
  },
  {
    icon: RefreshCw,
    title: "The Swap Guarantee",
    description: "Not 100% satisfied? We re-clean within 24 hours for free or switch your cleaner immediately.",
  },
];

const METRICS = [
  { value: 15000, suffix: "+", label: "Hours Cleaned" },
  { value: 99.4, suffix: "%", label: "Positive Feedback" },
  { value: 100, suffix: "%", label: "Carbon Neutral" },
];

export function About() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-7">
        <SectionHeading
          eyebrow="Why Clean Swap"
          title="We're raising the standard of cleaning in the UK."
          description="Traditional agencies leave you guessing. We provide complete transparency, guaranteed results, and zero hassle."
        />

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {GUARANTEES.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1} y={20}>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface/50 border border-line">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand shadow-sm ring-1 ring-brand/10">
                  <item.icon className="size-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 rounded-3xl bg-ink py-12 px-6 sm:px-12 sm:py-16 shadow-2xl">
          <div className="grid gap-8 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {METRICS.map((metric, i) => (
              <Reveal key={metric.label} delay={i * 0.1} y={20} className="flex flex-col items-center text-center pt-8 sm:pt-0 first:pt-0">
                <div className="font-display text-4xl sm:text-5xl font-bold text-white flex items-center justify-center">
                  <AnimatedNumber value={metric.value} format={(n) => String(n)} />
                  <span>{metric.suffix}</span>
                </div>
                <p className="mt-2 font-medium text-slate-400">{metric.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
