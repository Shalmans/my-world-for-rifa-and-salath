import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveSubmission } from "@/lib/answers.functions";
import {
  questionnaireDone,
  questionnaireEnd,
  questionnaireIntro,
  questions,
} from "@/content/questions";
import { person } from "@/content/story";
import { Butterfly, HeartGlyph } from "./Atmosphere";
import { NameShowcase } from "./NameShowcase";

const DRAFT_KEY = "rifa-questionnaire-draft";
const DONE_KEY = "rifa-questionnaire-sent";

export function Questionnaire({ onContinue }: { onContinue: () => void }) {
  const send = useServerFn(saveSubmission);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  // Restore any draft / previous submission so nothing is ever lost.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setAnswers(JSON.parse(raw) as Record<string, string>);
      if (localStorage.getItem(DONE_KEY)) setStatus("done");
    } catch {
      /* ignore */
    }
  }, []);

  const update = (id: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const submit = async () => {
    if (submitting.current || status === "saving" || status === "done") return;
    submitting.current = true;
    setError(null);
    setStatus("saving");

    const payload: Record<string, string> = {};
    for (const q of questions) payload[q.id] = (answers[q.id] ?? "").trim();

    let ok = false;
    try {
      const res = await send({ data: { name: person.name, answers: payload } });
      ok = res.ok;
    } catch {
      ok = false;
    }

    submitting.current = false;

    if (!ok) {
      setStatus("error");
      setError("Something went wrong sending it. Your answers are safe \u2014 please try again.");
      return;
    }

    try {
      localStorage.setItem(DONE_KEY, new Date().toISOString());
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-24 text-center">
        <p className="text-[0.62rem] uppercase tracking-[0.45em] text-glow-gold text-gold-glow">
          {questionnaireDone.eyebrow}
        </p>
        <p
          className="mt-8 font-display text-2xl leading-relaxed text-foreground/95 sm:text-3xl"
          style={{ animation: "fade-in 1.2s ease-out both" }}
        >
          {questionnaireDone.thanks}
        </p>
        <div className="mt-8 space-y-2">
          {questionnaireDone.lines.map((line, i) => (
            <p
              key={line}
              className="font-hand text-2xl text-foreground/85"
              style={{ animation: `fade-in 1.2s ease-out ${0.6 + i * 0.6}s both` }}
            >
              {line}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="mt-12 rounded-full px-9 py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 active:scale-95"
          style={{ background: "var(--gradient-rose)", boxShadow: "var(--shadow-glow)" }}
        >
          {questionnaireDone.cta} {"\u2192"}
        </button>
      </section>
    );
  }

  const q = questions[step]!;
  const value = answers[q.id] ?? "";
  const last = step === questions.length - 1;

  const next = () => {
    if (!value.trim()) {
      setError("A little answer first \u2014 write whatever comes to your heart \u2764\uFE0F");
      return;
    }
    setError(null);
    if (last) void submit();
    else setStep((s) => s + 1);
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-20">
      <div className="text-center">
        <p className="text-[0.62rem] uppercase tracking-[0.45em] text-glow-gold text-gold-glow">
          {questionnaireIntro.eyebrow}
        </p>

        <div className="mt-9">
          <NameShowcase />
        </div>

        <h2 className="mt-10 font-display text-3xl leading-tight text-foreground text-glow sm:text-4xl">
          {"♥"} {questionnaireIntro.title}
        </h2>
        <p className="mt-6 text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground">
          {questionnaireIntro.count}
        </p>
        <p className="mt-3 font-hand text-2xl text-foreground/80">{questionnaireIntro.hint}</p>
      </div>

      {/* Progress */}
      <div className="mx-auto mt-12 flex w-full max-w-sm items-center gap-3">
        <span className="text-[0.6rem] tracking-[0.35em] text-muted-foreground">
          {String(step + 1).padStart(2, "0")}
        </span>
        <span className="relative h-px flex-1 bg-border/60">
          <span
            className="absolute inset-y-0 left-0 block h-px transition-all duration-500"
            style={{
              width: `${((step + 1) / questions.length) * 100}%`,
              background: "var(--gradient-rose)",
            }}
          />
        </span>
        <span className="text-[0.6rem] tracking-[0.35em] text-muted-foreground">
          {questions.length}
        </span>
      </div>

      <div key={q.id} className="py-12" style={{ animation: "fade-in 0.7s ease-out both" }}>
        <p className="text-[0.6rem] uppercase tracking-[0.42em] text-glow-rose/90">
          {String(step + 1).padStart(2, "0")} {"\u2014"} {q.label}
        </p>
        <h3 className="mt-4 font-display text-2xl leading-snug text-foreground/95 sm:text-3xl">
          {q.text}
        </h3>
        <textarea
          id={q.id}
          value={value}
          onChange={(e) => update(q.id, e.target.value)}
          rows={5}
          placeholder={"Write from your heart\u2026"}
          className="glass mt-7 w-full resize-y rounded-3xl border border-border/50 bg-transparent px-5 py-4 text-base leading-relaxed text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-primary/60"
          style={{ minHeight: "9rem" }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-glow)")}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
        />
      </div>

      <div className="flex flex-col items-center text-center">
        {last && (
          <>
            <p className="text-[0.62rem] uppercase tracking-[0.45em] text-glow-gold text-gold-glow">
              {questionnaireEnd.eyebrow}
            </p>
            <p className="mt-4 font-hand text-2xl text-foreground/85">{questionnaireEnd.hint}</p>
          </>
        )}

        {error && <p className="mt-6 max-w-sm text-sm text-glow-rose">{error}</p>}

        <div className="mt-8 flex items-center gap-4">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep((s) => s - 1);
              }}
              className="rounded-full border border-border/60 px-6 py-4 text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {"\u2190"} Back
            </button>
          )}
          <button
            type="button"
            onClick={next}
            disabled={status === "saving"}
            className="rounded-full px-9 py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 active:scale-95 disabled:opacity-60"
            style={{ background: "var(--gradient-rose)", boxShadow: "var(--shadow-glow)" }}
          >
            {status === "saving"
              ? "Sending\u2026"
              : last
                ? questionnaireEnd.cta
                : `Next \u2192`}
          </button>
        </div>

        <span className="mt-10 flex items-center gap-3 text-glow-rose/80">
          <Butterfly size={16} />
          <HeartGlyph size={14} />
          <Butterfly size={16} />
        </span>
      </div>
    </section>
  );
}
