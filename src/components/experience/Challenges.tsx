import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveSubmission } from "@/lib/answers.functions";
import {
  challengeIntro,
  challengeResult,
  challengeSkip,
  challenges,
  person,
  type ChallengeStep,
} from "@/content/story";
import { Butterfly, HeartGlyph } from "./Atmosphere";
import { ChallengeResult, type ChallengeResultRow } from "./ChallengeResult";
import { SceneBack } from "./SceneNav";

/**
 * "Our Little Challenges" — a separate, PIN-free mini experience.
 * All copy/answers live in src/content/story.ts.
 */
export function Challenges({
  onFinish,
  onClose,
  onSound,
}: {
  onFinish: () => void;
  onClose: () => void;
  onSound?: (() => void) | undefined;
}) {
  const send = useServerFn(saveSubmission);
  const [stage, setStage] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);

  const answers = useRef<Record<string, string>>({});
  /** First-try correctness per challenge index, mirrored for the saved summary. */
  const firstTry = useRef<Record<number, boolean>>({});
  const saved = useRef(false);
  /** Her answers plus whether she got each one on the very first try. */
  const [rows, setRows] = useState<Record<number, ChallengeResultRow>>({});

  const step = challenges[index];

  /**
   * Remember every answer she gives, keyed by the challenge number.
   * `correct` is only used the first time she answers a challenge — that is
   * what the heart score at the end is built from.
   */
  const record = (value: string, correct: boolean) => {
    const key = `challenge_${String(index + 1).padStart(2, "0")}`;
    answers.current[key] = value;
    if (!(index in firstTry.current)) firstTry.current[index] = correct;
    try {
      localStorage.setItem("rifa-challenge-answers", JSON.stringify(answers.current));
    } catch {
      /* ignore */
    }

    const label = step?.label ?? key;
    setRows((prev) => {
      const existing = prev[index];
      return {
        ...prev,
        [index]: existing
          ? { ...existing, answer: value }
          : { label, answer: value, firstTry: correct },
      };
    });
  };

  /**
   * Store the set so it shows up on the admin dashboard. Called when the game
   * finishes and also when she leaves early, so a half-played run is never lost
   * — but never for a run where she answered nothing at all.
   */
  const save = async () => {
    if (saved.current) return;
    if (Object.keys(answers.current).length === 0) return;
    saved.current = true;
    const payload: Record<string, string> = {};
    challenges.forEach((c, i) => {
      const key = `challenge_${String(i + 1).padStart(2, "0")}`;
      payload[key] = answers.current[key] ?? "";
    });
    // A small summary line so the dashboard shows how she did at a glance.
    const right = Object.values(firstTry.current).filter(Boolean).length;
    payload["challenge_score"] = `${right} of ${challenges.length} on the first try`;
    try {
      const res = await send({
        data: { name: `${person.name} \u2014 Our Little Challenges`, answers: payload },
      });
      // Let a real save be retried if the server couldn't store it.
      if (!res.ok) saved.current = false;
    } catch {
      saved.current = false;
    }
  };

  const next = () => {
    onSound?.();
    if (index === challenges.length - 1) {
      void save();
      setStage("done");
    } else setIndex((i) => i + 1);
  };

  return (
    <section className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-5 py-24 text-center">
      {/* Owned here rather than by the scene above, so leaving early still
          saves whatever she already answered. */}
      <SceneBack
        label="Her world"
        onClick={() => {
          void save();
          onClose();
        }}
      />

      {stage === "intro" && (
        <div className="glass w-full rounded-4xl px-6 py-10" style={{ animation: "scale-in 0.7s ease-out both", boxShadow: "var(--shadow-glow)" }}>
          <span className="mx-auto block w-fit text-glow-rose animate-heartbeat" style={{ filter: "drop-shadow(0 0 18px currentColor)" }}>
            <HeartGlyph size={34} />
          </span>
          <h2 className="mt-5 font-display text-3xl text-foreground text-glow sm:text-4xl">
            {challengeIntro.title}
          </h2>
          <p className="mx-auto mt-4 max-w-sm whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {challengeIntro.subtitle}
          </p>
          <button
            type="button"
            onClick={() => {
              onSound?.();
              setStage("play");
            }}
            className="mt-9 w-full rounded-full py-4 text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 active:scale-95"
            style={{ background: "var(--gradient-rose)", boxShadow: "var(--shadow-glow)" }}
          >
            {challengeIntro.cta} {"\u2192"}
          </button>
        </div>
      )}

      {stage === "play" && step && (
        <>
          <Progress current={index} total={challenges.length} />
          <StepView key={index} step={step} onNext={next} onSound={onSound} onAnswer={record} />
        </>
      )}

      {stage === "done" && (
        <ChallengeResult
          rows={challenges.map((_, i) => rows[i]).filter((r): r is ChallengeResultRow => Boolean(r))}
          onFinish={onFinish}
          onClose={onClose}
          onSound={onSound}
        />
      )}
    </section>
  );
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: i === current ? 26 : 10,
            background: i <= current ? "var(--gradient-rose)" : "oklch(0.6 0.02 335 / 30%)",
            boxShadow: i === current ? "var(--shadow-glow)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function Shell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="glass w-full rounded-4xl px-5 py-8 sm:px-7"
      style={{ animation: "scale-in 0.6s ease-out both", boxShadow: "var(--shadow-glow)" }}
    >
      <p className="text-[0.55rem] uppercase tracking-[0.35em] text-glow-gold text-gold-glow">{label}</p>
      {children}
      <Sparkles />
    </div>
  );
}

