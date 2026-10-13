"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Reveal, SectionHeading } from "@/components/ui/section";

import ovenBefore from "@/assets/oven-before.jpg";
import ovenAfter from "@/assets/oven-after.jpg";
import carpetBefore from "@/assets/carpet-before.jpg";
import carpetAfter from "@/assets/carpet-after.jpg";

const FEATURED_REVIEW = {
  name: "Alison",
  role: "College & Educational Facility Partner",
  period: "Client for 3 Years",
  rating: 5,
  text: "I have had the pleasure of working with this fantastic cleaning company for the last three years, and I honestly couldn't recommend them more highly. Nothing has ever been too much trouble, and the standard of their work has consistently been five-star. They are reliable, trustworthy, loyal, and always deliver an exceptional service. Whenever I've needed assistance or had a last-minute request, they've always been at the end of the phone, happy to help. They have also been incredibly flexible and understanding, especially as our cleaning schedules have often changed to meet the needs of the college. They have always adapted without complaint and have gone above and beyond to ensure everything ran smoothly. If you're looking for a professional, dependable cleaning company that genuinely cares about its clients, I would recommend them every single time. Thank you for three years of outstanding service.",
};

const REVIEWS = [
  {
    name: "Laura",
    service: "Domestic & Regular Cleaning",
    rating: 5,
    text: "Excellent, friendly, professional and efficient service. Brilliant standards and outstanding service.",
  },
  {
    name: "Tulika",
    service: "Gardening, Windows & Bathrooms",
    rating: 5,
    text: "Excellent gardening, window and bathroom cleaning. Friendly and brilliant at the job.",
  },
  {
    name: "Alyssa",
    service: "End of Tenancy Cleaning",
    rating: 5,
    text: "Very helpful, reasonably priced and a great family service for end of tenancy cleaning.",
  },
  {
    name: "Aaron",
    service: "Move-Out & Tenancy Cleaning",
    rating: 5,
    text: "Apartment was left even better than when I moved in. Highly recommend.",
  },
];

function BeforeAfterSlider({ beforeSrc, afterSrc, label }: { beforeSrc: any; afterSrc: any; label: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => isDragging && handleMove(e.clientX);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-lg ring-1 ring-line"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* Before Image (Background) */}
        <Image src={beforeSrc} alt="Before" fill className="object-cover" placeholder="blur" />

        {/* After Image (Foreground, clipped) */}
        <div
          className="absolute inset-0 z-10"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image src={afterSrc} alt="After" fill className="object-cover" placeholder="blur" />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute inset-y-0 z-20 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-brand font-bold text-xs">
            &lt;&gt;
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-30 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          Before
        </div>
        <div className="absolute bottom-4 right-4 z-30 rounded bg-brand/90 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          After
        </div>
      </div>
      <p className="text-center font-medium text-ink">{label}</p>
    </div>
  );
}

export function Clients() {
  return (
    <section id="clients" className="py-20 sm:py-28 bg-surface">
      <div className="mx-auto max-w-7xl px-5 sm:px-7">
        <SectionHeading
          eyebrow="Client Testimonials"
          title="What our clients say about us."
          description="Read genuine feedback from commercial facilities, colleges, tenants, and homeowners who trust Clean Sweep Oasis."
        />

        {/* Featured Commercial / 3-Year Testimonial */}
        <Reveal delay={0.1} y={20} className="mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 sm:p-12 shadow-md ring-1 ring-line">
            <Quote className="absolute top-6 right-6 size-16 text-brand/10 pointer-events-none" />
            <div className="flex items-center gap-1.5 text-amber-400 mb-4">
              {[...Array(FEATURED_REVIEW.rating)].map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
              <span className="ml-2 rounded-full bg-brand-soft px-3 py-0.5 text-xs font-semibold text-brand-hover">
                Featured 3-Year Partnership
              </span>
            </div>
            <blockquote className="text-base sm:text-lg text-ink font-medium leading-relaxed italic">
              “{FEATURED_REVIEW.text}”
            </blockquote>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <div>
                <p className="font-display text-lg font-bold text-ink">{FEATURED_REVIEW.name}</p>
                <p className="text-sm text-muted">{FEATURED_REVIEW.role} · {FEATURED_REVIEW.period}</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Verified Commercial Feedback
              </span>
            </div>
          </div>
        </Reveal>

        {/* Grid of Other Testimonials */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.name} delay={i * 0.08} y={20}>
              <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line hover:shadow-md transition-shadow">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="flex-1 text-sm text-ink mb-6 italic leading-relaxed">
                  “{review.text}”
                </p>
                <div className="mt-auto border-t border-line pt-4">
                  <p className="font-semibold text-ink text-sm">{review.name}</p>
                  <p className="text-xs text-muted">{review.service}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Before / After Showcase */}
        <div className="mt-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Visual Proof</span>
            <h3 className="font-display text-2xl font-bold text-ink mt-1">See the Clean Sweep Difference</h3>
            <p className="text-sm text-muted mt-2">Interactive before & after comparisons of our deep cleaning and stain removal.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <Reveal delay={0.1} y={20}>
              <BeforeAfterSlider beforeSrc={ovenBefore} afterSrc={ovenAfter} label="Deep Oven & Appliance Cleaning" />
            </Reveal>
            <Reveal delay={0.2} y={20}>
              <BeforeAfterSlider beforeSrc={carpetBefore} afterSrc={carpetAfter} label="Specialist Carpet Stain Extraction" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
