import { useEffect, useState } from "react";
import type { Chapter } from "@/content/story";
import { PhotoFrame, PhotoLightbox, usePhotoLightbox } from "./PhotoFrame";
import { Butterfly, HeartGlyph } from "./Atmosphere";
import { Discoveries } from "./Discoveries";
import { ChapterQuestionGate } from "./ChapterQuestion";

export function StoryChapter({
  chapter,
  index,
  total,
  onNext,
  onBack,
}: {
  chapter: Chapter;
  index: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
}) {
  const lightbox = usePhotoLightbox();
  const gated = Boolean(chapter.question?.enabled ?? Boolean(chapter.question));
  const [passed, setPassed] = useState(!gated);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setPassed(!(chapter.question?.enabled ?? Boolean(chapter.question)));
    setRevealed(false);
  }, [chapter.id, chapter.question]);

  useEffect(() => {
    if (!passed || !chapter.revealWord) return;
    const id = setTimeout(() => setRevealed(true), 900 + chapter.lines.length * 1900);
    return () => clearTimeout(id);
  }, [passed, chapter.id, chapter.revealWord, chapter.lines.length]);

  if (chapter.question && !passed) {
    return <ChapterQuestionGate question={chapter.question} onPass={() => setPassed(true)} />;
  }

  return (
    <div
      key={chapter.id}
      className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-5 py-20 text-center"
      style={{ animation: "fade-in 0.8s ease-out both" }}
    >
      <p className="text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
        Chapter {index + 1} of {total}
      </p>

      {chapter.eyebrow && (
        <p className="mt-4 font-display text-base tracking-[0.35em] text-glow-gold text-gold-glow">
          {chapter.eyebrow}
        </p>
      )}

      <h2 className="mt-2 font-display text-4xl leading-tight text-foreground text-glow sm:text-6xl">
        {chapter.title}
      </h2>

      <SceneVisual kind={chapter.kind} />

      <div className="mt-8 space-y-5">
        {chapter.lines.map((line, i) => (
          <p
            key={line}
            className="mx-auto max-w-xl whitespace-pre-line font-display text-xl leading-relaxed text-foreground/90 sm:text-2xl"
            style={{ animation: `fade-in 1.2s ease-out ${0.8 + i * 1.9}s both` }}
          >
            {line}
          </p>
        ))}
      </div>

      {chapter.revealWord && revealed && (
        <p
          className="mt-10 font-display text-4xl tracking-[0.3em] text-glow-rose sm:text-6xl"
          style={{
            animation: "scale-in 1.6s ease-out both",
            filter: "drop-shadow(0 0 30px oklch(0.72 0.192 355 / 55%))",
          }}
        >
          {chapter.revealWord}
        </p>
      )}

      {chapter.memoryQuote && (
        <div
          className="glass relative mt-10 max-w-xs rounded-3xl px-6 py-5"
          style={{ animation: "scale-in 1s ease-out 2.4s both", boxShadow: "var(--shadow-glow)" }}
        >
          <span className="absolute -left-3 -top-3 text-glow-rose animate-heartbeat">
            <HeartGlyph size={18} />
          </span>
          <p className="font-hand text-2xl text-foreground">"{chapter.memoryQuote}"</p>
        </div>
      )}

      {chapter.photos.length > 0 && (
        <div className="mt-10 flex w-screen snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:w-full sm:justify-center sm:overflow-visible">
          {chapter.photos.map((p, i) => (
            <PhotoFrame key={p.caption} photo={p} index={i} onOpen={() => lightbox.open(p)} />
          ))}
        </div>
      )}

      <div className="mt-12 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-border/70 px-6 py-3.5 text-[0.65rem] uppercase tracking-[0.3em] text-foreground/85 transition-colors hover:border-glow-rose/60 hover:text-foreground"
        >
          {"←"} Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full px-8 py-3.5 text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 active:scale-95"
          style={{ background: "var(--gradient-rose)", boxShadow: "var(--shadow-glow)" }}
        >
          {index === total - 1 ? "Continue" : "Next"}
        </button>
      </div>

      {chapter.discoveries && chapter.discoveries.length > 0 && (
        <Discoveries items={chapter.discoveries} />
      )}

      {lightbox.photo && <PhotoLightbox photo={lightbox.photo} onClose={lightbox.close} />}
    </div>
  );
}

