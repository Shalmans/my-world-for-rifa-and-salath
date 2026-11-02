import { useEffect, useMemo, useRef } from "react";
import { Butterfly, HeartGlyph } from "./Atmosphere";

/** Deterministic pseudo-random so the burst looks the same every time. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** The veil is fully opaque here — safe moment to swap the scene behind it. */
const COVER_MS = 1150;
/** Whole burst, veil fade-out included. */
const TOTAL_MS = 2900;

const HEART_PATH =
  "M12 21s-8-4.9-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 16.1 12 21 12 21Z";

type Flyer = {
  dx: number;
  dy: number;
  angle: number;
  size: number;
  delay: number;
  dur: number;
  rot: number;
  scale: number;
  gold: boolean;
};

/** Petals of glow flung out from the middle of the screen. */
function useFlyers(count: number, seed: number, minDist: number, spread = 55) {
  return useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (r() - 0.5) * 0.6;
      const dist = minDist + r() * spread;
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        angle: (angle * 180) / Math.PI,
        size: 16 + r() * 28,
        delay: r() * 340,
        dur: 1400 + r() * 800,
        rot: (r() - 0.5) * 300,
        scale: 0.9 + r() * 1.1,
        gold: r() > 0.55,
      } satisfies Flyer;
    });
  }, [count, seed, minDist, spread]);
}

