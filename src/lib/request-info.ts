/**
 * What the edge network and the user-agent can tell us about one request.
 *
 * Shared by the visitor counter and the secret-door log so both describe the
 * same phone the same way. Pure functions only — this module is imported by
 * *.functions.ts files, which also ship to the browser bundle.
 */

/** Link previews and crawlers open the page too — they are not people. */
export const BOT_AGENTS =
  /bot|crawl|spider|slurp|headless|lighthouse|monitor|preview|facebookexternalhit|whatsapp|telegram|discord|twitterbot|slackbot|linkedinbot|embedly|pinterest|curl|wget|python-requests|axios|okhttp/i;

/** Rough device / browser / OS from the user-agent — no library needed. */
export function readUserAgent(ua: string) {
  const s = ua.toLowerCase();
  const tablet = /ipad|tablet|playbook|silk/.test(s) || (/android/.test(s) && !/mobile/.test(s));
  const phone = /mobi|iphone|ipod|android|blackberry|windows phone/.test(s);

  const device = tablet ? "Tablet" : phone ? "Phone" : "Computer";

  const os = /windows nt/.test(s)
    ? "Windows"
    : /iphone|ipad|ipod/.test(s)
      ? "iOS"
      : /mac os x/.test(s)
        ? "Mac"
        : /android/.test(s)
          ? "Android"
          : /linux/.test(s)
            ? "Linux"
            : "Unknown";

  // Order matters: Edge and Opera also say "chrome", Chrome also says "safari".
  const browser = /edg[ea]?\//.test(s)
    ? "Edge"
    : /opr\/|opera/.test(s)
      ? "Opera"
      : /samsungbrowser/.test(s)
        ? "Samsung Internet"
        : /fxios|firefox/.test(s)
          ? "Firefox"
          : /crios|chrome/.test(s)
            ? "Chrome"
            : /safari/.test(s)
              ? "Safari"
              : "Unknown";

  return { device, os, browser };
}

/** Vercel sends the city URL-encoded ("Abu%20Dhabi"). */
export function decodeHeader(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value) || null;
  } catch {
    return value;
  }
}

/** Caller's address, whichever proxy header the host happens to use. */
export function readClientIp(headers: Headers | undefined): string {
  return (
    headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers?.get("cf-connecting-ip") ||
    headers?.get("x-real-ip") ||
    ""
  );
}

/**
 * Everything worth keeping about where a request came from. The raw IP is
 * returned for fingerprinting but is never meant to be stored as-is.
 */
export function describeRequest(headers: Headers | undefined) {
  const userAgent = headers?.get("user-agent") ?? "";
  return {
    userAgent,
    isBot: BOT_AGENTS.test(userAgent),
    ip: readClientIp(headers),
    ...readUserAgent(userAgent),
    country: headers?.get("x-vercel-ip-country") ?? headers?.get("cf-ipcountry") ?? null,
    region: decodeHeader(headers?.get("x-vercel-ip-country-region")),
    city: decodeHeader(headers?.get("x-vercel-ip-city")),
  };
}
