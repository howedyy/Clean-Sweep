"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Reveal, SectionHeading } from "@/components/ui/section";

import ovenBefore from "@/assets/oven-before.jpg";
import ovenAfter from "@/assets/oven-after.jpg";
import carpetBefore from "@/assets/carpet-before.jpg";
import carpetAfter from "@/assets/carpet-after.jpg";

const REVIEWS = [
  {
    name: "Sarah M.",
    location: "Richmond",
    service: "End of Tenancy Clean",
    rating: 5,
    text: "Absolutely spotless. The team managed to get my full deposit back with zero issues. Will definitely use them again for my new place.",
  },
  {
    name: "James T.",
    location: "Islington",
    service: "Deep Clean",
    rating: 5,
    text: "Incredible attention to detail. They cleaned places I didn't even know were dirty! Highly recommend the deep clean service.",
  },
  {
    name: "Emily R.",
    location: "Wimbledon",
    service: "Regular Domestic Clean",
    rating: 5,
    text: "Reliable, friendly, and they always leave the house smelling amazing. The eco-friendly products are a huge plus for my dog.",
  },
];

function BeforeAfterSlider({ beforeSrc, afterSrc, label }: { beforeSrc: any, afterSrc: any, label: string }) {
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
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-brand font-bold text-xs">
            &lt;&gt;
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-30 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">Before</div>
        <div className="absolute bottom-4 right-4 z-30 rounded bg-brand/90 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">After</div>
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
          eyebrow="Trusted Results"
          title="Don't just take our word for it."
          description="See the difference our professional cleaners make in homes across the UK."
        />

        {/* Before / After Showcase */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <Reveal delay={0.1} y={20}>
            <BeforeAfterSlider beforeSrc={ovenBefore} afterSrc={ovenAfter} label="Deep Oven Cleaning" />
          </Reveal>
          <Reveal delay={0.2} y={20}>
            <BeforeAfterSlider beforeSrc={carpetBefore} afterSrc={carpetAfter} label="Carpet Stain Removal" />
          </Reveal>
        </div>

        {/* Reviews */}
        <div className="mt-24 grid gap-6 sm:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.name} delay={i * 0.1} y={20}>
              <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="flex-1 text-sm text-ink mb-6 italic leading-relaxed">"{review.text}"</p>
                <div className="mt-auto border-t border-line pt-4">
                  <p className="font-semibold text-ink text-sm">{review.name}</p>
                  <p className="text-xs text-muted">{review.location} · {review.service}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        
      </div>
    </section>
  );
}
