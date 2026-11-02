import { useRef, useState } from "react";
import type { MemoryCardData } from "@/content/story";

/** Glass card with pointer/touch driven 3D tilt. */
export function MemoryCard({
  card,
  index,
  onOpen,
}: {
  card: MemoryCardData;
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const move = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (clientX - r.left) / r.width - 0.5;
    const py = (clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 14, y: px * 16 });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      onMouseMove={(e) => move(e.clientX, e.clientY)}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) move(t.clientX, t.clientY);
      }}
      onTouchEnd={() => setTilt({ x: 0, y: 0 })}
      className="group relative w-full shrink-0 snap-center text-left"
      style={{ perspective: "1100px", animation: `fade-in 0.7s ease-out ${index * 0.09}s both` }}
    >
      <div
        className={`glass relative flex h-56 flex-col justify-between overflow-hidden rounded-3xl p-6 transition-[transform,box-shadow] duration-300 ease-out sm:h-60 ${
          card.secret ? "ring-1 ring-glow-gold/40" : card.challenge ? "ring-1 ring-glow-rose/35" : ""
        }`}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
          transformStyle: "preserve-3d",
          boxShadow: card.secret ? "var(--shadow-gold), var(--shadow-float)" : "var(--shadow-float)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: card.secret
              ? "radial-gradient(circle, oklch(0.86 0.13 84 / 35%), transparent 70%)"
              : "radial-gradient(circle, oklch(0.72 0.192 355 / 30%), transparent 70%)",
            filter: "blur(12px)",
          }}
        />

        {card.challenge && <ChallengeSparkles />}


        {card.photo?.src && (
          <img
            src={card.photo.src}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-25 transition-opacity duration-500 group-hover:opacity-40"
          />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.14 0.05 351 / 45%) 0%, oklch(0.12 0.05 351 / 85%) 70%, oklch(0.1 0.04 351 / 95%) 100%)",
          }}
        />

        <div className="relative flex items-center justify-between">
          {card.secret ? (
            <GlowingLock />
          ) : (
            <span className="flex items-center gap-2">
              <CardOrnament index={index} />
              {card.challenge && (
                <span className="text-glow-rose animate-heartbeat" style={{ transform: "translateZ(30px)", filter: "drop-shadow(0 0 10px currentColor)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 21s-7.5-4.6-9.4-9.1C1.2 8.4 3.2 5 6.6 5c2 0 3.4 1.1 4.4 2.4h2c1-1.3 2.4-2.4 4.4-2.4 3.4 0 5.4 3.4 4 6.9C19.5 16.4 12 21 12 21z" />
                  </svg>
                </span>
              )}
            </span>
          )}
          {card.photo?.src && (
            <span className="h-12 w-12 overflow-hidden rounded-xl border border-border/50 shadow-[var(--shadow-float)]">
              <img
                src={card.photo.src}
                alt=""
                aria-hidden
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </span>
          )}
        </div>

        <div className="relative" style={{ transform: "translateZ(40px)" }}>
          <h3
            className={`font-display text-2xl leading-tight sm:text-[1.65rem] ${
              card.secret ? "text-glow-gold text-gold-glow" : "text-foreground text-glow"
            }`}
          >
            {card.title}
          </h3>
          {card.subtitle && (
            <p className="mt-1.5 text-sm text-foreground/70">{card.subtitle}</p>
          )}
          <span className="mt-3 block h-px w-12 bg-[var(--gradient-rose)] opacity-70" />
        </div>

        <span className="relative text-[0.6rem] uppercase tracking-[0.35em] text-foreground/70">
          {card.secret ? "Locked" : "Open"} {"\u2192"}
        </span>

      </div>
    </button>
  );
}

function CardOrnament({ index }: { index: number }) {
  return (
    <span
      className="text-glow-rose/70"
      style={{ transform: "translateZ(30px)", filter: "drop-shadow(0 0 10px currentColor)" }}
    >
      <span className="font-display text-xs tracking-[0.4em] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
    </span>
  );
}

function GlowingLock() {
  return (
    <span className="relative inline-flex" style={{ transform: "translateZ(30px)" }}>
      <span className="absolute -inset-3 animate-glow-pulse rounded-full bg-glow-gold/30" />
      <svg width="26" height="26" viewBox="0 0 24 24" className="relative text-glow-gold">
        <path
          d="M7 10V8a5 5 0 0 1 10 0v2"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="4.5" y="10" width="15" height="10.5" rx="3" fill="currentColor" opacity="0.9" />
      </svg>
    </span>
  );
}

/** Tiny floating sparkles — the subtle "little game" hint on the challenges card. */
function ChallengeSparkles() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-glow-gold"
          style={{
            left: `${16 + i * 22}%`,
            top: `${18 + ((i * 29) % 55)}%`,
            boxShadow: "0 0 10px currentColor",
            animation: `twinkle ${2.2 + i * 0.5}s ease-in-out ${i * 0.45}s infinite`,
          }}
        />
      ))}
    </span>
  );
}
