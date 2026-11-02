import { useEffect } from "react";
import { trackVisit } from "@/lib/visits.functions";

const ID_KEY = "rifa-visitor-id";
const SESSION_KEY = "rifa-visit-counted";

/** Storage throws in private mode / blocked cookies — never let that break the page. */
function readStore(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function writeStore(store: "local" | "session", key: string, value: string) {
  try {
    (store === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    /* ignore */
  }
}

/**
 * The id this browser carries, if the tracker has already been here. Shared so
 * other logs (the secret door) can point at the same visitor row.
 */
export function readVisitorId(): string | null {
  return readStore("local", ID_KEY);
}

/** Survives React's double-mounted effects even when storage is unavailable. */
let pinged = false;

/**
 * Tell the server this browser opened the site — once per browser session.
 *
 * The random id kept in localStorage is what makes the count *unique*: the
 * same person visiting ten times stays one visitor with ten opens.
 */
export function useVisitTracker() {
  useEffect(() => {
    if (pinged || readStore("session", SESSION_KEY)) return;
    pinged = true;
    writeStore("session", SESSION_KEY, "1");

    const referrer = document.referrer;
    const sameSite = referrer.startsWith(window.location.origin);

    void trackVisit({
      data: {
        visitorId: readStore("local", ID_KEY),
        screen: `${window.screen.width}×${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
        language: navigator.language ?? null,
        referrer: referrer && !sameSite ? referrer : null,
      },
    })
      .then((res) => {
        if (res?.visitorId) writeStore("local", ID_KEY, res.visitorId);
      })
      .catch(() => {
        /* a failed count is not worth a broken page */
      });
  }, []);
}
