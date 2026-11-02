/**
 * The one back / close control every scene uses, so the way out is always
 * visible. Kept in a single place so the pill looks and sits identically
 * everywhere instead of each scene inventing its own faint little link.
 *
 * Stacking: the back pill sits at z-55 — above every scene and above the
 * secret-door overlay (z-50), but below the card / photo / letter modals
 * (z-60+) which carry their own close button.
 */

function ChevronLeft({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Cross({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Always-visible back pill, pinned just under the countdown badge.
 * Glass + a soft rose edge so it reads against the animated night sky, and a
 * 44px tap target so it is easy to reach with a thumb.
 */
export function SceneBack({ label = "Back", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Back to ${label.toLowerCase()}`}
      className="glass fixed left-3 z-55 flex min-h-11 items-center gap-2 rounded-full border border-border/70 py-2.5 pl-3.5 pr-5 text-[0.6rem] uppercase tracking-[0.26em] text-foreground/90 transition-all duration-300 hover:border-glow-rose/60 hover:text-foreground active:scale-95 sm:left-5 sm:text-[0.65rem]"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 4rem)",
        animation: "fade-in 0.8s ease-out both",
        boxShadow: "var(--shadow-float), 0 0 26px -14px var(--glow-rose)",
      }}
    >
      <span className="text-glow-rose">
        <ChevronLeft />
      </span>
      {label}
    </button>
  );
}

/**
 * Round × pinned in the top-right corner of a panel, so a long letter or story
 * card never buries the way out at the bottom of a scroll.
 */
export function PanelClose({
  onClick,
  label = "Close",
  tone = "light",
}: {
  onClick: () => void;
  label?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 active:scale-90 ${
        dark
          ? "border-night-deep/20 bg-night-deep/5 text-night-deep/60 hover:border-night-deep/40 hover:text-night-deep"
          : "glass border-border/70 text-foreground/80 hover:border-glow-rose/60 hover:text-foreground"
      }`}
    >
      <Cross />
    </button>
  );
}
