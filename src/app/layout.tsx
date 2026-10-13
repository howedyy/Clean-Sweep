import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { BookingProvider } from "@/components/booking/booking-provider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clean Swap | Professional Cleaners Across the UK — Book in 60 Seconds",
  description:
    "DBS-checked, eco-friendly cleaners across London and the UK. Regular, deep and end of tenancy cleans from £18/hr, VAT included. Instant quote and booking in 60 seconds.",
  keywords: [
    "cleaners London",
    "end of tenancy cleaning",
    "deep clean",
    "domestic cleaner UK",
    "office cleaning London",
  ],
  openGraph: {
    title: "Clean Swap — Spotless Spaces, Zero Hassle",
    description: "Book vetted, eco-friendly cleaners across the UK in 60 seconds.",
    locale: "en_GB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D9488",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${jakarta.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh">
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}
