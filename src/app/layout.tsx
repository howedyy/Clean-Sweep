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
  title: "Clean Sweep Oasis LTD | Professional Cleaning & Property Services",
  description:
    "Trusted family-run cleaning & property support services across London and the UK. Commercial cleaning from £25/hr, End of Tenancy from £150, gardening & specialist cleans. Fully insured with free no-obligation quotes.",
  keywords: [
    "Clean Sweep Oasis",
    "commercial cleaning London",
    "office cleaning",
    "end of tenancy cleaning",
    "deep clean London",
    "family run cleaners",
    "gardening odd jobs",
    "domestic cleaner UK",
  ],
  openGraph: {
    title: "Clean Sweep Oasis LTD — Reliable • Professional • Family Run",
    description: "High standard domestic, commercial and specialist cleaning services across London & the UK.",
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
