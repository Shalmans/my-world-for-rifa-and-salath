import { useEffect, useState } from "react";
import { finale, letter, person } from "@/content/story";
import { Butterfly, HeartGlyph } from "./Atmosphere";
import { PanelClose } from "./SceneNav";

type Stage = "message" | "name" | "greeting" | "reveal" | "letter";

export function Finale({ onReplay, onCelebrate }: { onReplay: () => void; onCelebrate?: () => void }) {
  const [stage, setStage] = useState<Stage>("message");
  const [letterOpen, setLetterOpen] = useState(false);
  const [opening, setOpening] = useState(false);

  const openLetter = () => {
    setOpening(true);
    setTimeout(() => {
      setOpening(false);
      setLetterOpen(true);
    }, 1900);
  };

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage("name"), 6000),
      setTimeout(() => setStage("greeting"), 9500),
      setTimeout(() => {
        setStage("reveal");
        onCelebrate?.();
      }, 13000),
      setTimeout(() => setStage("letter"), 19000),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealed = stage === "reveal" || stage === "letter";

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center">
      {revealed && <Celebration />}

      <p
        className="max-w-xl whitespace-pre-line font-display text-2xl leading-relaxed text-foreground/90 text-glow sm:text-3xl"
        style={{ animation: "fade-in 2.5s ease-out both" }}
      >
        {finale.message}
      </p>

      {stage !== "message" && (
        <h2
          className="mt-10 font-display text-3xl tracking-[0.35em] text-glow-gold text-gold-glow sm:text-5xl"
          style={{ animation: "fade-in 1.8s ease-out both" }}
        >
          {finale.name}
        </h2>
      )}

      {(stage === "greeting" || revealed) && (
        <p
          className="mt-5 font-hand text-3xl text-glow-rose sm:text-5xl"
          style={{ animation: "scale-in 1.2s ease-out both", filter: "drop-shadow(0 0 24px oklch(0.72 0.192 355 / 45%))" }}
        >
          {finale.greeting}
        </p>
      )}

      {revealed && (
        <p
          className="mt-10 font-display text-4xl tracking-[0.3em] text-foreground text-glow sm:text-6xl"
          style={{ animation: "scale-in 1.4s ease-out both" }}
        >
          {person.birthdayDisplay}
        </p>
      )}

      {stage === "letter" && (
        <div className="mt-12 flex flex-col items-center gap-4" style={{ animation: "fade-in 1s ease-out both" }}>
          <p className="font-hand text-2xl text-foreground/80">{letter.teaser}</p>
          <button
            type="button"
            onClick={openLetter}
            className="rounded-full px-9 py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 active:scale-95"
            style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}
          >
            {letter.cta} {"\u{1F48C}"}
          </button>
          <p className="text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">
            {letter.footer}
          </p>
          <button
            type="button"
            onClick={onReplay}
            className="rounded-full border border-border/60 px-7 py-3 text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {letter.replay}
          </button>
        </div>
      )}

      {opening && <LetterPortal />}

      {letterOpen && <LetterModal onClose={() => setLetterOpen(false)} onReplay={onReplay} />}
    </div>
  );
}

