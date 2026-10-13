"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CircleAlert, Mail, MapPin, MessageSquare, Phone, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, TextInput, TextArea } from "@/components/ui/field";
import { Reveal, SectionHeading } from "@/components/ui/section";
import { useBooking } from "@/components/booking/booking-provider";
import { contactSchema, type ContactFormValues } from "@/lib/validation";
import { SITE } from "@/lib/site";

export function Contact() {
  const { quoteRequest } = useBooking();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", company: "" },
  });

  // Prefill subject if requested via BookingProvider (e.g. from Services section)
  useEffect(() => {
    if (quoteRequest) {
      form.setValue("subject", quoteRequest.subject);
      setStatus("idle");
    }
  }, [quoteRequest, form]);

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("pending");
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        if (data.fieldErrors) {
          for (const [field, messages] of Object.entries(data.fieldErrors)) {
            form.setError(field as keyof ContactFormValues, { message: (messages as string[])[0] });
          }
        }
        throw new Error(data.message || "Something went wrong.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Failed to send message.");
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-brand-soft">
      <div className="mx-auto max-w-7xl px-5 sm:px-7">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-12 items-start">
          <Reveal y={20}>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-hover ring-1 ring-line shadow-sm">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                Free No-Obligation Quote
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">
                Request Your Free Quotation.
              </h2>
              <p className="mt-4 text-lg text-muted max-w-md">
                Start with a free, no-obligation quotation. We provide dependable property care and cleaning across London and the UK.
              </p>

              {/* Slide 9 Checklist: For an accurate quote */}
              <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
                <div className="flex items-center gap-2 text-ink font-semibold text-sm mb-3">
                  <ClipboardList className="size-4 text-brand" />
                  <span>For an accurate quote, please include:</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-brand" />
                    Premises location & type
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-brand" />
                    Approximate property size
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-brand" />
                    Preferred cleaning frequency
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-brand" />
                    Access hours & specialist needs
                  </li>
                </ul>
              </div>

              {/* Direct Contact Methods */}
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line text-brand">
                    <Mail className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">Direct Email</h3>
                    <p className="mt-0.5 text-xs text-muted">Quick response for quotes and enquiries</p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="mt-1 block font-medium text-brand hover:underline"
                    >
                      {SITE.email}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line text-brand">
                    <Phone className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">Mobile & Phone Support</h3>
                    <p className="mt-0.5 text-xs text-muted">{SITE.hours}</p>
                    <a
                      href={SITE.phoneHref}
                      className="mt-1 block font-medium text-brand hover:underline"
                    >
                      {SITE.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line text-brand">
                    <MessageSquare className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">WhatsApp Direct</h3>
                    <p className="mt-0.5 text-xs text-muted">Chat directly with our team for quick quotes</p>
                    <a
                      href={SITE.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-medium text-brand hover:underline"
                    >
                      Message on WhatsApp ({SITE.whatsappDisplay})
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line text-brand">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">Service Areas</h3>
                    <p className="mt-0.5 text-sm text-muted">
                      London, Greater London & surrounding UK areas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} y={30} className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            <div id="contact-form" className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-line">
              <h3 className="font-display text-2xl font-bold text-ink mb-2">Send a Message</h3>
              <p className="text-xs text-muted mb-6">
                Tell us about your premises and we will reply promptly with a free quote.
              </p>

              {status === "success" ? (
                <div className="rounded-2xl bg-teal-50 p-8 text-center ring-1 ring-teal-100">
                  <CheckCircle2 className="mx-auto size-12 text-brand mb-4" />
                  <h4 className="font-display text-xl font-bold text-ink mb-2">Quotation request received!</h4>
                  <p className="text-sm text-muted mb-6">
                    Thank you. We have received your details and will get back to you with a tailored quote shortly.
                  </p>
                  <Button variant="outline" onClick={() => setStatus("idle")}>
                    Send another request
                  </Button>
                </div>
              ) : (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {serverError && (
                      <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        {serverError}
                      </div>
                    )}

                    <Field id="name" label="Full Name" error={form.formState.errors.name?.message}>
                      <TextInput id="name" {...form.register("name")} placeholder="e.g. Sarah Mitchell" />
                    </Field>
                    <Field id="email" label="Email Address" error={form.formState.errors.email?.message}>
                      <TextInput
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="you@example.com"
                      />
                    </Field>
                    <Field id="subject" label="Subject / Service" error={form.formState.errors.subject?.message}>
                      <TextInput
                        id="subject"
                        {...form.register("subject")}
                        placeholder="e.g. Commercial Office Cleaning / End of Tenancy"
                      />
                    </Field>
                    <Field
                      id="message"
                      label="Requirements & Details"
                      hint="Location, property size & frequency"
                      error={form.formState.errors.message?.message}
                    >
                      <TextArea
                        id="message"
                        rows={4}
                        {...form.register("message")}
                        placeholder="Please include: premises type, location/postcode, approximate size, and preferred schedule..."
                      />
                    </Field>

                    {/* Honeypot field for bot protection */}
                    <div className="hidden" aria-hidden="true">
                      <input type="text" {...form.register("company")} tabIndex={-1} />
                    </div>

                    <Button type="submit" size="lg" className="w-full mt-2" disabled={status === "pending"}>
                      {status === "pending" ? "Submitting request..." : "Request Free Quote"}
                    </Button>
                  </form>
                </FormProvider>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
