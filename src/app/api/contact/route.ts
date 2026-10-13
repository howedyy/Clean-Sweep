import { z } from "zod";
import { contactSchema } from "@/lib/validation";
import { clientIp, rateLimit, sanitiseForSheet } from "@/lib/server-utils";

/**
 * POST /api/contact — general enquiries.
 * Relays to GOOGLE_SCRIPT_CONTACT_WEBHOOK_URL when configured (kept separate from the
 * bookings sheet so enquiries never pollute booking rows); logs in development otherwise.
 */
export async function POST(request: Request) {
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 60_000)) {
    return Response.json({ ok: false, message: "Too many messages. Please wait a minute." }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { ok: false, message: "Please check the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }
  if (parsed.data.company) return Response.json({ ok: true });

  const { name, email, subject, message } = parsed.data;
  const webhookUrl = process.env.GOOGLE_SCRIPT_CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    console.info("[api/contact] New enquiry (no webhook configured):", { name, email, subject, message });
    return Response.json({ ok: true });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitiseForSheet({ type: "contact", name, email, subject, message })),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Webhook ${res.status}`);
  } catch (err) {
    console.error("[api/contact] Relay failed", err);
    return Response.json({ ok: false, message: "Message failed to send. Please try WhatsApp or call us." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
