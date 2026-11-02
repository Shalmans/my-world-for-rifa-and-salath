import { useCallback, useEffect, useRef, useState } from "react";
import { secretDoor, secretPin } from "@/content/story";
import { logDoorAttempt } from "@/lib/door.functions";
import { readVisitorId } from "@/hooks/use-visit-tracker";
import { Butterfly } from "./Atmosphere";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

/**
 * Write one attempt into the door log, so /admin can show who tried and when.
 * Fire-and-forget: nobody standing at the keypad should ever wait on this, and
 * a failed log must not surface as an error.
 */
function reportAttempt(success: boolean, entered: string, attemptNo: number) {
  try {
    void logDoorAttempt({
      data: {
        success,
        entered,
        attemptNo,
        visitorId: readVisitorId(),
        screen: `${window.screen.width}×${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
        language: navigator.language ?? null,
      },
    }).catch(() => {
      /* ignore */
    });
  } catch {
    /* ignore */
  }
}

export function SecretDoor({
  onUnlock,
  onClose,
  onSound,
}: {
  onUnlock: () => void;
  onClose: () => void;
  onSound?: () => void;
}) {
  const [stage, setStage] = useState<"door" | "pin">("door");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [burst, setBurst] = useState(false);
  /** Wrong tries so far — past a few, the message stops being sweet about it. */
  const [wrongTries, setWrongTries] = useState(0);
  /** Every attempt this sitting, right or wrong, so the log can number them. */
  const attemptNo = useRef(0);

  const submit = useCallback(
    (value: string) => {
      const opened = value === secretPin;
      attemptNo.current += 1;
      reportAttempt(opened, value, attemptNo.current);

      if (opened) {
        setBurst(true);
        onSound?.();
        setTimeout(onUnlock, 1400);
      } else {
        setError(true);
        setWrongTries((t) => t + 1);
        setTimeout(() => {
          setError(false);
          setPin("");
        }, 1400);
      }
    },
    [onSound, onUnlock],
  );

  /** Functional updates only: typed digits can arrive several per render, and reading `pin`
   *  from the closure would make each one overwrite the last. */
  const press = useCallback(
    (k: string) => {
      if (burst || error) return;
      if (k === "back") return setPin((p) => p.slice(0, -1));
      if (k === "clear") return setPin("");
      setPin((p) => (p.length >= secretPin.length ? p : p + k));
    },
    [burst, error],
  );

  // Full pin submits itself, whether the digits came from taps or the keyboard.
  useEffect(() => {
    if (burst || error || pin.length !== secretPin.length) return;
    const t = setTimeout(() => submit(pin), 220);
    return () => clearTimeout(t);
  }, [burst, error, pin, submit]);

  /** On a laptop her hands go to the keyboard first, so digits, Backspace and Escape work too. */
  useEffect(() => {
    if (stage !== "pin") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 && e.key >= "0" && e.key <= "9") press(e.key);
      else if (e.key === "Backspace") press("back");
      else if (e.key === "Escape" || e.key === "Delete") press("clear");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, stage]);

  /** At the door, Escape steps back out; inside the pin pad Escape clears instead. */
  useEffect(() => {
    if (stage !== "door") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, stage]);

  const teased = wrongTries >= secretDoor.triesBeforeTease;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-5 py-10"
      style={{ animation: "fade-in 0.5s ease-out both", background: "oklch(0.09 0.04 351 / 92%)" }}
    >
      {burst && <UnlockBurst />}

      {/* The way out is the shared back pill in the scene above — one control,
          one place, never sitting on top of the countdown badge. */}

      {stage === "door" ? (
        <div className="flex max-w-sm flex-col items-center text-center" style={{ animation: "scale-in 0.6s ease-out both" }}>
          <GlowingDoor />
          <p className="mt-8 font-display text-2xl leading-snug text-foreground text-glow sm:text-3xl">
            {secretDoor.line}
          </p>
          <button
            type="button"
            onClick={() => setStage("pin")}
            className="mt-8 rounded-full px-8 py-4 text-xs uppercase tracking-[0.35em] text-primary-foreground transition-transform duration-300 active:scale-95"
            style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}
          >
            {secretDoor.cta}
          </button>
        </div>
      ) : (
        <div className="glass w-full max-w-xs rounded-4xl p-6 text-center" style={{ animation: "scale-in 0.4s ease-out both" }}>
          <p className="font-display text-xl text-foreground">A quiet little key</p>
          <p className="mt-1 text-xs tracking-widest text-muted-foreground">enter our number</p>

          <div className={`mt-5 flex flex-wrap justify-center gap-1.5 ${error ? "animate-sway" : ""}`}>
            {Array.from({ length: secretPin.length }).map((_, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full transition-all duration-200"
                style={{
                  background: i < pin.length ? "var(--glow-rose)" : "oklch(1 0 0 / 15%)",
                  boxShadow: i < pin.length ? "0 0 12px var(--glow-rose)" : "none",
                }}
              />
            ))}
          </div>

          {/* Once the teasing message is earned it stays put, so whoever is
              guessing keeps reading it between attempts. */}
          <p
            className="mt-3 min-h-10 text-sm leading-snug text-glow-rose transition-opacity duration-300"
            style={{ opacity: error || teased ? 1 : 0 }}
          >
            {teased ? secretDoor.lockedPin : secretDoor.wrongPin}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {KEYS.map((k) => (
              <button
                key={k}
                type="button"
                aria-label={k === "back" ? "delete" : k === "clear" ? "clear" : k}
                onClick={() => press(k)}
                // Clicking must not park focus on a key, or Space/Enter would re-press it.
                onMouseDown={(e) => e.preventDefault()}
                className="glass flex h-14 items-center justify-center rounded-2xl font-display text-xl text-foreground transition-transform duration-150 active:scale-90"
              >
                {k === "back" ? "\u232B" : k === "clear" ? "\u00D7" : k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GlowingDoor() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 animate-glow-pulse rounded-full bg-glow-gold/25" />
      <div
        className="glass relative flex h-44 w-28 items-center justify-center rounded-t-full rounded-b-lg"
        style={{ boxShadow: "var(--shadow-gold)" }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" className="text-glow-gold animate-heartbeat">
          <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <rect x="4.5" y="10" width="15" height="10.5" rx="3" fill="currentColor" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

function UnlockBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 46 }).map((_, i) => {
        const a = (i / 46) * Math.PI * 2;
        const d = 140 + (i % 5) * 60;
        return (
          <span
            key={i}
            className={i % 4 === 0 ? "text-glow-gold" : "text-glow-rose"}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              animation: `fade-out 1.4s ease-out both`,
              transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`,
              transition: "transform 1.4s cubic-bezier(.16,.8,.3,1)",
              filter: "drop-shadow(0 0 10px currentColor)",
            }}
          >
            {i % 3 === 0 ? <Butterfly size={18} /> : <span className="block h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
        );
      })}
    </div>
  );
}
