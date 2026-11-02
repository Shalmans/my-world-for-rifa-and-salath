import { useEffect, useState } from "react";
import { person } from "@/content/story";
import { Butterfly, HeartGlyph } from "./Atmosphere";

/**
 * The big animated birthday cake. Tap the candles to blow them out:
 * flames go out, the cake glows, fireworks + hearts + petals fall.
 */
export function BirthdayCake({ onBlow }: { onBlow?: () => void }) {
  const [blown, setBlown] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [bigMoment, setBigMoment] = useState(false);

  useEffect(() => {
    if (!blown) return;
    const a = setTimeout(() => setCelebrate(true), 350);
    const b = setTimeout(() => setBigMoment(true), 350);
    const c = setTimeout(() => setBigMoment(false), 2600);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, [blown]);

  const blow = () => {
    if (blown) return;
    setBlown(true);
    onBlow?.();
  };


  return (
    <section className="relative flex w-full flex-col items-center px-4 py-6 text-center">
      <p className="text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground">
        {blown ? "the wish is on its way" : "Make a wish\u2026"}
      </p>

      <div className="relative mt-8 w-full max-w-md">
        {/* soft light behind the cake */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-72 w-72 animate-glow-pulse rounded-full"
          style={{
            background: blown
              ? "radial-gradient(circle, oklch(0.86 0.13 84 / 45%), transparent 70%)"
              : "radial-gradient(circle, oklch(0.86 0.13 84 / 26%), transparent 70%)",
            filter: "blur(22px)",
          }}
        />

        <button
          type="button"
          onClick={blow}
          aria-label={blown ? "Candles are out" : "Blow out the candles"}
          className="relative mx-auto block w-full max-w-sm cursor-pointer select-none transition-transform duration-500 active:scale-[0.98]"
        >
          <svg viewBox="0 0 320 300" className="w-full drop-shadow-2xl">
            <defs>
              <linearGradient id="cakeTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.94 0.05 355)" />
                <stop offset="100%" stopColor="oklch(0.78 0.156 355)" />
              </linearGradient>
              <linearGradient id="cakeMid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.144 341)" />
                <stop offset="100%" stopColor="oklch(0.32 0.09 356)" />
              </linearGradient>
              <linearGradient id="cakeBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.46 0.132 336)" />
                <stop offset="100%" stopColor="oklch(0.24 0.07 352)" />
              </linearGradient>
              <linearGradient id="plate" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="oklch(0.86 0.13 84 / 20%)" />
                <stop offset="50%" stopColor="oklch(0.86 0.13 84 / 70%)" />
                <stop offset="100%" stopColor="oklch(0.86 0.13 84 / 20%)" />
              </linearGradient>
            </defs>

            {/* candles */}
            {[100, 130, 160, 190, 220].map((x, i) => (
              <g key={x}>
                <rect x={x - 4} y={72} width="8" height="34" rx="3" fill="oklch(0.94 0.05 355)" />
                <rect x={x - 4} y={72} width="4" height="34" rx="2" fill="oklch(0.72 0.192 355 / 60%)" />
                {!blown ? (
                  <g style={{ transformOrigin: `${x}px 70px`, animation: `flicker 1.${2 + i}s ease-in-out infinite` }}>
                    <ellipse cx={x} cy={62} rx="8" ry="13" fill="oklch(0.86 0.13 84 / 45%)" />
                    <ellipse cx={x} cy={64} rx="4.5" ry="9" fill="oklch(0.96 0.09 90)" />
                    <ellipse cx={x} cy={66} rx="2" ry="4.5" fill="oklch(1 0.02 90)" />
                  </g>
                ) : (
                  <g style={{ animation: "drift-up 2.6s ease-out both" }}>
                    <ellipse cx={x} cy={58} rx="4" ry="8" fill="oklch(0.8 0.02 341 / 35%)" />
                  </g>
                )}
              </g>
            ))}

            {/* tiers */}
            <rect x="86" y="104" width="148" height="46" rx="12" fill="url(#cakeTop)" />
            <rect x="66" y="146" width="188" height="56" rx="14" fill="url(#cakeMid)" />
            <rect x="46" y="198" width="228" height="62" rx="16" fill="url(#cakeBase)" />

            {/* frosting drips */}
            {[92, 116, 140, 164, 188, 212].map((x) => (
              <circle key={`d1-${x}`} cx={x} cy={150} r="9" fill="oklch(0.94 0.05 355)" opacity="0.9" />
            ))}
            {[72, 100, 128, 156, 184, 212, 240].map((x) => (
              <circle key={`d2-${x}`} cx={x} cy={202} r="10" fill="oklch(0.62 0.168 345)" opacity="0.85" />
            ))}

            {/* little hearts on the cake */}
            {[110, 160, 210].map((x) => (
              <path
                key={`h-${x}`}
                d={`M${x} 232 c -6 -8 -16 -4 -16 4 c 0 8 10 12 16 18 c 6 -6 16 -10 16 -18 c 0 -8 -10 -12 -16 -4 z`}
                fill="oklch(0.86 0.13 84 / 85%)"
              />
            ))}

            <rect x="26" y="260" width="268" height="9" rx="4.5" fill="url(#plate)" />
          </svg>

          {!blown && (
            <span className="mt-5 block">
              <span
                className="mx-auto block w-fit rounded-full border px-6 py-2.5 text-[0.9rem] font-semibold uppercase tracking-[0.3em] sm:text-[1rem]"
                style={{
                  color: "oklch(0.96 0.09 90)",
                  borderColor: "oklch(0.86 0.13 84 / 70%)",
                  background: "oklch(0.16 0.05 356 / 88%)",
                  textShadow: "0 1px 10px oklch(0.1 0.03 351 / 95%)",
                  animation: "tap-pulse 1.9s ease-in-out infinite",
                }}
              >
                ✨ Tap the cake ✨
              </span>
              <span className="mx-auto mt-3 block max-w-xs text-[0.85rem] leading-relaxed text-foreground/85">
                Tap the candles to blow them out and make your wish
              </span>
            </span>
          )}
        </button>

        {/* sparkles around the cake */}
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="pointer-events-none absolute h-1 w-1 rounded-full bg-glow-gold"
            style={{
              left: `${6 + ((i * 37) % 88)}%`,
              top: `${8 + ((i * 53) % 78)}%`,
              opacity: 0.7,
              animation: `twinkle ${2 + (i % 4) * 0.7}s ease-in-out ${i * 0.21}s infinite`,
            }}
          />
        ))}
      </div>

      {celebrate && <Celebration />}
      {bigMoment && <BirthdayMoment />}

      {celebrate && (
        <div className="relative mt-10">
          <h2
            className="font-display text-4xl leading-tight text-foreground text-glow sm:text-6xl"
            style={{ animation: "scale-in 1.4s ease-out both", textShadow: "0 3px 26px oklch(0.08 0.03 351 / 95%)" }}
          >
            Happy Birthday, {person.name.split(" ")[0]}{" "}
            <span className="text-glow-rose animate-heartbeat inline-block align-middle">
              <HeartGlyph size={26} />
            </span>
          </h2>
        </div>
      )}
    </section>
  );
}

