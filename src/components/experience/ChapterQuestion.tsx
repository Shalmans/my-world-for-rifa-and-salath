import { useState } from "react";
import type { ChapterQuestion } from "@/content/story";

/** A soft, optional little question shown before a chapter opens. */
export function ChapterQuestionGate({
  question,
  onPass,
}: {
  question: ChapterQuestion;
  onPass: () => void;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "wrong" | "right">("idle");

  const check = () => {
    const v = value.trim().toLowerCase();
    if (!v) return;
    // Any answer is accepted.
    setState("right");
    setTimeout(onPass, 1500);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <div
        className="glass w-full rounded-4xl px-6 py-9"
        style={{ animation: "scale-in 0.6s ease-out both", boxShadow: "var(--shadow-glow)" }}
      >
        <p className="text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">a small question</p>
        <p className="mt-4 font-display text-2xl leading-snug text-foreground text-glow sm:text-3xl">
          {question.prompt}
        </p>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          disabled={state === "right"}
          placeholder="type your answer"
          className={`mt-7 w-full rounded-full border bg-transparent px-5 py-3.5 text-center text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 ${
            state === "wrong" ? "animate-sway border-glow-rose/70" : "border-border/60 focus:border-glow-gold/60"
          }`}
        />

        <p
          className={`mt-4 min-h-6 font-hand text-xl transition-opacity duration-300 ${
            state === "right" ? "text-glow-gold" : "text-glow-rose"
          }`}
          style={{ opacity: state === "idle" ? 0 : 1 }}
        >
          {state === "right" ? question.correct : question.wrong}
        </p>

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={check}
            disabled={state === "right"}
            className="w-full rounded-full py-3.5 text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 active:scale-95"
            style={{ background: "var(--gradient-rose)", boxShadow: "var(--shadow-glow)" }}
          >
            Answer
          </button>
          <button
            type="button"
            onClick={onPass}
            className="w-full rounded-full border border-border/70 py-3 text-[0.6rem] uppercase tracking-[0.3em] text-foreground/85 transition-colors hover:border-glow-rose/60 hover:text-foreground"
          >
            Skip for now {"→"}
          </button>
        </div>
      </div>
    </div>
  );
}
