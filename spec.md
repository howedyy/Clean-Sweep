# Clean Swap — Technical Specification & Kickoff PRD

## 1. Project Overview & Localization
- **Brand Name:** Clean Swap
- **Industry:** Residential & Commercial Cleaning Services
- **Target Market:** United Kingdom (UK-wide / Greater London focus)
- **Currency & Localization:** British English (e.g., *End of Tenancy*, *Postcode*, *Hoovering*, *VAT included*), Currency in Pounds Sterling (£ GBP).
- **Primary Objective:** High-converting, frictionless landing page where visitors can discover services, get an instant cost estimate, and complete a booking in under 60 seconds.
- **Core Integration:** All completed bookings automatically post to a client Google Sheet via a webhook.

---

## 2. Tech Stack & Libraries
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS v3.4+
- **Icons:** `lucide-react`
- **Animations:** `framer-motion`
- **Forms & Validation:** `react-hook-form` + `zod`
- **UI Primitives:** Radix UI / Shadcn UI patterns
- **Backend Route:** Next.js Route Handler (`src/app/api/book/route.ts`)

---

## 3. UI/UX Design System
- **Color Palette:**
  - `Background`: `#FFFFFF` and alternate soft slate `#F8FAFC`
  - `Primary / Brand`: `#0D9488` (Teal 600 — fresh, hygienic, modern)
  - `Primary Hover`: `#0F766E` (Teal 700)
  - `Accent Soft`: `#F0FDFA` (Teal 50 — badges, active states)
  - `Text Primary`: `#0F172A` (Slate 900 — high contrast)
  - `Text Muted`: `#64748B` (Slate 500)
  - `Border`: `#E2E8F0` (Slate 200)
- **Typography:**
  - Headings: `Plus Jakarta Sans` or `Inter` (Font weight 600 / 700)
  - Body: `Inter` (16px base, 1.5 line-height)
- **Micro-Interactions & UX Polish:**
  - Sticky glassmorphism header with active section spy.
  - Smooth anchor link scrolling (`scroll-smooth`).
  - Tactile button clicks (`active:scale-[0.98]`).
  - Real-time input validation with green tick icons for valid UK postcodes and phone numbers.
  - Optimistic UI updates with a celebratory confirmation drawer upon booking.

---

## 4. Page Architecture (5 Core Sections)

### 4.1 Header & Navigation (Sticky)
- **Left:** Clean Swap Logo (clean wordmark with a subtle sparkle/leaf icon).
- **Center:** Desktop Navigation links (`Home`, `About`, `Clients`, `Services`, `Contact`).
- **Right:** Call to Action button `[Book a Clean]` that opens the booking modal directly.
- **Mobile:** Animated hamburger drawer menu.

### 4.2 Section 1: Home (Hero)
- **Headline:** *"Spotless Spaces, Zero Hassle. Book Professional Cleaners Across the UK in 60 Seconds."*
- **Subheadline:** *"Fully vetted, DBS-checked professionals using eco-friendly products. Transparent pricing from £17/hr with guaranteed deposit return standards."*
- **Trust Elements:** Trustpilot 4.9/5 stars badge, DBS-Checked badge, 100% Money-Back Guarantee icon.
- **Quick Estimator Widget (Interactive Highlight):**
  - Select service: *Regular Domestic*, *Deep Clean*, or *End of Tenancy*.
  - Stepper controls for Bedrooms (`1`, `2`, `3+`) and Bathrooms (`1`, `2+`).
  - Dynamic live price readout (e.g., `Estimated: £115.00`).
  - CTA button: `[Lock in Price & Book Date] ->` pre-populates and opens the booking modal.

### 4.3 Section 2: About Us
- **Value Proposition:** Why Clean Swap beats traditional cleaning agencies.
- **The Clean Swap 3-Pillar Guarantee:**
  1. *Vetted & DBS-Checked:* Strict 5-step background vetting for all British staff.
  2. *Eco-Friendly & Pet Safe:* Non-toxic, plant-based cleaning solutions as standard.
  3. *The Swap Guarantee:* If you're not 100% satisfied, we re-clean within 24 hours for free or switch your cleaner immediately.
- **Animated Metrics Row:**
  - `15,000+` Hours Cleaned
  - `99.4%` Positive Feedback
  - `100%` Carbon Neutral Operations

### 4.4 Section 3: Our Clients & Social Proof
- **Commercial Clients Marquee:** Grayscale logos of Airbnb hosts, property managers, and London office spaces.
- **Customer Reviews Carousel:**
  - Star ratings, customer name, location (e.g., *Sarah M., Richmond*), and service type (*End of Tenancy Clean*).
- **Before / After Visual Showcase:**
  - Interactive comparison cards showcasing deep oven and carpet cleaning transformations.

### 4.5 Section 4: Our Services
- **Pricing Switcher:** `[One-Off Clean]` vs `[Subscribe & Save 15%]`.
- **4 Service Cards:**
  1. **Regular Domestic Clean:** Dusting, vacuuming, mopping, bathroom sanitation (From £18/hr).
  2. **Deep Clean:** Comprehensive top-to-bottom scrub, appliances, baseboards, grout refresh (From £120).
  3. **End of Tenancy Clean:** Designed to guarantee tenant deposit return according to agency checklists (From £165).
  4. **Office & Commercial:** Flexible after-hours or scheduled workspace sanitization (Custom quote).
- Each card includes bullet points of what's included and a `[Select Service]` button.

### 4.6 Section 5: Contact Us & Frictionless Booking

#### Component A: 3-Step Micro-Booking Modal/Drawer
- **Step 1 — Scope:** Service type selection, property size, and optional add-ons (Oven Clean +£35, Inside Windows +£25, Carpet Steam +£45).
- **Step 2 — Schedule & Postcode:** UK Postcode input (regex validated), date picker (next 30 days), time slot (Morning 08:00–12:00, Afternoon 12:00–16:00).
- **Step 3 — Customer Info:** Full Name, UK Phone Number (+44), Email Address, Special Access Notes (e.g., key safe instructions).
- **Submit Action:** Submits to `/api/book`, triggers confetti/success view, displays Booking Reference ID.

#### Component B: General Contact Form
- Fields: Name, Email, Subject, Message.
- Contact Details: London UK Headquarters, WhatsApp Direct Chat link, Telephone support, Opening Hours (Mon–Sat: 08:00–19:00).

---

## 5. Google Sheets Integration Specification

### 5.1 Google Apps Script Webhook Code
Create this script inside the client's Google Sheet (`Extensions > Apps Script`):

```javascript
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var ukTimestamp = Utilities.formatDate(new Date(), "Europe/London", "dd/MM/yyyy HH:mm:ss");

    sheet.appendRow([
      data.bookingId || ("CS-" + Math.floor(100000 + Math.random() * 900000)),
      ukTimestamp,
      data.fullName,
      data.email,
      data.phone,
      data.postcode.toUpperCase(),
      data.serviceType,
      data.propertySpecs,
      data.addons || "None",
      data.preferredDate + " (" + data.timeSlot + ")",
      data.estimatedPrice,
      data.notes || "",
      "New"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", bookingId: data.bookingId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```
