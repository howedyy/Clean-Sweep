"use client";

import { ShieldCheck, HeartHandshake, CalendarClock, Sparkles, ReceiptText, ThumbsUp } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/ui/section";
import { AnimatedNumber } from "@/components/ui/animated-number";

const WHY_CHOOSE_US = [
  {
    icon: HeartHandshake,
    title: "Family-Run Business",
    description: "A trusted family team offering friendly, personal attention, care, and genuine dedication to every client.",
  },
  {
    icon: Sparkles,
    title: "High Cleaning Standards",
    description: "Rigorous attention to detail, spotless finishes, and consistent five-star standards on every visit.",
  },
  {
    icon: CalendarClock,
    title: "Flexible Scheduling",
    description: "We adapt timing and frequency to suit your routine, commercial shifts, or urgent last-minute requirements.",
  },
  {
    icon: ShieldCheck,
    title: "Commercial Credentials",
    description: "Full Public Liability insurance coverage, strict COSHH compliance, and rigorous health-and-safety practices.",
  },
  {
    icon: ReceiptText,
    title: "Bespoke & Transparent Pricing",
    description: "Clear, competitive pricing with bespoke quotations and free, no-obligation quotes for every project.",
  },
  {
    icon: ThumbsUp,
    title: "Reliable & Trustworthy",
    description: "Loyal, dependable cleaners who go above and beyond, backed by stellar client reviews and multi-year partnerships.",
  },
];

const METRICS = [
  { value: 100, suffix: "%", label: "Public Liability Insured & COSHH Compliant" },
  { value: 5, suffix: ".0 ★", label: "Consistent Five-Star Customer Rating" },
  { value: 3, suffix: "+ Years", label: "Trusted Commercial & Domestic Partnerships" },
];

export function About() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-7">
        <SectionHeading
          eyebrow="About Clean Sweep Oasis"
          title="A trusted family-run business delivering exceptional property support."
          description="We provide comprehensive cleaning and property support services to domestic and commercial clients across London and the UK, with high standards, friendly service, and total reliability."
        />

        {/* 6 Core Pillars */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_US.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08} y={20}>
              <div className="flex flex-col h-full p-6 rounded-2xl bg-surface/60 border border-line hover:border-brand/30 transition-colors">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand shadow-sm ring-1 ring-brand/10">
                  <item.icon className="size-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Slide 8: Our Commitment Callout */}
        <Reveal delay={0.2} y={20} className="mt-12">
          <div className="rounded-3xl bg-gradient-to-br from-brand/10 via-brand-soft to-surface p-8 sm:p-10 border border-brand/20 shadow-sm relative overflow-hidden">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-hover">Our Commitment</span>
              <blockquote className="mt-3 font-display text-xl sm:text-2xl font-bold text-ink leading-snug">
                “We are committed to delivering dependable cleaning services with attention to detail, professionalism and customer satisfaction in every job we undertake.”
              </blockquote>
              <p className="mt-4 text-sm font-medium text-muted">
                — Clean Sweep Oasis LTD Team
              </p>
            </div>
          </div>
        </Reveal>

        {/* Metrics Row */}
        <div className="mt-16 rounded-3xl bg-ink py-12 px-6 sm:px-12 sm:py-16 shadow-2xl">
          <div className="grid gap-8 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {METRICS.map((metric, i) => (
              <Reveal key={metric.label} delay={i * 0.1} y={20} className="flex flex-col items-center text-center pt-8 sm:pt-0 first:pt-0">
                <div className="font-display text-4xl sm:text-5xl font-bold text-white flex items-center justify-center">
                  <AnimatedNumber value={metric.value} format={(n) => String(n)} />
                  <span>{metric.suffix}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-400 max-w-xs">{metric.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
