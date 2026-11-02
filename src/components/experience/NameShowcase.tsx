import { useEffect, useState } from "react";
import { nameShowcaseHeading, nameVariants } from "@/content/names";

const HOLD_MS = 1000; // time a name stays fully visible
const FADE_MS = 300; // crossfade duration

/**
 * A single rotating rendering of her name — one script at a time, soft crossfade.
 * Respects prefers-reduced-motion (plain opacity, no drift or blur) and pauses
 * while the tab is hidden so nothing burns cycles in the background.
 */
export function NameShowcase() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setCalm(mq.matches);
    const onChange = () => setCalm(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let fade: ReturnType<typeof setTimeout>;

    const tick = setInterval(() => {
      if (document.hidden) return;
      setVisible(false);
      fade = setTimeout(() => {
        setIndex((i) => (i + 1) % nameVariants.length);
        setVisible(true);
      }, FADE_MS);
    }, HOLD_MS + FADE_MS);

    return () => {
      clearInterval(tick);
      clearTimeout(fade);
    };
  }, []);

  const variant = nameVariants[index]!;

  return (
    <div className="flex flex-col items-center">
      <p className="text-[0.7rem] uppercase tracking-[0.42em] text-glow-gold text-gold-glow sm:text-xs">
        {nameShowcaseHeading}
      </p>

      {/* Fixed height keeps the sentence below from ever shifting. */}
      <div className="relative mt-6 flex h-[5.5rem] w-full items-center justify-center sm:h-[7rem] md:h-[8rem]">
        <span
          lang={variant.lang}
          dir={variant.rtl ? "rtl" : "ltr"}
          aria-hidden="true"
          className="name-script block max-w-full px-2 text-center text-5xl leading-[1.3] text-foreground text-glow sm:text-6xl md:text-7xl"
          style={{
            opacity: visible ? 1 : 0,
            transform: calm ? "none" : `translateY(${visible ? "0" : "0.5rem"})`,
            filter: calm ? "none" : `blur(${visible ? "0px" : "6px"})`,
            transition: calm
              ? `opacity ${FADE_MS}ms ease-in-out`
              : `opacity ${FADE_MS}ms ease-in-out, transform ${FADE_MS}ms ease-out, filter ${FADE_MS}ms ease-out`,
          }}
        >
          {variant.value}
        </span>
      </div>

      <span
        aria-hidden="true"
        className="mt-2 block text-[0.62rem] uppercase tracking-[0.35em] text-muted-foreground/85 sm:text-[0.68rem]"
        style={{
          opacity: visible ? 0.85 : 0,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
        }}
      >
        {variant.label}
      </span>

      {/* One stable, screen-reader-friendly announcement instead of 35 noisy ones. */}
      <span
        className="sr-only"
        role="img"
        aria-label="Rifa — her name written in 35 languages and scripts"
      >
        Rifa
      </span>
    </div>
  );
}
