import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Clients } from "@/components/sections/clients";
import { Services } from "@/components/sections/services";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Clients />
        <Services />
        <Contact />
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-ink py-12 text-center text-sm text-slate-400">
        <div className="mx-auto max-w-7xl px-5 sm:px-7">
          <p>© 2026 Clean Swap. All rights reserved.</p>
          <p className="mt-2 text-xs">Based in London, UK.</p>
        </div>
      </footer>
    </>
  );
}
