import "server-only";

/* -------------------------------------------------------------------------- */
/*  Best-effort in-memory rate limiter (per server instance).                  */
/*  For multi-instance production deployments, swap for Upstash/Redis.         */
/* -------------------------------------------------------------------------- */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear(); // crude memory cap
  return true;
}

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Google Sheets interprets cells starting with = + - @ as formulas (CSV/formula injection)
 * and would turn "+447700900123" into a number. A leading apostrophe forces plain text.
 */
export function sanitiseForSheet<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  }
  return out as T;
}
