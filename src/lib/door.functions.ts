import { createServerFn } from "@tanstack/react-start";
import { PASSCODE } from "@/lib/passcode";
import type { FailReason } from "@/lib/answers.functions";
import { describeRequest } from "@/lib/request-info";

/**
 * Secret-door log.
 *
 * Every PIN attempt — right or wrong — is written down with the time and the
 * device it came from, so the Door tab in /admin can answer "did someone try
 * to get in, and when?".
 *
 * The PIN itself lives in the browser bundle, so the browser is what decides
 * right from wrong; this only records what it reports. Good enough for a
 * birthday surprise, and deliberately not treated as security.
 */

/** What the browser reports after one attempt; the rest comes from headers. */
export type DoorPing = {
  success: boolean;
  /** Digits typed. Ignored when `success` — see `entered` below. */
  entered: string | null;
  /** Which try this was in one sitting: 1 = first attempt after arriving. */
  attemptNo: number;
  visitorId: string | null;
  screen: string | null;
  timezone: string | null;
  language: string | null;
};

export type DoorAttemptRow = {
  id: string;
  attempted_at: string;
  success: boolean;
  entered: string | null;
  attempt_no: number | null;
  visitor_id: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  screen: string | null;
  timezone: string | null;
  language: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

const ATTEMPT_COLUMNS =
  "id, attempted_at, success, entered, attempt_no, visitor_id, device, browser, os, screen, timezone, language, country, region, city";

/** The log answers "who tried lately", so it is read newest-first and capped. */
const ATTEMPT_LIMIT = 300;

/** Longest guess worth keeping, so a hand-crafted request can't dump junk in. */
const MAX_ENTERED = 24;

/** Write down one attempt at the secret door. */
export const logDoorAttempt = createServerFn({ method: "POST" })
  .validator((data: DoorPing) => data)
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const info = describeRequest(getRequest()?.headers);
      if (info.isBot) return { ok: true };

      // Keeping the digits of a *correct* attempt would write the real PIN into
      // the database, so only wrong guesses are ever stored.
      const entered = data.success
        ? null
        : (data.entered ?? "").replace(/\D/g, "").slice(0, MAX_ENTERED) || null;

      const { error } = await supabaseAdmin.from("door_attempts").insert({
        success: data.success,
        entered,
        attempt_no: Number.isFinite(data.attemptNo) ? Math.trunc(data.attemptNo) : null,
        visitor_id: data.visitorId,
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
      });

      if (error) throw new Error(error.message);
      return { ok: true };
    } catch (err) {
      // A missed log entry is never worth breaking the door over.
      console.error("[door] log failed", err);
      return { ok: false };
    }
  });

/** Recent attempts, newest first. */
export const fetchDoorAttempts = createServerFn({ method: "POST" })
  .validator((data: { passcode: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; attempts: DoorAttemptRow[] } | { ok: false; reason: FailReason | "table" }
    > => {
      if (data.passcode.trim() !== PASSCODE) return { ok: false, reason: "passcode" };

      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: rows, error } = await supabaseAdmin
          .from("door_attempts")
          .select(ATTEMPT_COLUMNS)
          .order("attempted_at", { ascending: false })
          .limit(ATTEMPT_LIMIT);

        if (error) {
          // 42P01 = table missing, PGRST205 = not in the API schema cache yet.
          if (error.code === "42P01" || error.code === "PGRST205") {
            return { ok: false, reason: "table" };
          }
          throw new Error(error.message);
        }
        return { ok: true, attempts: (rows ?? []) as unknown as DoorAttemptRow[] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Missing Supabase environment") || msg.includes("SERVICE_ROLE")) {
          return { ok: false, reason: "config" };
        }
        return { ok: false, reason: "error" };
      }
    },
  );
