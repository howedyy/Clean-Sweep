import { Header } from "@/components/sections/header";
import { EyeIntro } from "@/components/sections/eye-intro";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Clients } from "@/components/sections/clients";
import { Contact } from "@/components/sections/contact";
import { ScrollTour3D } from "@/components/3d/scroll-tour-3d";
import { SITE } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <ScrollTour3D />
      <Header />
      <main className="relative z-10">
        <EyeIntro />
        <Hero />
        <About />
        <Services />
        <Process />
        <Clients />
        <Contact />
      </main>

      {/* Professional Footer */}
      <footer className="bg-ink py-16 text-slate-400 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-5 sm:px-7">
          <div className="grid gap-10 md:grid-cols-4 pb-12 border-b border-slate-800">
            {/* Col 1: Brand & Logo */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-28 bg-white/10 rounded-lg p-1">
                  <Image
                    src="/logo.png"
                    alt="Clean Sweep Oasis LTD"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white tracking-tight">
                    Clean Sweep Oasis LTD
                  </h3>
                  <p className="text-xs text-teal-400 font-medium">Reliable • Professional • Family Run</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400 max-w-md leading-relaxed">
                A trusted family-run business providing cleaning and property support services to domestic and commercial clients across London and the UK.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded bg-slate-800/80 px-2.5 py-1">Public Liability Insured</span>
                <span className="rounded bg-slate-800/80 px-2.5 py-1">COSHH & H&S Practices</span>
              </div>
            </div>

            {/* Col 2: Services */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Services</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link href="#services" className="hover:text-white transition-colors">Commercial Cleaning</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">End of Tenancy Cleaning</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Domestic & Deep Cleaning</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Carpet & Windows Cleaning</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Gardening & Odd Jobs</Link></li>
              </ul>
            </div>

            {/* Col 3: Direct Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact & Quotes</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href={`mailto:${SITE.email}`} className="hover:text-teal-400 transition-colors">
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <a href={SITE.phoneHref} className="hover:text-teal-400 transition-colors">
                    {SITE.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-400 transition-colors"
                  >
                    WhatsApp Support
                  </a>
                </li>
                <li className="text-xs text-slate-500 pt-1">
                  {SITE.hours}
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Clean Sweep Oasis LTD. All rights reserved.</p>
            <p>London & Surrounding Areas, United Kingdom.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
