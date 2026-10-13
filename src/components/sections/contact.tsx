"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CircleAlert, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, TextInput, TextArea } from "@/components/ui/field";
import { Reveal, SectionHeading } from "@/components/ui/section";
import { useBooking } from "@/components/booking/booking-provider";
import { contactSchema, type ContactFormValues } from "@/lib/validation";

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
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-start">
          
          <Reveal y={20}>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-hover ring-1 ring-line shadow-sm">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                Get in Touch
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">
                We're here to help.
              </h2>
              <p className="mt-4 text-lg text-muted max-w-md">
                Have a question about our services or need a custom commercial quote? Reach out to our London-based team.
              </p>

              <div className="mt-12 space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line text-brand">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">Headquarters</h3>
                    <p className="mt-1 text-sm text-muted">123 Cleaner's Way<br />London, SW1A 1AA<br />United Kingdom</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line text-brand">
                    <Phone className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">Telephone Support</h3>
                    <p className="mt-1 text-sm text-muted">Mon–Sat: 08:00–19:00</p>
                    <a href="tel:+442012345678" className="mt-1 block font-medium text-brand hover:underline">+44 20 1234 5678</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line text-brand">
                    <MessageSquare className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">WhatsApp Direct</h3>
                    <p className="mt-1 text-sm text-muted">Instant replies during working hours</p>
                    <a href="#" className="mt-1 block font-medium text-brand hover:underline">Chat on WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} y={30} className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            <div id="contact-form" className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-line">
              <h3 className="font-display text-2xl font-bold text-ink mb-6">Send a message</h3>
              
              {status === "success" ? (
                <div className="rounded-2xl bg-teal-50 p-8 text-center ring-1 ring-teal-100">
                  <CheckCircle2 className="mx-auto size-12 text-brand mb-4" />
                  <h4 className="font-display text-xl font-bold text-ink mb-2">Message sent!</h4>
                  <p className="text-sm text-muted mb-6">We've received your enquiry and will be in touch shortly.</p>
                  <Button variant="outline" onClick={() => setStatus("idle")}>Send another message</Button>
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
                      <TextInput id="name" {...form.register("name")} placeholder="e.g. Sarah Smith" />
                    </Field>
                    <Field id="email" label="Email Address" error={form.formState.errors.email?.message}>
                      <TextInput id="email" type="email" {...form.register("email")} placeholder="sarah@example.com" />
                    </Field>
                    <Field id="subject" label="Subject" error={form.formState.errors.subject?.message}>
                      <TextInput id="subject" {...form.register("subject")} placeholder="How can we help?" />
                    </Field>
                    <Field id="message" label="Message" error={form.formState.errors.message?.message}>
                      <TextArea id="message" rows={4} {...form.register("message")} placeholder="Your message..." />
                    </Field>
                    
                    {/* Honeypot field for bot protection */}
                    <div className="hidden" aria-hidden="true">
                      <input type="text" {...form.register("company")} tabIndex={-1} />
                    </div>

                    <Button type="submit" size="lg" className="w-full mt-2" disabled={status === "pending"}>
                      {status === "pending" ? "Sending..." : "Send Message"}
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