function SceneVisual({ kind }: { kind: Chapter["kind"] }) {
  if (kind === "hotel") {
    return (
      <div className="relative mt-8 h-32 w-full max-w-md">
        <div className="absolute inset-0 flex items-end justify-center gap-1.5 opacity-80">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="w-4 rounded-t-sm"
              style={{
                height: `${30 + ((i * 37) % 70)}%`,
                background: "linear-gradient(180deg, oklch(0.3 0.08 356 / 80%), oklch(0.14 0.05 351))",
                boxShadow: "inset 0 6px 18px oklch(0.86 0.13 84 / 25%)",
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-16 animate-glow-pulse"
          style={{ background: "radial-gradient(60% 100% at 50% 100%, oklch(0.86 0.13 84 / 35%), transparent 70%)" }}
        />
      </div>
    );
  }

  if (kind === "apart" || kind === "friends") {
    const apart = kind === "apart";
    return (
      <svg viewBox="0 0 300 120" className="mt-8 w-full max-w-md">
        <defs>
          <linearGradient id="p1" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.192 355 / 0)" />
            <stop offset="100%" stopColor="oklch(0.72 0.192 355)" />
          </linearGradient>
          <linearGradient id="p2" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.13 84 / 0)" />
            <stop offset="100%" stopColor="oklch(0.86 0.13 84)" />
          </linearGradient>
        </defs>
        <path
          d={apart ? "M10 60 C 90 60, 150 60, 290 14" : "M10 14 C 120 20, 190 58, 290 60"}
          stroke="url(#p1)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="600"
          strokeDashoffset="600"
          style={{ animation: "none" }}
        >
          <animate attributeName="stroke-dashoffset" from="600" to="0" dur="3s" fill="freeze" />
        </path>
        <path
          d={apart ? "M10 60 C 90 60, 150 60, 290 106" : "M10 106 C 120 100, 190 62, 290 60"}
          stroke="url(#p2)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="600"
          strokeDashoffset="600"
        >
          <animate attributeName="stroke-dashoffset" from="600" to="0" dur="3s" fill="freeze" />
        </path>
        <circle cx="290" cy="60" r="4" fill="oklch(0.96 0.03 90)" opacity={apart ? 0 : 1}>
          {!apart && <animate attributeName="r" values="3;7;3" dur="2.4s" repeatCount="indefinite" />}
        </circle>
      </svg>
    );
  }

  if (kind === "love") {
    return (
      <div className="relative mt-8 flex h-32 items-center justify-center">
        <div className="absolute h-28 w-28 animate-glow-pulse rounded-full bg-glow-rose/40" />
        <span className="relative text-glow-rose animate-heartbeat" style={{ filter: "drop-shadow(0 0 24px currentColor)" }}>
          <HeartGlyph size={82} />
        </span>
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-glow-gold/80"
            style={{
              transform: `rotate(${i * 45}deg) translateX(90px)`,
              animation: `fade-in 1s ease-out ${0.4 + i * 0.12}s both`,
            }}
          >
            <Butterfly size={16} />
          </span>
        ))}
      </div>
    );
  }

  // future — glowing road to the horizon
  return (
    <div className="relative mt-8 h-36 w-full max-w-md overflow-hidden">
      <div
        className="absolute bottom-0 left-1/2 h-36 w-full -translate-x-1/2"
        style={{
          clipPath: "polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)",
          background: "linear-gradient(180deg, oklch(0.86 0.13 84 / 45%), oklch(0.72 0.192 355 / 10%))",
        }}
      />
      <div
        className="absolute left-1/2 top-0 h-12 w-12 -translate-x-1/2 animate-glow-pulse rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.96 0.03 90 / 80%), transparent 70%)" }}
      />
      <svg viewBox="0 0 60 60" className="absolute left-1/2 top-3 h-10 w-10 -translate-x-1/2 text-glow-gold">
        <circle cx="30" cy="34" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.9" />
        <path d="M30 8 l4 8 -8 0 z" fill="currentColor" />
      </svg>
    </div>
  );
}
