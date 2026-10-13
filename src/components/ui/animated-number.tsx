"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Smoothly tweens between numeric values (prices, metrics).
 * Render inside an element with `tabular-nums` so width never jitters.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 0.5,
  startOnView = false,
  from,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  /** Count up from `from` the first time the element scrolls into view. */
  startOnView?: boolean;
  from?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(startOnView ? (from ?? 0) : value);
  const current = useRef(display);

  useEffect(() => {
    if (startOnView && !inView) return;
    if (reduce) {
      current.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(current.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        current.current = v;
        setDisplay(v);
      },
    });
    return () => controls.stop();
  }, [value, inView, startOnView, duration, reduce]);

  return <span ref={ref}>{format(display)}</span>;
}