function Sparkles() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-glow-gold"
          style={{
            left: `${18 + i * 32}%`,
            top: `${20 + i * 24}%`,
            animation: `twinkle ${2.4 + i * 0.6}s ease-in-out ${i * 0.5}s infinite`,
            boxShadow: "0 0 10px currentColor",
          }}
        />
      ))}
    </span>
  );
}

function NextButton({ onClick, label = "Next" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-8 w-full rounded-full py-4 text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 active:scale-95"
      style={{ background: "var(--gradient-rose)", boxShadow: "var(--shadow-glow)" }}
    >
      {label} {"\u2192"}
    </button>
  );
}

/**
 * Shown only once she has answered wrong, so a forgotten memory never blocks
 * the rest of the little game. Deliberately quiet next to the main button.
 */
function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto mt-4 block text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
      style={{ animation: "fade-in 0.6s ease-out both" }}
    >
      {challengeSkip} {"→"}
    </button>
  );
}

function StepView({
  step,
  onNext,
  onSound,
  onAnswer,
}: {
  step: ChallengeStep;
  onNext: () => void;
  onSound?: (() => void) | undefined;
  onAnswer: (value: string, correct: boolean) => void;
}) {
  if (step.kind === "text") return <TextStep step={step} onNext={onNext} onSound={onSound} onAnswer={onAnswer} />;
  if (step.kind === "photo") return <PhotoStep step={step} onNext={onNext} onSound={onSound} onAnswer={onAnswer} />;
  if (step.kind === "choice") return <ChoiceStep step={step} onNext={onNext} onSound={onSound} onAnswer={onAnswer} />;
  return <FinalStep step={step} onNext={onNext} onSound={onSound} onAnswer={onAnswer} />;
}

type Text = Extract<ChallengeStep, { kind: "text" }>;
type Photo = Extract<ChallengeStep, { kind: "photo" }>;
type Choice = Extract<ChallengeStep, { kind: "choice" }>;
type Final = Extract<ChallengeStep, { kind: "final" }>;

function TextStep({ step, onNext, onSound, onAnswer }: { step: Text; onNext: () => void; onSound?: (() => void) | undefined; onAnswer: (value: string, correct: boolean) => void }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "wrong">("idle");

  const check = () => {
    // Forgiving match: lowercase, strip punctuation, collapse spaces, then
    // accept if what she typed contains any of the expected answers. This lets
    // typos, extra words and different casing/punctuation still pass.
    const norm = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
    const v = norm(value);
    if (!v) return;
    const ok = step.answers.some((a) => {
      const na = norm(a);
      return na.length > 0 && (v === na || v.includes(na));
    });
    // Any answer is accepted; `ok` only feeds the heart score.
    // Just note her answer and move on — no reveal of the expected answer.
    onAnswer(value.trim(), ok);
    onNext();
  };

  return (
    <Shell label={step.label}>
      <p className="mt-4 whitespace-pre-line font-display text-2xl leading-snug text-foreground text-glow sm:text-3xl">
        {step.question}
      </p>

      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (state === "wrong") setState("idle");
        }}
        onKeyDown={(e) => e.key === "Enter" && check()}
        placeholder="type your answer"
        className={`mt-7 w-full rounded-full border bg-transparent px-5 py-3.5 text-center text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 ${
          state === "wrong" ? "animate-sway border-glow-rose/70" : "border-border/60 focus:border-glow-gold/60"
        }`}
      />
      <p className="mt-3 min-h-7 font-hand text-xl text-glow-rose" style={{ opacity: state === "wrong" ? 1 : 0 }}>
        {step.wrong}
      </p>
      <NextButton onClick={check} label="Answer" />
      {state === "wrong" && <SkipButton onClick={onNext} />}
    </Shell>
  );
}

