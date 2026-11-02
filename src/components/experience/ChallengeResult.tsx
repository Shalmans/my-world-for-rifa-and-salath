import { useEffect, useState } from "react";
import { challengeOutro, challengeResult } from "@/content/story";
import { Butterfly, HeartGlyph } from "./Atmosphere";

/** One answered challenge, as remembered by the game. */
export type ChallengeResultRow = {
  label: string;
  answer: string;
  /** She got it right on her very first attempt. */
  firstTry: boolean;
};

type Phase = "sealing" | "score" | "recap" | "gift";

const ORDER: Phase[] = ["sealing", "score", "recap", "gift"];
const reached = (phase: Phase, at: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(at);

/**
 * The little world that opens once the last challenge is answered:
 * her answers are sealed, her heart score blooms, every answer is
 * read back to her, and a gift waits to be unwrapped.
 */
export function ChallengeResult({
  rows,
  onFinish,
  onClose,
  onSound,
}: {
  rows: ChallengeResultRow[];
  onFinish: () => void;
  onClose: () => void;
  onSound?: (() => void) | undefined;
}) {
  const [phase, setPhase] = useState<Phase>("sealing");
  const total = rows.length;
  const score = rows.filter((r) => r.firstTry).length;

  // Gently walk her through sealing → score → recap → gift.
  useEffect(() => {
    const recapAt = 4600;
    const timers = [
      setTimeout(() => setPhase("score"), 2400),
      setTimeout(() => setPhase("recap"), recapAt),
      setTimeout(() => setPhase("gift"), recapAt + 900 + total * 320),
    ];
    return () => timers.forEach(clearTimeout);
  }, [total]);

  const tier =
    challengeResult.tiers.find((t) => score >= t.min) ??
    challengeResult.tiers[challengeResult.tiers.length - 1]!;

  return (
    <div
      className="glass relative w-full overflow-hidden rounded-4xl px-6 py-10 text-center"
      style={{ animation: "scale-in 0.8s ease-out both", boxShadow: "var(--shadow-glow)" }}
    >
      {phase === "sealing" ? (
        <Sealing />
      ) : (
        <>
          <p className="text-[0.55rem] uppercase tracking-[0.4em] text-muted-foreground">
            {challengeResult.score.eyebrow}
          </p>

          <ScoreRing score={score} total={total} />

          <p className="mt-7 text-[0.55rem] uppercase tracking-[0.35em] text-glow-gold text-gold-glow">
            {challengeResult.score.unit}
          </p>
          <h2
            className="mt-4 font-display text-3xl leading-tight text-glow-rose sm:text-4xl"
            style={{
              animation: "scale-in 1.1s ease-out 0.3s both",
              filter: "drop-shadow(0 0 24px oklch(0.72 0.192 355 / 50%))",
            }}
          >
            {tier.title}
          </h2>
          <p
            className="mx-auto mt-4 max-w-sm font-display text-lg leading-relaxed text-foreground/90"
            style={{ animation: "fade-in 1.2s ease-out 0.9s both" }}
          >
            {tier.line}
          </p>
        </>
      )}

      {reached(phase, "recap") && <Recap rows={rows} />}

      {reached(phase, "gift") && (
        <Gift score={score} total={total} onFinish={onFinish} onClose={onClose} onSound={onSound} />
      )}
    </div>
  );
}

/** Her answers being tucked away, with rings of light closing around them. */
function Sealing() {
  return (
    <div
      className="flex flex-col items-center py-8"
      style={{ animation: "fade-in 0.6s ease-out both" }}
    >
      <span className="relative flex h-32 w-32 items-center justify-center">
        {[0, 1, 2].map((r) => (
          <span
            key={r}
            aria-hidden
            className="absolute h-28 w-28 rounded-full border"
            style={{
              borderColor: r % 2 ? "oklch(0.86 0.13 84 / 55%)" : "oklch(0.72 0.192 355 / 55%)",
              animation: `burst-ring 2.2s ease-out ${r * 0.4}s infinite`,
            }}
          />
        ))}
        <span
          className="text-glow-rose animate-heartbeat"
          style={{ filter: "drop-shadow(0 0 26px currentColor)" }}
        >
          <HeartGlyph size={44} />
        </span>
      </span>

      <p className="mt-8 text-[0.55rem] uppercase tracking-[0.4em] text-glow-gold text-gold-glow">
        {challengeResult.sealing.eyebrow}
      </p>
      <p className="mt-3 font-hand text-2xl text-foreground/85">{challengeResult.sealing.line}</p>
    </div>
  );
}

/** A glowing ring that fills as her score counts up. */
function ScoreRing({ score, total }: { score: number; total: number }) {
  const [shown, setShown] = useState(0);

  // Count her hearts up one by one instead of snapping to the number.
  useEffect(() => {
    if (score === 0) return undefined;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setShown(current);
      if (current >= score) clearInterval(id);
    }, 260);
    return () => clearInterval(id);
  }, [score]);

  const R = 54;
  const C = 2 * Math.PI * R;
  const fraction = total > 0 ? shown / total : 0;

  return (
    <div
      className="relative mx-auto mt-5 h-40 w-40"
      style={{ animation: "scale-in 0.9s ease-out both" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-glow-pulse rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.192 355 / 26%), transparent 70%)",
          filter: "blur(14px)",
        }}
      />
      <svg viewBox="0 0 128 128" className="absolute inset-0 h-full w-full -rotate-90">
        <defs>
          <linearGradient id="scoreArc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.13 84)" />
            <stop offset="100%" stopColor="oklch(0.72 0.192 355)" />
          </linearGradient>
        </defs>
        <circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          stroke="oklch(0.6 0.02 335 / 22%)"
          strokeWidth="3"
        />
        <circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          stroke="url(#scoreArc)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fraction)}
          style={{
            transition: "stroke-dashoffset 0.7s ease-out",
            filter: "drop-shadow(0 0 8px oklch(0.72 0.192 355 / 70%))",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p
          key={shown}
          className="font-display text-5xl leading-none text-foreground text-glow"
          style={{ animation: "scale-in 0.5s ease-out both" }}
        >
          {shown}
          <span className="text-2xl text-muted-foreground">/{total}</span>
        </p>
        <span
          className="mt-1 text-glow-rose animate-heartbeat"
          style={{ filter: "drop-shadow(0 0 12px currentColor)" }}
        >
          <HeartGlyph size={16} />
        </span>
      </div>
    </div>
  );
}

