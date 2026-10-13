/**
 * Business contact details used across the site.
 * ⚠️ Placeholder values: phone numbers use Ofcom's reserved "drama" ranges
 * (020 7946 0xxx / 07700 900xxx). Replace with the client's real details before launch.
 */
export const SITE = {
  name: "Clean Swap",
  email: "hello@cleanswap.co.uk",
  phoneDisplay: "020 7946 0958",
  phoneHref: "tel:+442079460958",
  whatsappDisplay: "07700 900461",
  whatsappHref:
    "https://wa.me/447700900461?text=" + encodeURIComponent("Hi Clean Swap, I'd like a quote for a clean."),
  address: ["Clean Swap HQ", "London, United Kingdom"],
  hours: "Mon–Sat: 08:00–19:00",
} as const;

export const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "clients", label: "Clients" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
] as const;
