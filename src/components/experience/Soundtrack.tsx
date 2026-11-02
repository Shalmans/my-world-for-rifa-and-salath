import { useEffect, useRef, useState } from "react";
import { audio as audioContent } from "@/content/story";

/** Background music level when switched on. */
const MUSIC_VOLUME = 0.4;
/** Fade length in ms, so the track never snaps in or cuts out. */
const FADE_MS = 900;

/** True when at least one real audio file is configured in src/content/story.ts. */
const hasAudio = Boolean(
  audioContent.backgroundMusic ||
  audioContent.click ||
  audioContent.unlock ||
  audioContent.celebrate,
);

/**
 * Background music + optional SFX, played from real audio files.
 * Never autoplays: sound only starts after an explicit user tap.
 */
export function useSoundtrack() {
  const [enabled, setEnabled] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);

  useEffect(() => {
    const src = audioContent.backgroundMusic;
    if (!src) return;
    const el = new Audio(src);
    el.loop = true;
    el.preload = "auto";
    el.volume = 0;
    musicRef.current = el;
    return () => {
      el.pause();
      el.removeAttribute("src");
      musicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = musicRef.current;
    if (!el) return;

    if (fadeRef.current !== null) cancelAnimationFrame(fadeRef.current);

    const from = el.volume;
    const to = enabled ? MUSIC_VOLUME : 0;
    const start = performance.now();

    if (enabled) void el.play().catch(() => undefined);

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / FADE_MS);
      el.volume = Math.min(1, Math.max(0, from + (to - from) * p));
      if (p < 1) {
        fadeRef.current = requestAnimationFrame(step);
        return;
      }
      fadeRef.current = null;
      // Pause only once the fade has fully landed, otherwise the cut is audible.
      if (!enabled) el.pause();
    };
    fadeRef.current = requestAnimationFrame(step);

    return () => {
      if (fadeRef.current !== null) cancelAnimationFrame(fadeRef.current);
      fadeRef.current = null;
    };
  }, [enabled]);

  /** One-shot sound effects, played from files only. */
  const play = (src: string | null, volume = 0.5) => {
    if (!enabled || !src) return;
    const sfx = new Audio(src);
    sfx.volume = volume;
    void sfx.play().catch(() => undefined);
  };

  return {
    enabled,
    /** False when no audio files are configured — used to hide the toggle. */
    available: hasAudio,
    toggle: () => setEnabled((v) => !v),
    /** Called after an explicit tap (e.g. "Enter my little world") — never autoplay. */
    enable: () => setEnabled(true),
    playClick: () => play(audioContent.click, 0.35),
    playUnlock: () => play(audioContent.unlock, 0.5),
    playCelebrate: () => play(audioContent.celebrate, 0.5),
  };
}

export function MusicToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className="glass fixed right-3 top-3 z-50 flex items-center gap-2 rounded-full px-3.5 py-2.5 text-xs tracking-widest text-foreground/85 transition-all duration-300 hover:text-foreground active:scale-95 sm:right-5 sm:top-5 sm:text-[0.7rem]"
    >
      <span aria-hidden="true" className={enabled ? "animate-heartbeat" : "opacity-60"}>
        {enabled ? "\u{1F50A}" : "\u{1F507}"}
      </span>
      <span className="uppercase">{enabled ? "Music On" : "Music Off"}</span>
    </button>
  );
}
