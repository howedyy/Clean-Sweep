"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/components/booking/booking-provider";

export function Header() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 50], [0, 0.8]);
  const blur = useTransform(scrollY, [0, 50], [0, 12]);
  const border = useTransform(scrollY, [0, 50], ["rgba(226, 232, 240, 0)", "rgba(226, 232, 240, 1)"]);
  
  const { openBooking } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#clients", label: "Clients" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 border-b"
      style={{
        backgroundColor: useTransform(bgOpacity, (v) => `rgba(255, 255, 255, ${v})`),
        backdropFilter: useTransform(blur, (v) => `blur(${v}px)`),
        borderColor: border,
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-7">
        <Link href="#home" className="flex items-center gap-2 text-ink hover:opacity-80 transition-opacity">
          <Sparkles className="size-6 text-brand" />
          <span className="font-display text-xl font-bold tracking-tight">Clean Swap</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted hover:text-brand transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button onClick={() => openBooking()} size="sm">
            Book a Clean
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute inset-x-0 top-16 border-b border-line bg-white px-5 py-4 shadow-lg md:hidden"
        >
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-ink hover:text-brand"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              className="w-full mt-2"
              onClick={() => {
                setMobileMenuOpen(false);
                openBooking();
              }}
            >
              Book a Clean
            </Button>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
