import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  finale as finaleContent,
  intro,
  memoryCards,
  world,
  type MemoryCardData,
} from "@/content/story";
import { Atmosphere, Butterfly } from "@/components/experience/Atmosphere";
import { Countdown, CountdownBadge } from "@/components/experience/Countdown";
import { MemoryCard } from "@/components/experience/MemoryCard";
import { Challenges } from "@/components/experience/Challenges";
import { Finale } from "@/components/experience/Finale";
import { MusicToggle, useSoundtrack } from "@/components/experience/Soundtrack";
import { BirthdayCake } from "@/components/experience/BirthdayCake";
import { Questionnaire } from "@/components/experience/Questionnaire";
import { EnterBurst } from "@/components/experience/EnterBurst";
import { SecretDoor } from "@/components/experience/SecretDoor";
import { OurWorldGallery } from "@/components/experience/OurWorldGallery";
import { PanelClose, SceneBack } from "@/components/experience/SceneNav";
import { useVisitTracker } from "@/hooks/use-visit-tracker";
import coupleNight from "@/assets/couple-night.jpg";

const title = "A Little World for Rifa";
const description =
  "A cinematic, interactive memory world — glowing butterflies, hidden chapters and a story written only for Rifa.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Experience,
});

/** Stop expensive background animation work while the tab is in the background. */
function usePauseWhenHidden() {
  useEffect(() => {
    const sync = () => {
      document.documentElement.dataset["hidden"] = document.hidden ? "true" : "false";
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
}

type Scene = "intro" | "world" | "challenges" | "finale";

function Experience() {
  usePauseWhenHidden();
  useVisitTracker();
  const [scene, setScene] = useState<Scene>("intro");
  const [openCard, setOpenCard] = useState<MemoryCardData | null>(null);
  /** Secret card waiting behind the PIN door; it opens as a normal card once unlocked. */
  const [doorCard, setDoorCard] = useState<MemoryCardData | null>(null);
  /** Heart-and-butterfly bloom that carries her from the intro into the world. */
  const [entering, setEntering] = useState(false);
  const sound = useSoundtrack();

  const go = (next: Scene) => {
    sound.playClick();
    setScene(next);
  };

  /**
   * Where the back pill leads from each scene. "intro" is the beginning, and the
   * challenges keep their own control so leaving early still saves her answers.
   */
  const backTargets: Partial<Record<Scene, { label: string; onClick: () => void }>> = {
    world: { label: "Start", onClick: () => go("intro") },
    finale: { label: "Her world", onClick: () => go("world") },
  };
  const back = doorCard
    ? { label: "Her world", onClick: () => setDoorCard(null) }
    : backTargets[scene];

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden">
      <Atmosphere
        intensity={scene === "finale" ? 1.6 : scene === "intro" ? 0.8 : 1}
        moon={scene === "intro"}
        flowers={scene === "intro" || scene === "world"}
        warm={scene === "finale"}
      />
      {sound.available && <MusicToggle enabled={sound.enabled} onToggle={sound.toggle} />}
      {scene !== "intro" && <CountdownBadge />}

      {scene === "intro" && (
        <Intro
          onEnter={() => {
            if (entering) return;
            sound.enable();
            sound.playClick();
            setEntering(true);
          }}
        />
      )}

      {entering && (
        <EnterBurst onCover={() => setScene("world")} onDone={() => setEntering(false)} />
      )}

      {/* The same visible back control on every scene, so she is never stuck.
          Hidden while the entering burst plays over the screen. */}
      {back && !entering && <SceneBack label={back.label} onClick={back.onClick} />}

      {scene === "world" && (
        <World
          onOpenCard={(card) => {
            sound.playClick();
            if (card.challenge) setScene("challenges");
            else if (card.secret) setDoorCard(card);
            else setOpenCard(card);
          }}
          onContinue={() => {
            sound.playClick();
            setScene("finale");
          }}
        />
      )}

      {scene === "challenges" && (
        <Challenges
          onSound={sound.playUnlock}
          onClose={() => go("world")}
          onFinish={() => {
            sound.playCelebrate();
            setScene("finale");
          }}
        />
      )}

      {scene === "finale" && (
        <Finale
          onCelebrate={sound.playCelebrate}
          onReplay={() => go("world")}
        />
      )}

      {doorCard && (
        <SecretDoor
          onSound={sound.playUnlock}
          onClose={() => setDoorCard(null)}
          onUnlock={() => {
            setOpenCard(doorCard);
            setDoorCard(null);
          }}
        />
      )}

      {openCard &&
        (openCard.gallery ? (
          <OurWorldGallery onClose={() => setOpenCard(null)} />
        ) : (
          <CardModal card={openCard} onClose={() => setOpenCard(null)} />
        ))}
    </main>
  );
}

function Intro({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span
        className="text-glow-rose"
        style={{ animation: "fade-in 1.6s ease-out both", filter: "drop-shadow(0 0 16px currentColor)" }}
      >
        <Butterfly size={38} />
      </span>

      <div className="relative mt-8 flex max-w-2xl flex-col items-center">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-8 -inset-y-10 rounded-[3rem]"
          style={{
            background: "radial-gradient(60% 70% at 50% 50%, oklch(0.12 0.05 351 / 78%), transparent 75%)",
            filter: "blur(14px)",
          }}
        />

        <h1
          className="relative max-w-2xl font-display text-4xl leading-tight text-foreground text-glow sm:text-6xl"
          style={{
            animation: "fade-in 2s ease-out 0.4s both",
            textShadow: "0 3px 26px oklch(0.08 0.03 351 / 95%)",
          }}
        >
          {intro.line1}
        </h1>

        <p
          className="relative mt-6 max-w-md text-lg font-semibold leading-relaxed text-foreground sm:text-xl"
          style={{
            animation: "fade-in 2s ease-out 2.2s both",
            textShadow: "0 2px 20px oklch(0.08 0.03 351 / 98%)",
          }}
        >
          {intro.line2}
        </p>
      </div>



      <button
        type="button"
        onClick={onEnter}
        className="mt-12 rounded-full px-9 py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground transition-transform duration-300 hover:scale-[1.03] active:scale-95"
        style={{
          background: "var(--gradient-rose)",
          boxShadow: "var(--shadow-glow)",
          animation: "scale-in 1s ease-out 3.4s both",
        }}
      >
        {intro.cta} {"\u2192"}
      </button>

      <div style={{ animation: "fade-in 2s ease-out 4.4s both" }} className="mt-16">
        <Countdown />
      </div>
    </section>
  );
}

function World({
  onOpenCard,
  onContinue,
}: {
  onOpenCard: (card: MemoryCardData) => void;
  onContinue: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center px-5 py-24">
      <h1
        className="text-center font-display text-4xl text-foreground text-glow sm:text-5xl"
        style={{ animation: "fade-in 1s ease-out both" }}
      >
        {world.title} <span className="text-glow-rose">{"\u2764"}</span>
      </h1>
      <p
        className="mt-3 max-w-md text-center text-base text-foreground/85 sm:text-lg"
        style={{ animation: "fade-in 1.2s ease-out 0.3s both" }}
      >
        {world.subtitle}
      </p>

      {/* The cake is the heart of this screen. */}
      <BirthdayCake />

      {/* Existing birthday message — reused, never duplicated. */}
      <ClosingQuote />

      {/* One continuous ribbon of memories, gently offset left and right. */}
      <div className="mt-24 w-full space-y-16">
        {memoryCards.map((card, i) => (
          <div
            key={card.id}
            className="mx-auto w-full max-w-sm"
            style={{ transform: `translateX(${i % 2 === 0 ? "-" : ""}0px)` }}
          >
            <MemoryCard card={card} index={i} onOpen={() => onOpenCard(card)} />
          </div>
        ))}
      </div>

      <div className="mt-20" style={{ animation: "fade-in 1.4s ease-out 0.8s both" }}>
        <Countdown />
      </div>

      <span
        aria-hidden
        className="mx-auto mt-20 block h-px w-40 opacity-70"
        style={{ background: "var(--gradient-rose)" }}
      />

      {/* 13 questions, then softly back to her world. */}
      <Questionnaire onContinue={onContinue} />

      {/* Private keeper of every answer (password protected). */}
      <a
        href="/admin"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/50 px-5 py-2.5 text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
      >
        🔐 Admin
      </a>
    </section>
  );
}

/** Gently glowing closing words at the bottom of the memory world. */
function ClosingQuote() {
  return (
    <div className="relative mt-20 w-full max-w-lg px-2 text-center">
      <span
        aria-hidden
        className="mx-auto mb-8 block h-px w-40 opacity-70"
        style={{ background: "var(--gradient-rose)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-40 w-64 animate-glow-pulse rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.192 355 / 22%), transparent 70%)", filter: "blur(18px)" }}
      />
      {finaleContent.message.split("\n").map((line, i) => (
        <p
          key={line}
          className="relative font-display text-xl leading-relaxed text-foreground/95 text-glow sm:text-2xl"
          style={{
            animation: `fade-in 1.6s ease-out ${1 + i * 0.5}s both`,
            textShadow: "0 2px 22px oklch(0.1 0.04 351 / 90%)",
          }}
        >
          {line}
        </p>
      ))}
      <span
        className="mt-6 inline-block text-glow-rose animate-heartbeat"
        style={{ filter: "drop-shadow(0 0 18px currentColor)" }}
      >
        <Butterfly size={22} />
      </span>
    </div>
  );
}

function CardModal({ card, onClose }: { card: MemoryCardData; onClose: () => void }) {
  const long = Boolean(card.body?.length);

  // Esc closes it, and the world behind stops scrolling while it is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-night-deep/90 px-4 py-8 backdrop-blur-md sm:px-6"
      style={{ animation: "fade-in 0.3s ease-out both" }}
      onClick={onClose}
    >
      <div
        className={`glass relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-4xl ${long ? "max-w-2xl" : "max-w-sm"}`}
        style={{
          animation: "scale-in 0.4s ease-out both",
          boxShadow: "var(--shadow-float), var(--shadow-glow)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Always reachable, even before she scrolls a long memory. */}
        <PanelClose onClick={onClose} />

        {/* A soft rose light resting on the top edge. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-70"
          style={{
            background:
              "radial-gradient(70% 100% at 50% 0%, oklch(0.72 0.192 355 / 22%), transparent 75%)",
          }}
        />

        <header className="relative shrink-0 px-7 pt-9 text-center sm:px-12 sm:pt-11">
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
            {card.subtitle}
          </p>
          <h3 className="mt-3 font-display text-3xl leading-tight text-foreground text-glow sm:text-4xl">
            {card.title}
          </h3>
          <p className="mt-4 font-hand text-2xl leading-snug text-glow-gold/90">{card.note}</p>
          <span
            aria-hidden
            className="mx-auto mt-7 block h-px w-24 opacity-70"
            style={{ background: "var(--gradient-rose)" }}
          />
        </header>

        <div className="soft-scroll relative flex-1 overflow-y-auto overscroll-contain px-7 py-8 text-center sm:px-12">
          {card.body && card.body.length > 0 && (
            <div className="mx-auto max-w-prose space-y-6">
              {card.body.map((para, i) => (
                <p
                  key={i}
                  className="whitespace-pre-line font-display text-[1.0625rem] leading-8 text-foreground/85 sm:text-lg sm:leading-9"
                  style={{ animation: `fade-in 0.9s ease-out ${0.25 + i * 0.1}s both` }}
                >
                  {para}
                </p>
              ))}
            </div>
          )}

          {card.photo && (
            <figure className={card.body?.length ? "mt-10" : ""}>
              <div
                className="overflow-hidden rounded-3xl border border-border/50"
                style={{ boxShadow: "var(--shadow-float)" }}
              >
                <img
                  src={card.photo.src ?? coupleNight}
                  alt={card.photo.caption}
                  loading="lazy"
                  className="aspect-4/3 w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 font-hand text-xl text-muted-foreground">
                {card.photo.caption}
              </figcaption>
            </figure>
          )}
        </div>

        <footer
          className="relative shrink-0 px-7 pb-8 pt-2 sm:px-12"
          style={{ background: "linear-gradient(0deg, oklch(0.14 0.05 351 / 92%), transparent)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-border/70 py-3.5 text-[0.65rem] uppercase tracking-[0.3em] text-foreground/85 transition-colors hover:border-glow-rose/60 hover:text-foreground"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
