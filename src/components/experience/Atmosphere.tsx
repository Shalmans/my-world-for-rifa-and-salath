import { useEffect, useMemo, useState } from "react";

/** Deterministic pseudo-random so layers stay stable across re-renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function Butterfly({
  size = 22,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g style={{ transformOrigin: "16px 16px", animation: "flutter 0.5s ease-in-out infinite" }}>
        <path
          d="M16 16C13 8 6 5 3.5 8.5S4 20 16 16Z"
          fill="currentColor"
          opacity="0.85"
        />
        <path
          d="M16 16C19 8 26 5 28.5 8.5S28 20 16 16Z"
          fill="currentColor"
          opacity="0.85"
        />
        <path d="M16 16C13.5 21 8 25 6 22.5S8 16.5 16 16Z" fill="currentColor" opacity="0.6" />
        <path d="M16 16C18.5 21 24 25 26 22.5S24 16.5 16 16Z" fill="currentColor" opacity="0.6" />
        <rect x="15.3" y="10" width="1.4" height="12" rx="0.7" fill="currentColor" />
      </g>
    </svg>
  );
}

export function HeartGlyph({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 16.1 12 21 12 21Z"
        fill="currentColor"
      />
    </svg>
  );
}

type AtmosphereProps = {
  /** 0.4 = calm, 1 = lively, 2 = celebration */
  intensity?: number;
  moon?: boolean;
  flowers?: boolean;
  warm?: boolean;
};

