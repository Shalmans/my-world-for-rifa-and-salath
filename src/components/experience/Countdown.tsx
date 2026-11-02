import { useEffect, useState } from "react";
import { person } from "@/content/story";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    done: ms === 0,
  };
}

function useTick() {
  const target = new Date(person.birthday).getTime();
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);
  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ className = "" }: { className?: string }) {
  const t = useTick();

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <p className="font-display text-lg tracking-[0.45em] text-glow-gold/90 text-gold-glow sm:text-xl">
        {person.birthdayDisplay}
      </p>

      <div className="min-h-16">
        {t && t.done && (
          <p
            className="font-hand text-3xl text-glow-rose sm:text-4xl"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.72 0.192 355 / 50%))" }}
          >
            Today is My Girl Day {"\u2764"}
          </p>
        )}

        {t && !t.done && (
          <div className="flex items-start gap-2.5 sm:gap-4">
            {(
              [
                ["Days", t.days],
                ["Hours", t.hours],
                ["Minutes", t.minutes],
                ["Seconds", t.seconds],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="glass min-w-14 rounded-2xl px-2.5 py-2.5 sm:min-w-18 sm:px-3.5">
                <p className="font-display text-2xl leading-none text-foreground text-glow sm:text-3xl">
                  {label === "Days" ? value : pad(value)}
                </p>
                <p className="mt-1.5 text-[0.5rem] uppercase tracking-[0.25em] text-muted-foreground sm:text-[0.55rem]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Tiny live badge shown while she explores the world. */
export function CountdownBadge() {
  const t = useTick();
  if (!t) return null;

  return (
    <div className="glass pointer-events-none fixed left-3 top-3 z-50 rounded-full px-3 py-2 text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground sm:left-5 sm:top-5 sm:text-[0.62rem]">
      <span className="text-glow-gold/90">{person.birthdayShort}</span>
      <span className="mx-1.5 opacity-40">·</span>
      {t.done ? (
        <span className="text-glow-rose">Today {"\u2764"}</span>
      ) : (
        <span>{`${t.days}d ${pad(t.hours)}h ${pad(t.minutes)}m`}</span>
      )}
    </div>
  );
}
