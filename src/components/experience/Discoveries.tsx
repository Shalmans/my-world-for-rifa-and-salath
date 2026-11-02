import { useState } from "react";
import type { Discovery } from "@/content/story";
import { Butterfly, HeartGlyph } from "./Atmosphere";

/** Tiny findable glyphs hidden inside a chapter. Tap one for a small private message. */
export function Discoveries({ items }: { items: Discovery[] }) {
  const [open, setOpen] = useState<Discovery | null>(null);
  const [found, setFound] = useState<string[]>([]);

  return (
    <>
      {items.map((d) => (
        <button
          key={d.message}
          type="button"
          aria-label="a hidden little thing"
          onClick={() => {
            setOpen(d);
            setFound((f) => (f.includes(d.message) ? f : [...f, d.message]));
          }}
          className="absolute z-20 rounded-full p-2 transition-transform duration-300 hover:scale-125 active:scale-95"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            opacity: found.includes(d.message) ? 0.45 : 0.75,
            animation: "glow-pulse 3.4s ease-in-out infinite",
          }}
        >
          <span
            className={d.glyph === "star" ? "text-glow-moon" : d.glyph === "envelope" ? "text-glow-gold" : "text-glow-rose"}
            style={{ filter: "drop-shadow(0 0 10px currentColor)" }}
          >
            <Glyph kind={d.glyph} />
          </span>
        </button>
      ))}

      {open && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-night-deep/80 px-8 backdrop-blur-sm"
          style={{ animation: "fade-in 0.3s ease-out both" }}
          onClick={() => setOpen(null)}
        >
          <div
            className="glass max-w-xs rounded-3xl px-7 py-8 text-center"
            style={{ animation: "scale-in 0.4s ease-out both", boxShadow: "var(--shadow-glow)" }}
          >
            <p className="font-hand text-2xl leading-snug text-foreground">{open.message}</p>
            <p className="mt-5 text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">
              tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Glyph({ kind }: { kind: Discovery["glyph"] }) {
  if (kind === "butterfly") return <Butterfly size={18} />;
  if (kind === "heart") return <HeartGlyph size={16} />;
  if (kind === "star")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l2.3 6.6L21 11l-6.7 2.4L12 20l-2.3-6.6L3 11l6.7-2.4z" fill="currentColor" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor" opacity="0.9" />
      <path d="M3.5 7l8.5 6 8.5-6" stroke="oklch(0.12 0.04 351)" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
