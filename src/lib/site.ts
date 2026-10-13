/**
 * Business contact details for Clean Sweep Oasis LTD (from client presentation).
 */
export const SITE = {
  name: "Clean Sweep Oasis LTD",
  shortName: "Clean Sweep Oasis",
  tagline: "Professional Cleaning & Property Services",
  subtagline: "Reliable • Professional • Family Run",
  email: "cleansweep89@outlook.com",
  phoneDisplay: "07566 227825",
  phoneHref: "tel:+447566227825",
  whatsappDisplay: "07566 227825",
  whatsappHref:
    "https://wa.me/447566227825?text=" +
    encodeURIComponent("Hi Clean Sweep Oasis, I would like to request a free quotation."),
  address: ["Clean Sweep Oasis LTD", "London & Surrounding Areas, United Kingdom"],
  hours: "Mon–Sat: 08:00–19:00 (Flexible commercial hours)",
  credentials: [
    "Public Liability Insured",
    "COSHH & Health-and-Safety Practices",
    "Family-Run Business",
    "Tailored No-Obligation Quotations",
  ],
} as const;

export const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "how-we-work", label: "How We Work" },
  { id: "clients", label: "Reviews" },
  { id: "contact", label: "Contact & Quote" },
] as const;