export function Atmosphere({
  intensity = 1,
  moon = false,
  flowers = false,
  warm = false,
}: AtmosphereProps) {
  const [mounted, setMounted] = useState(false);
  const par = useParallax();
  useEffect(() => setMounted(true), []);

  const stars = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 70 }, () => ({
      x: r() * 100,
      y: r() * 100,
      s: 1 + r() * 2,
      d: 2 + r() * 5,
      delay: r() * 6,
    }));
  }, []);

  const fireflies = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: Math.round(26 * intensity) }, () => ({
      x: r() * 100,
      s: 3 + r() * 5,
      d: 14 + r() * 18,
      delay: -r() * 30,
      drift: (r() - 0.5) * 220,
      gold: r() > 0.45,
    }));
  }, [intensity]);

  const hearts = useMemo(() => {
    const r = rng(33);
    return Array.from({ length: Math.round(9 * intensity) }, () => ({
      x: r() * 100,
      s: 10 + r() * 16,
      d: 18 + r() * 16,
      delay: -r() * 34,
      drift: (r() - 0.5) * 160,
    }));
  }, [intensity]);

  const butterflies = useMemo(() => {
    const r = rng(55);
    return Array.from({ length: Math.round(7 * intensity) }, () => ({
      x: r() * 100,
      s: 14 + r() * 20,
      d: 22 + r() * 20,
      delay: -r() * 40,
      drift: (r() - 0.5) * 320,
      rose: r() > 0.5,
    }));
  }, [intensity]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base sky */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-night)" }} />

      {/* Warm light wash */}
      {warm && (
        <div
          className="absolute inset-0 animate-glow-pulse"
          style={{
            background:
              "radial-gradient(60% 45% at 50% 65%, oklch(0.86 0.13 84 / 22%) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Fog */}
      <div
        className="absolute inset-x-[-20%] bottom-[-10%] h-[60%] opacity-40"
        style={{
          background:
            "radial-gradient(50% 60% at 30% 80%, oklch(0.75 0.09 345 / 22%) 0%, transparent 70%), radial-gradient(50% 60% at 75% 90%, oklch(0.7 0.1 341 / 20%) 0%, transparent 70%)",
          animation: "fog-slide 26s ease-in-out infinite alternate",
          filter: "blur(24px)",
        }}
      />

      {moon && (
        <div
          className="absolute right-[8%] top-[7%] sm:right-[12%]"
          style={{
            transform: `translate3d(${par.x * -14}px, ${par.y * -10}px, 0)`,
            transition: "transform 900ms cubic-bezier(.2,.8,.3,1)",
          }}
        >
          <div
            className="absolute -inset-16 rounded-full animate-glow-pulse"
            style={{ background: "radial-gradient(circle, oklch(0.96 0.03 90 / 30%), transparent 70%)" }}
          />
          <div
            className="relative h-20 w-20 rounded-full sm:h-28 sm:w-28"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, oklch(0.99 0.02 90), oklch(0.88 0.05 80) 60%, oklch(0.76 0.06 70))",
              boxShadow: "0 0 90px 10px oklch(0.96 0.03 90 / 28%)",
            }}
          />
        </div>
      )}

      {mounted && (
        <div
          className="absolute inset-[-6%]"
          style={{
            transform: `translate3d(${par.x * 26}px, ${par.y * 20}px, 0)`,
            transition: "transform 700ms cubic-bezier(.2,.8,.3,1)",
            willChange: "transform",
          }}
        >
          {/* Stars */}
          {stars.map((s, i) => (
            <span
              key={`st-${i}`}
              className="absolute rounded-full bg-glow-moon"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.s,
                height: s.s,
                animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}

          {/* Fireflies */}
          {fireflies.map((f, i) => (
            <span
              key={`ff-${i}`}
              className="absolute bottom-0 rounded-full"
              style={{
                left: `${f.x}%`,
                width: f.s,
                height: f.s,
                background: f.gold ? "var(--glow-gold)" : "var(--glow-rose)",
                boxShadow: `0 0 ${f.s * 3}px ${f.gold ? "var(--glow-gold)" : "var(--glow-rose)"}`,
                ["--drift-x" as string]: `${f.drift}px`,
                animation: `drift-up ${f.d}s linear ${f.delay}s infinite`,
              }}
            />
          ))}

          {/* Hearts */}
          {hearts.map((h, i) => (
            <span
              key={`hh-${i}`}
              className="absolute bottom-0 text-glow-rose"
              style={{
                left: `${h.x}%`,
                ["--drift-x" as string]: `${h.drift}px`,
                animation: `drift-up ${h.d}s linear ${h.delay}s infinite`,
                filter: "drop-shadow(0 0 8px oklch(0.72 0.192 355 / 70%))",
                opacity: 0.7,
              }}
            >
              <HeartGlyph size={h.s} />
            </span>
          ))}

          {/* Butterflies */}
          {butterflies.map((b, i) => (
            <span
              key={`bf-${i}`}
              className={`absolute bottom-0 ${b.rose ? "text-glow-rose" : "text-glow-gold"}`}
              style={{
                left: `${b.x}%`,
                ["--drift-x" as string]: `${b.drift}px`,
                animation: `drift-up ${b.d}s linear ${b.delay}s infinite`,
                filter: "drop-shadow(0 0 10px oklch(0.7 0.192 350 / 60%))",
                opacity: 0.75,
              }}
            >
              <Butterfly size={b.s} />
            </span>
          ))}
        </div>
      )}

      {/* Flowers along the bottom */}
      {flowers && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2 opacity-70">
          {Array.from({ length: 9 }).map((_, i) => (
            <svg
              key={`fl-${i}`}
              width="54"
              height="76"
              viewBox="0 0 54 76"
              className="animate-sway text-glow-magenta"
              style={{
                transformOrigin: "27px 76px",
                animationDelay: `${i * 0.7}s`,
                opacity: 0.35 + (i % 3) * 0.2,
              }}
            >
              <path d="M27 76V34" stroke="oklch(0.6 0.1 150)" strokeWidth="2" opacity="0.6" />
              <g fill="currentColor" opacity="0.85">
                <circle cx="27" cy="26" r="7" />
                <circle cx="18" cy="32" r="6" />
                <circle cx="36" cy="32" r="6" />
                <circle cx="22" cy="18" r="6" />
                <circle cx="33" cy="18" r="6" />
              </g>
              <circle cx="27" cy="25" r="3.4" fill="var(--glow-gold)" />
            </svg>
          ))}
        </div>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 80% at 50% 40%, transparent 40%, oklch(0.08 0.04 351 / 75%) 100%)",
        }}
      />
    </div>
  );
}

/**
 * Subtle depth: follows the pointer on desktop, device tilt on mobile.
 * Returns values in the -0.5 .. 0.5 range. Disabled for reduced motion.
 */
export function useParallax() {
  const [p, setP] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setP({ x, y }));
    };

    const onMove = (e: PointerEvent) => {
      set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      const g = Math.max(-30, Math.min(30, e.gamma ?? 0));
      const b = Math.max(-30, Math.min(30, (e.beta ?? 0) - 40));
      set(g / 60, b / 60);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) set(t.clientX / window.innerWidth - 0.5, t.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  return p;
}