/** Full-screen birthday moment shown for ~2 seconds right after the wish. */
function BirthdayMoment() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, oklch(0.24 0.09 352 / 92%), oklch(0.08 0.03 351 / 96%) 70%)",
        animation: "fade-in 0.4s ease-out both",
      }}
    >
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(0.96 0.06 90 / 85%), transparent 70%)",
          animation: "flash-out 0.9s ease-out both",
        }}
      />
      {[0, 1, 2].map((r) => (
        <span
          key={r}
          className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            borderColor: r % 2 ? "oklch(0.86 0.13 84 / 70%)" : "oklch(0.72 0.192 355 / 70%)",
            animation: `burst-ring 1.6s ease-out ${r * 0.3}s both`,
          }}
        />
      ))}
      <Fireworks count={7} />
      <Confetti count={60} />

      <p
        className="relative font-display text-5xl leading-tight text-foreground text-glow sm:text-7xl"
        style={{ animation: "rise-fade 1.4s ease-out both", textShadow: "0 4px 40px oklch(0.72 0.192 355 / 60%)" }}
      >
        Happy Birthday
      </p>
      <p
        className="relative mt-4 font-hand text-4xl text-glow-rose sm:text-6xl"
        style={{ animation: "scale-in 1.2s ease-out 0.4s both", filter: "drop-shadow(0 0 26px currentColor)" }}
      >
        {person.name.split(" ")[0]} {"\u2764"}
      </p>
    </div>
  );
}

/** Big cracker bursts spread across the screen. */
function Fireworks({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, b) => (
        <span
          key={`fw-${b}`}
          className="pointer-events-none absolute"
          style={{ left: `${8 + b * 13}%`, top: `${12 + ((b * 17) % 46)}%` }}
        >
          <span
            className="absolute block h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                b % 2
                  ? "radial-gradient(circle, oklch(0.86 0.13 84 / 55%), transparent 70%)"
                  : "radial-gradient(circle, oklch(0.72 0.192 355 / 55%), transparent 70%)",
              animation: `burst-ring 1.8s ease-out ${b * 0.28}s infinite`,
            }}
          />
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="absolute block" style={{ transform: `rotate(${i * 20}deg)` }}>
              <span
                className="block h-2 w-2 rounded-full"
                style={{
                  background: i % 3 === 0 ? "oklch(0.96 0.09 90)" : b % 2 ? "oklch(0.86 0.13 84)" : "oklch(0.72 0.192 355)",
                  animation: `firework 1.9s cubic-bezier(.12,.75,.3,1) ${b * 0.28 + 0.05}s infinite`,
                  boxShadow: "0 0 16px currentColor, 0 0 32px currentColor",
                }}
              />
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

function Confetti({ count }: { count: number }) {
  const colors = ["oklch(0.86 0.13 84)", "oklch(0.72 0.192 355)", "oklch(0.96 0.09 90)", "oklch(0.66 0.192 341)"];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={`cf-${i}`}
          className="pointer-events-none absolute block"
          style={{
            left: `${(i * 37) % 100}%`,
            top: "-8%",
            width: i % 3 === 0 ? 5 : 7,
            height: i % 3 === 0 ? 10 : 5,
            borderRadius: 2,
            background: colors[i % colors.length],
            boxShadow: "0 0 10px currentColor",
            animation: `confetti-fall ${3.2 + (i % 6) * 0.7}s linear ${(i % 9) * 0.16}s infinite`,
          }}
        />
      ))}
    </>
  );
}

/** Fireworks + hearts + gently falling petals, purely decorative. */
function Celebration() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <Fireworks count={6} />
      <Confetti count={40} />

      {/* hearts + petals */}
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={`p-${i}`}
          className={i % 3 === 0 ? "absolute text-glow-rose" : "absolute text-glow-gold/80"}
          style={{
            left: `${(i * 41) % 96}%`,
            top: "-6%",
            animation: `petal-fall ${7 + (i % 5) * 1.6}s linear ${i * 0.4}s infinite`,
          }}
        >
          {i % 3 === 0 ? <HeartGlyph size={12 + (i % 3) * 4} /> : <Butterfly size={13} />}
        </span>
      ))}
    </div>
  );
}