/** Every answer she just gave, read back to her one line at a time. */
function Recap({ rows }: { rows: ChallengeResultRow[] }) {
  return (
    <div className="mt-10" style={{ animation: "fade-in 0.9s ease-out both" }}>
      <span
        aria-hidden
        className="mx-auto mb-7 block h-px w-32 opacity-70"
        style={{ background: "var(--gradient-rose)" }}
      />
      <p className="text-[0.55rem] uppercase tracking-[0.4em] text-glow-gold text-gold-glow">
        {challengeResult.recap.eyebrow}
      </p>

      <ul className="mt-6 space-y-3 text-left">
        {rows.map((row, i) => (
          <li
            key={row.label}
            className="rounded-3xl border border-border/50 px-5 py-4"
            style={{
              animation: `rise-fade 0.8s ease-out ${0.2 + i * 0.32}s both`,
              background: "oklch(0.2 0.04 356 / 35%)",
            }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[0.5rem] uppercase tracking-[0.3em] text-muted-foreground">
                {row.label}
              </p>
              <p
                className={`shrink-0 text-[0.5rem] uppercase tracking-[0.2em] ${
                  row.firstTry ? "text-glow-gold" : "text-glow-rose/80"
                }`}
              >
                {row.firstTry ? challengeResult.recap.firstTry : challengeResult.recap.gotThere}
              </p>
            </div>
            <p className="mt-1.5 font-hand text-2xl leading-snug text-foreground/90">
              {row.answer}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The last little gift — tapped, unwrapped, and then the surprise opens. */
function Gift({
  score,
  total,
  onFinish,
  onClose,
  onSound,
}: {
  score: number;
  total: number;
  onFinish: () => void;
  onClose: () => void;
  onSound?: (() => void) | undefined;
}) {
  const [state, setState] = useState<"closed" | "opening" | "open">("closed");

  useEffect(() => {
    if (state !== "opening") return undefined;
    const id = setTimeout(() => setState("open"), 1400);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <div className="mt-10" style={{ animation: "fade-in 0.9s ease-out both" }}>
      <span
        aria-hidden
        className="mx-auto mb-7 block h-px w-32 opacity-70"
        style={{ background: "var(--gradient-gold)" }}
      />

      {state !== "open" ? (
        <>
          <p className="text-[0.55rem] uppercase tracking-[0.4em] text-glow-gold text-gold-glow">
            {challengeResult.gift.eyebrow}
          </p>
          <button
            type="button"
            disabled={state === "opening"}
            onClick={() => {
              onSound?.();
              setState("opening");
            }}
            aria-label={challengeResult.gift.hint}
            className="relative mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full transition-transform duration-300 active:scale-95"
            style={{
              background: "radial-gradient(circle, oklch(0.86 0.13 84 / 26%), transparent 70%)",
              boxShadow: "var(--shadow-gold)",
            }}
          >
            {/* The halo breathes, never the button — the gift stays easy to tap. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, oklch(0.86 0.13 84 / 45%), transparent 70%)",
                animation: `glow-pulse ${state === "opening" ? "0.8s" : "2.8s"} ease-in-out infinite`,
              }}
            />
            <span
              className={state === "opening" ? "animate-heartbeat" : "animate-sway"}
              style={{
                fontSize: "3.4rem",
                filter: "drop-shadow(0 0 22px oklch(0.86 0.13 84 / 70%))",
              }}
            >
              {"\u{1F381}"}
            </span>
          </button>
          <p className="mt-5 font-hand text-2xl text-foreground/80">
            {state === "opening" ? challengeResult.gift.opening : challengeResult.gift.hint}
          </p>
          {state === "opening" && <GiftBurst />}
        </>
      ) : (
        <div style={{ animation: "scale-in 0.9s ease-out both" }}>
          <GiftBurst />
          <h2
            className="mt-6 font-display text-4xl text-glow-rose sm:text-5xl"
            style={{
              animation: "scale-in 1.2s ease-out both",
              filter: "drop-shadow(0 0 26px oklch(0.72 0.192 355 / 55%))",
            }}
          >
            {challengeOutro.title}
          </h2>
          {challengeOutro.lines.map((l, i) => (
            <p
              key={l}
              className="mt-4 font-display text-lg text-foreground/90"
              style={{ animation: `fade-in 1s ease-out ${0.5 + i * 0.6}s both` }}
            >
              {l}
            </p>
          ))}
          {score === total && (
            <p
              className="mt-5 font-hand text-2xl text-glow-gold"
              style={{ animation: "fade-in 1s ease-out 1.6s both" }}
            >
              A perfect heart score, Papu ❤️
            </p>
          )}
          <button
            type="button"
            onClick={onFinish}
            className="mt-9 w-full rounded-full py-4 text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 active:scale-95"
            style={{
              background: "var(--gradient-rose)",
              boxShadow: "var(--shadow-glow)",
              animation: "fade-in 1s ease-out 2s both",
            }}
          >
            {challengeOutro.cta}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-full py-2.5 text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {challengeOutro.back}
          </button>
        </div>
      )}
    </div>
  );
}

/** Butterflies and hearts spilling out of the gift. */
function GiftBurst() {
  return (
    <span aria-hidden className="relative flex h-16 items-center justify-center">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={i % 2 ? "absolute text-glow-gold/80" : "absolute text-glow-rose/80"}
          style={{
            transform: `rotate(${i * 40}deg) translateX(72px)`,
            animation: `fade-in 1s ease-out ${0.2 + i * 0.08}s both`,
          }}
        >
          {i % 3 === 0 ? <HeartGlyph size={14} /> : <Butterfly size={15} />}
        </span>
      ))}
      <span
        className="text-glow-rose animate-heartbeat"
        style={{ filter: "drop-shadow(0 0 22px currentColor)" }}
      >
        <HeartGlyph size={30} />
      </span>
    </span>
  );
}