function PhotoStep({ step, onNext, onSound, onAnswer }: { step: Photo; onNext: () => void; onSound?: (() => void) | undefined; onAnswer: (value: string, correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const right = picked !== null;

  return (
    <Shell label={step.label}>
      <p className="mt-4 font-display text-2xl leading-snug text-foreground text-glow sm:text-3xl">{step.question}</p>

      {!right ? (
        <>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {step.options.map((o, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPicked(i);
                  onAnswer(o.caption || `option ${i + 1}`, i === step.correctIndex);
                  onSound?.();
                }}
                className={`overflow-hidden rounded-2xl border transition-transform duration-300 active:scale-95 ${
                  picked === i ? "border-glow-rose/70 animate-sway" : "border-border/60 hover:border-glow-gold/60"
                }`}
              >
                {o.src ? (
                  <img src={o.src} alt={o.caption} loading="lazy" className="aspect-4/3 w-full object-cover" />
                ) : (
                  <span className="flex aspect-4/3 w-full items-center justify-center text-[0.55rem] uppercase tracking-[0.25em] text-muted-foreground">
                    add photo
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-4 min-h-7 font-hand text-xl text-glow-rose" style={{ opacity: picked === null ? 0 : 1 }}>
            {step.wrong}
          </p>
          {picked !== null && <SkipButton onClick={onNext} />}
        </>
      ) : (
        <div style={{ animation: "fade-in 0.8s ease-out both" }}>
          <p className="mt-5 font-hand text-2xl text-glow-gold">{step.correct}</p>
          <div
            className="mt-6 overflow-hidden rounded-3xl border border-border/50"
            style={{ animation: "scale-in 1.1s ease-out both", boxShadow: "var(--shadow-glow)" }}
          >
            {step.options[step.correctIndex]?.src ? (
              <img
                src={step.options[step.correctIndex]!.src!}
                alt={step.options[step.correctIndex]!.caption}
                loading="lazy"
                className="aspect-4/3 w-full object-cover"
              />
            ) : null}
          </div>
          <p className="mt-5 font-hand text-2xl text-foreground/85">"{step.memory}"</p>
          <NextButton onClick={onNext} />
        </div>
      )}
    </Shell>
  );
}

function ChoiceStep({ step, onNext, onSound, onAnswer }: { step: Choice; onNext: () => void; onSound?: (() => void) | undefined; onAnswer: (value: string, correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const right = picked !== null;

  return (
    <Shell label={step.label}>
      <p className="mt-4 font-display text-2xl leading-snug text-foreground text-glow sm:text-3xl">{step.question}</p>

      {!right ? (
        <>
          <div className="mt-7 flex flex-col gap-3">
            {step.options.map((o, i) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  setPicked(i);
                  onAnswer(o, i === step.correctIndex);
                  onSound?.();
                }}
                className={`w-full rounded-full border py-3.5 text-[0.65rem] uppercase tracking-[0.3em] transition-colors ${
                  picked === i ? "border-glow-rose/70 text-foreground animate-sway" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          <p className="mt-4 min-h-7 font-hand text-xl text-glow-rose" style={{ opacity: picked === null ? 0 : 1 }}>
            {step.wrong}
          </p>
          {picked !== null && <SkipButton onClick={onNext} />}
        </>
      ) : (
        <div style={{ animation: "fade-in 0.8s ease-out both" }}>
          <MergingPaths />
          <p className="mt-4 font-hand text-2xl text-glow-gold">{step.correct}</p>
          <p
            className="mt-5 font-display text-4xl tracking-[0.3em] text-glow-rose sm:text-6xl"
            style={{ animation: "scale-in 1.6s ease-out 0.8s both", filter: "drop-shadow(0 0 30px oklch(0.72 0.192 355 / 55%))" }}
          >
            {step.reveal}
          </p>
          {step.revealLines.map((l, i) => (
            <p key={l} className="mt-4 font-display text-lg text-foreground/90" style={{ animation: `fade-in 1s ease-out ${1.4 + i * 0.4}s both` }}>
              {l}
            </p>
          ))}
          <NextButton onClick={onNext} />
        </div>
      )}
    </Shell>
  );
}

function MergingPaths() {
  return (
    <div className="relative">
      <svg viewBox="0 0 300 120" className="mt-6 w-full">
        <defs>
          <linearGradient id="cp1" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.192 355 / 0)" />
            <stop offset="100%" stopColor="oklch(0.72 0.192 355)" />
          </linearGradient>
          <linearGradient id="cp2" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.13 84 / 0)" />
            <stop offset="100%" stopColor="oklch(0.86 0.13 84)" />
          </linearGradient>
        </defs>
        <path d="M10 14 C 120 20, 190 58, 290 60" stroke="url(#cp1)" strokeWidth="2" fill="none" strokeDasharray="600" strokeDashoffset="600">
          <animate attributeName="stroke-dashoffset" from="600" to="0" dur="2.2s" fill="freeze" />
        </path>
        <path d="M10 106 C 120 100, 190 62, 290 60" stroke="url(#cp2)" strokeWidth="2" fill="none" strokeDasharray="600" strokeDashoffset="600">
          <animate attributeName="stroke-dashoffset" from="600" to="0" dur="2.2s" fill="freeze" />
        </path>
        <circle cx="290" cy="60" r="4" fill="oklch(0.96 0.03 90)">
          <animate attributeName="r" values="3;8;3" dur="2.4s" repeatCount="indefinite" />
        </circle>
      </svg>
      <span aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-glow-gold/80"
            style={{ left: `${10 + i * 15}%`, top: `${20 + ((i * 27) % 60)}%`, animation: `flutter ${5 + i}s ease-in-out ${i * 0.4}s infinite` }}
          >
            <Butterfly size={14} />
          </span>
        ))}
      </span>
    </div>
  );
}

function FinalStep({ step, onNext, onSound, onAnswer }: { step: Final; onNext: () => void; onSound?: (() => void) | undefined; onAnswer: (value: string, correct: boolean) => void }) {
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false);
  const holding = useRef(false);

  // The heart fills while she holds it and gently drains when she lets go.
  useEffect(() => {
    if (held) return undefined;
    const id = setInterval(() => {
      setProgress((p) => (holding.current ? Math.min(100, p + 3) : Math.max(0, p - 4)));
    }, 40);
    return () => clearInterval(id);
  }, [held]);

  /** Latch the moment it is full, so letting go can't undo it. */
  useEffect(() => {
    if (progress >= 100) setHeld(true);
  }, [progress]);

  useEffect(() => {
    if (!held) return undefined;
    onSound?.();
    onAnswer(challengeResult.recap.heldAnswer, true);
    const id = setTimeout(onNext, 1200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held]);

  return (
    <Shell label={step.label}>
      <p className="mt-4 whitespace-pre-line font-display text-2xl leading-snug text-foreground text-glow sm:text-3xl">
        {step.question}
      </p>

      <button
        type="button"
        onPointerDown={() => (holding.current = true)}
        onPointerUp={() => (holding.current = false)}
        onPointerLeave={() => (holding.current = false)}
        onPointerCancel={() => (holding.current = false)}
        className="mx-auto mt-9 flex h-36 w-36 items-center justify-center rounded-full transition-transform duration-200 active:scale-95"
        style={{
          background: `radial-gradient(circle, oklch(0.72 0.192 355 / ${0.18 + progress / 180}) 0%, transparent 70%)`,
          boxShadow: progress > 10 ? "var(--shadow-glow)" : "none",
        }}
      >
        <span
          className="text-glow-rose animate-heartbeat"
          style={{ transform: `scale(${1 + progress / 140})`, filter: `drop-shadow(0 0 ${8 + progress / 3}px currentColor)` }}
        >
          <HeartGlyph size={62} />
        </span>
      </button>

      <div className="mx-auto mt-7 h-1.5 w-40 overflow-hidden rounded-full bg-border/50">
        <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${progress}%`, background: "var(--gradient-rose)" }} />
      </div>
      <p className="mt-4 text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">{step.cta}</p>
    </Shell>
  );
}

