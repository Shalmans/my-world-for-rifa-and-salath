import { createServerFn } from "@tanstack/react-start";
import { PASSCODE } from "@/lib/passcode";
import type { FailReason } from "@/lib/answers.functions";
import { describeRequest } from "@/lib/request-info";

/**
 * Visitor counting.
 *
 * One row per person, not per page load: the browser keeps a random id in
 * localStorage and sends it with every visit, so the same person opening the
 * site ten times counts as ONE visitor with ten opens. If that storage is
 * wiped (or she is in private mode) we fall back to a hashed device
 * fingerprint — IP + browser + screen + timezone — so the same phone still
 * lands on the same row instead of inflating the count.
 */

/** What the browser can tell us about itself; the rest comes from headers. */
export type VisitPing = {
  visitorId: string | null;
  screen: string | null;
  timezone: string | null;
  language: string | null;
  referrer: string | null;
};

export type VisitorRow = {
  id: string;
  visitor_id: string;
  visit_count: number;
  first_seen_at: string;
  last_seen_at: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  screen: string | null;
  timezone: string | null;
  language: string | null;
  referrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

const VISITOR_COLUMNS =
  "id, visitor_id, visit_count, first_seen_at, last_seen_at, device, browser, os, screen, timezone, language, referrer, country, region, city";

/** Short SHA-256 — the raw IP is never stored, only this hash. */
async function shortHash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/**
 * Record one visit. Returns the visitor id the browser should keep — it may
 * differ from the one sent when the fingerprint matched an older row.
 */
export const trackVisit = createServerFn({ method: "POST" })
  .validator((data: VisitPing) => data)
  .handler(async ({ data }): Promise<{ visitorId: string | null }> => {
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const info = describeRequest(getRequest()?.headers);
      if (info.isBot) return { visitorId: data.visitorId };

      // Screen + timezone go into the fingerprint so two different people
      // behind one office/home IP aren't merged into a single visitor.
      const fingerprint = await shortHash(
        [
          info.ip,
          info.userAgent,
          data.screen ?? "",
          data.timezone ?? "",
          data.language ?? "",
        ].join("|"),
      );

      const details = {
        fingerprint,
        device: info.device,
        browser: info.browser,
        os: info.os,
        screen: data.screen,
        timezone: data.timezone,
        language: data.language,
        country: info.country,
        region: info.region,
        city: info.city,
        user_agent: info.userAgent || null,
        last_seen_at: new Date().toISOString(),
      };

      // Known browser first, same device second — either one means "seen before".
      const sent = data.visitorId?.trim();
      let existing: { id: string; visitor_id: string; visit_count: number } | null = null;

      if (sent) {
        const { data: row } = await supabaseAdmin
          .from("site_visitors")
          .select("id, visitor_id, visit_count")
          .eq("visitor_id", sent)
          .maybeSingle();
        existing = row;
      }

      if (!existing) {
        const { data: rows } = await supabaseAdmin
          .from("site_visitors")
          .select("id, visitor_id, visit_count")
          .eq("fingerprint", fingerprint)
          .order("last_seen_at", { ascending: false })
          .limit(1);
        existing = rows?.[0] ?? null;
      }

      if (existing) {
        await supabaseAdmin
          .from("site_visitors")
          .update({ ...details, visit_count: existing.visit_count + 1 })
          .eq("id", existing.id);
        return { visitorId: existing.visitor_id };
      }

      const visitorId = sent || crypto.randomUUID();
      const { error } = await supabaseAdmin.from("site_visitors").insert({
        ...details,
        visitor_id: visitorId,
        visit_count: 1,
        referrer: data.referrer,
      });

      // Two tabs opened at once can race on the unique visitor_id — that just
      // means the row already exists, which is exactly what we wanted.
      if (error && error.code !== "23505") throw new Error(error.message);
      return { visitorId };
    } catch (err) {
      // Tracking must never break the page.
      console.error("[visits] track failed", err);
      return { visitorId: data.visitorId };
    }
  });

/** Every visitor, newest activity first. The dashboard does the counting. */
export const fetchVisitors = createServerFn({ method: "POST" })
  .validator((data: { passcode: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; visitors: VisitorRow[] } | { ok: false; reason: FailReason | "table" }
    > => {
      if (data.passcode.trim() !== PASSCODE) return { ok: false, reason: "passcode" };

      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: rows, error } = await supabaseAdmin
          .from("site_visitors")
          .select(VISITOR_COLUMNS)
          .order("last_seen_at", { ascending: false });

        if (error) {
          // 42P01 = table missing, PGRST205 = not in the API schema cache yet.
          if (error.code === "42P01" || error.code === "PGRST205") {
            return { ok: false, reason: "table" };
          }
          throw new Error(error.message);
        }
        return { ok: true, visitors: (rows ?? []) as unknown as VisitorRow[] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Missing Supabase environment") || msg.includes("SERVICE_ROLE")) {
          return { ok: false, reason: "config" };
        }
        return { ok: false, reason: "error" };
      }
    },
  );
