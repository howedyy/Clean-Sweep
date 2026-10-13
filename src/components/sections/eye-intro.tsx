"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronDown, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/components/booking/booking-provider";

export function EyeIntro() {
  const { openBooking } = useBooking();

  const handleScrollDown = () => {
    const heroElem = document.getElementById("home");
    if (heroElem) {
      heroElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center px-5 pt-28 pb-12 select-none">
      {/* Top Banner / Trust Crest */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center z-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-xs font-semibold text-teal-900 shadow-lg ring-1 ring-teal-200/80 backdrop-blur-md">
          <span className="size-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Clean Sweep Oasis LTD • Live 3D Experience</span>
        </div>
      </motion.div>

      {/* Center Void: Full unobstructed view of the 3D Eye of Horus */}
      <div className="my-auto pointer-events-none text-center">
        <div className="h-64 sm:h-80" />
      </div>

      {/* Bottom Floating Interactive Card / Scroll Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="z-10 flex flex-col items-center max-w-xl text-center w-full"
      >
        <div className="rounded-3xl border border-teal-200/70 bg-white/80 p-5 sm:p-6 shadow-xl backdrop-blur-md w-full">
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            The Awakened Eye of Oasis
          </h2>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed sm:text-sm">
            Scroll down to watch the sacred Eye of Horus open in 3D and embark on an interactive journey through our property services.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <Button
              onClick={handleScrollDown}
              size="sm"
              className="gap-2 bg-teal-600 hover:bg-teal-500 shadow-md text-white font-semibold"
            >
              <Sparkles className="size-3.5 animate-spin" />
              Scroll Down to Open Eye
            </Button>
            <Button
              onClick={() => openBooking()}
              variant="outline"
              size="sm"
              className="border-teal-200 bg-white/80 hover:bg-teal-50 text-teal-800"
            >
              Book a Clean
            </Button>
          </div>
        </div>

        {/* Bouncing Scroll Down Mouse Indicator */}
        <button
          type="button"
          onClick={handleScrollDown}
          className="mt-6 flex flex-col items-center gap-1.5 text-slate-500 hover:text-teal-700 transition-colors cursor-pointer group"
        >
          <span className="text-[11px] font-semibold tracking-wider uppercase">
            Scroll to Awaken
          </span>
          <div className="flex size-8 items-center justify-center rounded-full bg-white/80 shadow-md ring-1 ring-slate-200 group-hover:bg-teal-50 group-hover:ring-teal-300 transition-all">
            <ChevronDown className="size-4 text-teal-600 animate-bounce" />
          </div>
        </button>
      </motion.div>
    </section>
  );
}
