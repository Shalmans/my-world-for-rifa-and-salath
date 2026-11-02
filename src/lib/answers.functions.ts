import { createServerFn } from "@tanstack/react-start";
import { PASSCODE } from "@/lib/passcode";

export type StoredSubmission = {
  id: string;
  name: string;
  submitted_at: string;
  answers: Record<string, string>;
};

/** Reason codes so the UI can tell apart a wrong passcode from a server problem. */
export type FailReason = "passcode" | "config" | "error";

/** True when the thrown error is the "service role key is missing" one. */
function isMissingConfig(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("Missing Supabase environment") || msg.includes("SERVICE_ROLE");
}

/**
 * Save one submission using the service-role client (bypasses RLS).
 *
 * Writes go through the server with the service role so the anon/publishable
 * key is never trusted for inserts. Requires SUPABASE_SERVICE_ROLE_KEY to be
 * set in the environment (locally in .env, and on the deployment host).
 */
export const saveSubmission = createServerFn({ method: "POST" })
  .validator((data: { name: string; answers: Record<string, string> }) => data)
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; reason: FailReason }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("birthday_quiz_submissions")
        .insert({ name: data.name, answers: data.answers });

      if (error) throw new Error(error.message);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: isMissingConfig(err) ? "config" : "error" };
    }
  });

export const fetchSubmissions = createServerFn({ method: "POST" })
  .validator((data: { passcode: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; rows: StoredSubmission[] }
      | { ok: false; reason: FailReason }
    > => {
      if (data.passcode.trim() !== PASSCODE) {
        return { ok: false, reason: "passcode" };
      }

      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: rows, error } = await supabaseAdmin
          .from("birthday_quiz_submissions")
          .select("id, name, submitted_at, answers")
          .order("submitted_at", { ascending: false });

        if (error) throw new Error(error.message);
        return { ok: true, rows: (rows ?? []) as unknown as StoredSubmission[] };
      } catch (err) {
        return { ok: false, reason: isMissingConfig(err) ? "config" : "error" };
      }
    },
  );

export const deleteSubmission = createServerFn({ method: "POST" })
  .validator((data: { passcode: string; id: string }) => data)
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; reason: FailReason }> => {
    if (data.passcode.trim() !== PASSCODE) return { ok: false, reason: "passcode" };

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("birthday_quiz_submissions")
        .delete()
        .eq("id", data.id);

      if (error) throw new Error(error.message);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: isMissingConfig(err) ? "config" : "error" };
    }
  });