/** Magical full-screen glowing header shown while the letter world opens. */
function LetterPortal() {
  return (
    <div
      className="fixed inset-0 z-70 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        background: "radial-gradient(circle at 50% 45%, oklch(0.3 0.1 348 / 96%), oklch(0.07 0.03 351 / 98%) 70%)",
        animation: "fade-in 0.5s ease-out both",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-52 -translate-y-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, oklch(0.86 0.13 84 / 45%), transparent)",
          filter: "blur(30px)",
          animation: "glow-pulse 1.8s ease-in-out infinite",
        }}
      />
      {[0, 1, 2].map((r) => (
        <span
          key={r}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            borderColor: r % 2 ? "oklch(0.86 0.13 84 / 55%)" : "oklch(0.72 0.192 355 / 55%)",
            animation: `burst-ring 2s ease-out ${r * 0.35}s infinite`,
          }}
        />
      ))}

      <p
        className="relative text-[0.6rem] uppercase tracking-[0.6em] text-glow-gold text-gold-glow"
        style={{ animation: "fade-in 0.8s ease-out both" }}
      >
        opening
      </p>
      <h2
        className="relative mt-5 font-display text-4xl leading-tight text-foreground sm:text-6xl"
        style={{
          animation: "rise-fade 1.6s ease-out both",
          textShadow: "0 0 34px oklch(0.86 0.13 84 / 70%), 0 0 70px oklch(0.72 0.192 355 / 55%)",
        }}
      >
        My Letter World
      </h2>
      <span
        className="relative mt-7 inline-block text-glow-rose animate-heartbeat"
        style={{ filter: "drop-shadow(0 0 26px currentColor)" }}
      >
        <HeartGlyph size={34} />
      </span>
    </div>
  );
}

function LetterModal({ onClose, onReplay }: { onClose: () => void; onReplay: () => void }) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-night-deep/90 px-4 py-10 backdrop-blur-md"
      style={{ animation: "fade-in 0.4s ease-out both" }}
    >
      <div
        className="relative w-full max-w-md rounded-lg px-7 py-9 text-left"
        style={{
          animation: "scale-in 0.6s ease-out both",
          background: "linear-gradient(160deg, oklch(0.96 0.02 88), oklch(0.9 0.04 80))",
          boxShadow: "var(--shadow-gold), var(--shadow-float)",
        }}
      >
        <div className="absolute inset-2 rounded-md border border-night-deep/10" />
        {/* On the cream letter a glass pill would vanish, so this one is inked. */}
        <PanelClose onClick={onClose} tone="dark" />
        <p className="relative text-center font-hand text-3xl text-night-deep">{letter.heading}</p>
        <div className="relative mt-6 space-y-4">
          {letter.body.map((p, i) => (
            <p key={i} className="font-hand text-xl leading-relaxed text-night-deep/85">
              {p}
            </p>
          ))}
        </div>
        <p className="relative mt-8 text-right font-hand text-2xl text-night-deep/80">
          {letter.signature}
        </p>
        <p className="relative mt-6 text-center text-[0.55rem] uppercase tracking-[0.3em] text-night-deep/50">
          {letter.footer}
        </p>
        <div className="relative mt-8 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-night-deep/20 py-3 text-[0.65rem] uppercase tracking-[0.3em] text-night-deep/70"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="w-full rounded-full py-3 text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground"
            style={{ background: "var(--gradient-rose)" }}
          >
            {letter.replay}
          </button>
        </div>
      </div>
    </div>
  );
}

function Celebration() {
  const items = Array.from({ length: 90 }, (_, i) => {
    const a = (i / 90) * Math.PI * 2 + (i % 3);
    const d = 180 + ((i * 53) % 420);
    return { a, d, i };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(0.96 0.03 90 / 70%), transparent 70%)",
          animation: "scale-out 2.4s ease-out both",
        }}
      />
      {items.map(({ a, d, i }) => (
        <span
          key={i}
          className={i % 3 === 0 ? "text-glow-gold" : i % 3 === 1 ? "text-glow-rose" : "text-glow-magenta"}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) rotate(${i * 13}deg)`,
            transition: "transform 3s cubic-bezier(.15,.75,.3,1)",
            animation: `fade-out ${2.5 + (i % 5) * 0.5}s ease-out ${(i % 7) * 0.12}s both`,
            filter: "drop-shadow(0 0 10px currentColor)",
          }}
        >
          {i % 4 === 0 ? (
            <HeartGlyph size={12 + (i % 4) * 3} />
          ) : i % 4 === 1 ? (
            <span className="block h-1.5 w-1.5 rounded-full bg-current" />
          ) : (
            <Butterfly size={14 + (i % 5) * 3} />
          )}
        </span>
      ))}
    </div>
  );
}