/** Four-point sparkle. */
function Glint({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Single rose petal, used for the swirl of petals leaving the heart. */
function Petal({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 20 28" aria-hidden="true">
      <path
        d="M10 0C16 7 20 14 20 19a10 10 0 0 1-20 0C0 14 4 7 10 0Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M10 3C13 9 15 14 15 19"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="0.8"
        fill="none"
      />
    </svg>
  );
}

/**
 * Full-screen heart-and-butterfly bloom that plays while the intro hands over
 * to her world: the heart draws itself, swells and beats, butterflies trail
 * light to every edge, then the rose veil lifts on the new scene.
 */
export function EnterBurst({ onCover, onDone }: { onCover: () => void; onDone: () => void }) {
  const cover = useRef(onCover);
  const done = useRef(onDone);
  cover.current = onCover;
  done.current = onDone;

  /** Thin the swarm on small screens so the bloom stays silky. */
  const small = useMemo(() => typeof window !== "undefined" && window.innerWidth < 640, []);

  const hearts = useFlyers(small ? 14 : 22, 91, 40);
  const butterflies = useFlyers(small ? 10 : 16, 137, 52, 60);
  const petals = useFlyers(small ? 12 : 20, 211, 30, 70);
  const glints = useMemo(() => {
    const r = rng(303);
    return Array.from({ length: small ? 10 : 16 }, () => ({
      x: 6 + r() * 88,
      y: 6 + r() * 88,
      s: 10 + r() * 22,
      delay: r() * 1500,
      gold: r() > 0.5,
    }));
  }, [small]);
  const bokeh = useMemo(() => {
    const r = rng(417);
    return Array.from({ length: small ? 7 : 12 }, () => ({
      x: r() * 100,
      y: r() * 100,
      s: 40 + r() * 130,
      delay: r() * 900,
      gold: r() > 0.6,
    }));
  }, [small]);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const a = window.setTimeout(() => cover.current(), reduced ? 60 : COVER_MS);
    const b = window.setTimeout(() => done.current(), reduced ? 240 : TOTAL_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ zIndex: 80, animation: `enter-veil ${TOTAL_MS}ms ease-in-out both` }}
    >
      {/* Deep sky, so the bloom always has something to glow against */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-night)" }} />

      {/* Two slow aurora sheets of rose and violet light */}
      <div
        className="absolute inset-[-30%]"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, oklch(0.72 0.192 355 / 60%), transparent 25%, oklch(0.66 0.192 345 / 55%) 50%, transparent 72%, oklch(0.6 0.192 335 / 55%) 100%)",
          filter: "blur(70px)",
          animation: `enter-aurora ${TOTAL_MS}ms ease-in-out both`,
          willChange: "transform, opacity",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(65% 55% at 50% 50%, oklch(0.78 0.192 354 / 80%) 0%, oklch(0.4 0.15 352 / 70%) 48%, transparent 78%)",
          animation: `enter-wash ${TOTAL_MS}ms ease-in-out both`,
        }}
      />

      {/* Out-of-focus lights drifting in the depth */}
      {bokeh.map((b, i) => (
        <span
          key={`bk-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.s,
            height: b.s,
            background: b.gold
              ? "radial-gradient(circle, oklch(0.9 0.12 88 / 45%), transparent 70%)"
              : "radial-gradient(circle, oklch(0.85 0.156 350 / 40%), transparent 70%)",
            filter: "blur(6px)",
            animation: `enter-bokeh 2400ms ease-in-out ${b.delay}ms both`,
          }}
        />
      ))}

      {/* Rays of light turning slowly behind the heart */}
      <div
        className="absolute h-[130vmax] w-[130vmax]"
        style={{
          background:
            "repeating-conic-gradient(from 0deg at 50% 50%, oklch(0.99 0.03 90 / 22%) 0deg 3deg, transparent 3deg 14deg)",
          maskImage: "radial-gradient(circle, black 8%, transparent 55%)",
          WebkitMaskImage: "radial-gradient(circle, black 8%, transparent 55%)",
          animation: `enter-rays ${TOTAL_MS}ms cubic-bezier(.2,.6,.3,1) both`,
          willChange: "transform, opacity",
        }}
      />

      {/* Bloom of warm light in the heart's chest */}
      <div
        className="absolute h-[74vmin] w-[74vmin] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.99 0.04 90 / 90%) 0%, oklch(0.88 0.13 84 / 50%) 32%, oklch(0.75 0.192 355 / 22%) 55%, transparent 72%)",
          filter: "blur(20px)",
          animation: `enter-bloom ${TOTAL_MS}ms cubic-bezier(.2,.7,.3,1) both`,
        }}
      />

      {/* Heartbeat rings leaving the screen */}
      {[0, 260, 560, 900].map((delay) => (
        <span
          key={`ring-${delay}`}
          className="absolute h-[38vmin] w-[38vmin] rounded-full border"
          style={{
            borderColor: "oklch(0.97 0.04 92 / 60%)",
            boxShadow:
              "0 0 40px oklch(0.9 0.12 88 / 45%), inset 0 0 30px oklch(0.85 0.156 350 / 35%)",
            animation: `enter-ring 1800ms cubic-bezier(.15,.7,.25,1) ${delay}ms both`,
          }}
        />
      ))}

      {/* The heart itself: drawn, filled, then breathing */}
      <div
        className="relative h-[62vmin] w-[62vmin]"
        style={{ animation: `enter-heart 2300ms cubic-bezier(.2,.8,.25,1) both` }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-full w-full"
          style={{ filter: "drop-shadow(0 0 70px oklch(0.75 0.192 355 / 90%))" }}
        >
          <defs>
            <linearGradient id="eb-fill" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="oklch(0.92 0.11 86)" />
              <stop offset="38%" stopColor="oklch(0.78 0.192 356)" />
              <stop offset="100%" stopColor="oklch(0.6 0.192 343)" />
            </linearGradient>
            <radialGradient id="eb-shine" cx="0.34" cy="0.3" r="0.55">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="60%" stopColor="white" stopOpacity="0.12" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="eb-sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.75" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <clipPath id="eb-clip">
              <path d={HEART_PATH} />
            </clipPath>
          </defs>

          <path d={HEART_PATH} fill="url(#eb-fill)" />

          <g clipPath="url(#eb-clip)">
            {/* Glossy highlight */}
            <ellipse cx="9.5" cy="11" rx="6" ry="5" fill="url(#eb-shine)" />
            {/* Light sweeping across the surface */}
            <g transform="rotate(18 12 12)">
              <rect
                x="-10"
                y="-2"
                width="9"
                height="28"
                fill="url(#eb-sweep)"
                style={{ animation: "enter-sweep 1500ms ease-in-out 700ms both" }}
              />
            </g>
          </g>

          {/* Outline that traces the heart before it fills */}
          <path
            d={HEART_PATH}
            fill="none"
            stroke="oklch(0.99 0.02 90)"
            strokeWidth="0.3"
            strokeLinecap="round"
            pathLength={1}
            style={{ strokeDasharray: 1, animation: "enter-draw 1100ms ease-in-out both" }}
          />
        </svg>

        {/* Small hearts orbiting the big one */}
        <div
          className="absolute inset-[-6%]"
          style={{ animation: `enter-orbit ${TOTAL_MS}ms linear both` }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={`or-${i}`}
              className="absolute left-1/2 top-1/2 text-glow-gold"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 36}deg) translateY(-34vmin)`,
                filter: "drop-shadow(0 0 10px oklch(0.9 0.12 88 / 90%))",
                animation: `enter-twinkle 900ms ease-in-out ${i * 90}ms infinite`,
              }}
            >
              <HeartGlyph size={13} />
            </span>
          ))}
        </div>
      </div>

      {/* Hearts, butterflies and petals streaming outward */}
      <div className="absolute inset-0 flex items-center justify-center">
        {hearts.map((f, i) => (
          <span
            key={`bh-${i}`}
            className="absolute text-glow-rose"
            style={{
              ["--fx" as string]: `${f.dx}vmax`,
              ["--fy" as string]: `${f.dy}vmax`,
              ["--fr" as string]: `${f.rot}deg`,
              ["--fs" as string]: f.scale,
              filter: "drop-shadow(0 0 14px oklch(0.75 0.192 355 / 95%))",
              animation: `enter-fly ${f.dur}ms cubic-bezier(.12,.7,.25,1) ${f.delay}ms both`,
            }}
          >
            <HeartGlyph size={f.size} />
          </span>
        ))}

        {petals.map((f, i) => (
          <span
            key={`bp-${i}`}
            className="absolute"
            style={{
              color: f.gold ? "oklch(0.9 0.11 60)" : "oklch(0.82 0.18 354)",
              ["--fx" as string]: `${f.dx}vmax`,
              ["--fy" as string]: `${f.dy}vmax`,
              ["--fr" as string]: `${f.rot * 2}deg`,
              ["--fs" as string]: f.scale * 0.9,
              filter: "drop-shadow(0 0 8px oklch(0.8 0.168 352 / 70%))",
              animation: `enter-fly ${f.dur + 500}ms cubic-bezier(.2,.6,.3,1) ${f.delay + 250}ms both`,
            }}
          >
            <Petal size={f.size * 0.7} />
          </span>
        ))}

        {butterflies.map((f, i) => (
          <span
            key={`bb-${i}`}
            className="absolute"
            style={{
              ["--fx" as string]: `${f.dx}vmax`,
              ["--fy" as string]: `${f.dy}vmax`,
              ["--fr" as string]: "0deg",
              ["--fs" as string]: f.scale,
              animation: `enter-fly ${f.dur + 400}ms cubic-bezier(.12,.72,.25,1) ${f.delay + 120}ms both`,
            }}
          >
            {/* Ribbon of light left behind */}
            <span
              className="absolute left-1/2 top-1/2 block h-[3px] w-32 origin-center rounded-full"
              style={{
                background: f.gold
                  ? "linear-gradient(90deg, transparent, oklch(0.9 0.12 88 / 85%))"
                  : "linear-gradient(90deg, transparent, oklch(0.85 0.156 350 / 85%))",
                filter: "blur(2px)",
                transform: `rotate(${f.angle}deg) translateX(-52%)`,
                animation: "enter-trail 1400ms ease-out both",
              }}
            />
            <span
              className={`relative block ${f.gold ? "text-glow-gold" : "text-glow-moon"}`}
              style={{
                filter: "drop-shadow(0 0 16px oklch(0.92 0.11 86 / 90%))",
                animation: `enter-tumble ${f.dur}ms ease-in-out both`,
              }}
            >
              <Butterfly size={f.size + 12} />
            </span>
          </span>
        ))}
      </div>

      {/* Sparkles catching the light all over the screen */}
      {glints.map((g, i) => (
        <span
          key={`gl-${i}`}
          className={`absolute ${g.gold ? "text-glow-gold" : "text-glow-moon"}`}
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            filter: "drop-shadow(0 0 12px currentColor)",
            animation: `enter-glint 1300ms ease-in-out ${g.delay}ms both`,
          }}
        >
          <Glint size={g.s} />
        </span>
      ))}

      {/* Final kiss of light as the veil lifts */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.99 0.02 90) 0%, oklch(0.95 0.06 350 / 70%) 45%, transparent 80%)",
          animation: `enter-flash 900ms ease-out 950ms both`,
        }}
      />
    </div>
  );
}
