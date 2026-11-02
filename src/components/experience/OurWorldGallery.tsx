import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { galleryMoments, ourWorld, type GalleryMoment, type GalleryPhoto } from "@/content/story";
import { Butterfly } from "./Atmosphere";
import { PanelClose } from "./SceneNav";

/** Every photo in album order, so the lightbox can walk across moments. */
const allPhotos: GalleryPhoto[] = galleryMoments.flatMap((m) => m.photos);
const firstIndex: number[] = galleryMoments.map((_, i) =>
  galleryMoments.slice(0, i).reduce((n, m) => n + m.photos.length, 0),
);

const TILTS = [-3, 2.5, -1.5, 3.5, -2.5, 1.5];

/**
 * "Our World, Only For You" — the scrapbook album behind the PIN door.
 * A full-screen scroll of moments: polaroids, words, and a lightbox that shows
 * each photo whole, never cropped.
 */
export function OurWorldGallery({ onClose }: { onClose: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const [viewing, setViewing] = useState<number | null>(null);

  const step = useCallback((dir: 1 | -1) => {
    setViewing((i) => (i === null ? i : (i + dir + allPhotos.length) % allPhotos.length));
  }, []);

  // Esc closes the lightbox first, then the album; arrows walk the photos.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (viewing === null) {
        if (e.key === "Escape") onClose();
        return;
      }
      if (e.key === "Escape") setViewing(null);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewing, onClose, step]);

  // The world behind stops scrolling while the album is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  /** Thin rose line on top that fills as she scrolls — written straight to the DOM, no re-render. */
  const onScroll = () => {
    const el = scroller.current;
    if (!el || !progress.current) return;
    const max = el.scrollHeight - el.clientHeight;
    progress.current.style.transform = `scaleX(${max > 0 ? el.scrollTop / max : 0})`;
  };

  return (
    <div
      ref={scroller}
      onScroll={onScroll}
      className="soft-scroll fixed inset-0 z-60 overflow-y-auto overscroll-contain"
      style={{ background: "var(--gradient-night)", animation: "ow-fade 0.6s ease-out both" }}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-0.5 bg-foreground/5">
        <div
          ref={progress}
          className="h-full origin-left"
          style={{ background: "var(--gradient-gold)", transform: "scaleX(0)" }}
        />
      </div>

      <div className="fixed right-0 top-0 z-30 h-16 w-16">
        <PanelClose onClick={onClose} />
      </div>

      <Hero root={scroller} />

      {galleryMoments.map((moment, i) => (
        <div key={moment.id}>
          <HeartDivider />
          {moment.layout === "single" ? (
            <SingleMoment
              root={scroller}
              moment={moment}
              index={i}
              onOpen={() => setViewing(firstIndex[i] ?? 0)}
            />
          ) : (
            <CollageMoment
              root={scroller}
              moment={moment}
              index={i}
              onOpen={(p) => setViewing((firstIndex[i] ?? 0) + p)}
            />
          )}
        </div>
      ))}

      <HeartDivider />
      <Outro root={scroller} onClose={onClose} />

      {viewing !== null && (
        <Lightbox index={viewing} onStep={step} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

/** Fades and lifts its children in the first time they scroll into view. */
function Reveal({
  root,
  children,
  delay = 0,
  className = "",
}: {
  root: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { root: root.current, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const HEART =
  "M12 21s-7.5-4.6-9.4-9.1C1.2 8.4 3.2 5 6.6 5c2 0 3.4 1.1 4.4 2.4h2c1-1.3 2.4-2.4 4.4-2.4 3.4 0 5.4 3.4 4 6.9C19.5 16.4 12 21 12 21z";

/** The five hero polaroids, fanned in an arc: tilt, drop and size for each slot. */
const FAN = [
  { r: -16, y: "20%", s: 0.92 },
  { r: -8, y: "6%", s: 0.98 },
  { r: 0, y: "0%", s: 1.12 },
  { r: 8, y: "6%", s: 0.98 },
  { r: 16, y: "20%", s: 0.92 },
];

/** Little hearts twinkling around the hero, positioned in percent. */
const SPARKS = [
  { x: 12, y: 16, size: 12, delay: 0, gold: false },
  { x: 86, y: 12, size: 10, delay: 1.2, gold: true },
  { x: 6, y: 50, size: 9, delay: 2.1, gold: true },
  { x: 92, y: 44, size: 13, delay: 0.6, gold: false },
  { x: 20, y: 80, size: 10, delay: 1.7, gold: false },
  { x: 80, y: 84, size: 11, delay: 2.6, gold: true },
  { x: 50, y: 6, size: 8, delay: 3.1, gold: false },
];

function Hero({ root }: { root: RefObject<HTMLDivElement | null> }) {
  return (
    <header className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6">
      {/* Rose light pooled behind the photos, a warmer gold one under the title. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[30%] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full animate-glow-pulse"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.192 355 / 40%), transparent 65%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[60%] h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, oklch(0.86 0.13 84 / 22%), transparent)",
        }}
      />

      {SPARKS.map((spark, i) => (
        <svg
          key={i}
          aria-hidden
          width={spark.size}
          height={spark.size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`pointer-events-none absolute ${spark.gold ? "text-glow-gold" : "text-glow-rose"}`}
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
            animation: `twinkle 3.2s ease-in-out ${spark.delay}s infinite`,
            filter: "drop-shadow(0 0 6px currentColor)",
          }}
        >
          <path d={HEART} />
        </svg>
      ))}

      {/* Polaroids deal out from the centre into a fan, then float gently. */}
      <div className="relative mb-14 h-40 w-full max-w-xl sm:mb-20 sm:h-64">
        {FAN.map((slot, i) => {
          const src = ourWorld.heroPhotos[i];
          if (!src) return null;
          const fromCentre = Math.abs(i - 2);
          return (
            <div
              key={src}
              className="absolute left-1/2 top-0 -ml-10 w-20 sm:-ml-18 sm:w-36"
              style={
                {
                  "--i": i - 2,
                  "--r": `${slot.r}deg`,
                  "--y": slot.y,
                  "--s": slot.s,
                  zIndex: 10 - fromCentre,
                  animation: `ow-fan 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${0.2 + fromCentre * 0.15}s both`,
                } as CSSProperties
              }
            >
              <div
                className="rounded-sm bg-foreground/95 p-1.5 pb-4 shadow-[var(--shadow-float)] transition-[translate,box-shadow] duration-500 hover:-translate-y-3 hover:shadow-[var(--shadow-glow)] sm:p-2 sm:pb-6"
                style={{ animation: `ow-float 6s ease-in-out ${1.4 + i * 0.7}s infinite` }}
              >
                <img src={src} alt="" className="aspect-4/5 w-full rounded-xs object-cover" />
              </div>
            </div>
          );
        })}
        <span className="absolute -top-6 right-[6%] z-20 text-glow-rose animate-sway">
          <Butterfly size={28} />
        </span>
      </div>

      <Reveal root={root}>
        <p className="flex items-center justify-center gap-3 text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground sm:text-xs">
          <span aria-hidden className="h-px w-6 bg-glow-rose/50 sm:w-10" />
          {ourWorld.eyebrow}
          <span aria-hidden className="h-px w-6 bg-glow-rose/50 sm:w-10" />
        </p>
        <h2 className="mt-5 font-display text-[2.6rem] leading-[1.05] text-foreground sm:text-7xl">
          <span className="text-glow">{ourWorld.title}</span>
          <span
            className="mt-1 block bg-clip-text px-3 italic text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--glow-gold), var(--glow-rose), var(--glow-gold))",
              backgroundSize: "200% auto",
              animation: "ow-shimmer 6s linear infinite",
              filter: "drop-shadow(0 0 18px oklch(0.72 0.192 355 / 45%))",
            }}
          >
            {ourWorld.titleAccent}
          </span>
        </h2>
        <p className="mt-5 font-hand text-2xl text-glow-gold text-gold-glow sm:text-3xl">
          {ourWorld.note}
        </p>
        <span
          aria-hidden
          className="mx-auto mt-8 block h-px w-28"
          style={{ background: "var(--gradient-rose)" }}
        />
        <p className="mx-auto mt-8 max-w-md whitespace-pre-line font-display text-lg leading-8 text-foreground/80 sm:text-xl">
          {ourWorld.intro}
        </p>
      </Reveal>

      <div className="absolute bottom-7 flex flex-col items-center gap-2.5 text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">
        <span
          aria-hidden
          className="flex h-9 w-5 justify-center rounded-full border border-foreground/30 pt-1.5"
        >
          <span
            className="h-1.5 w-1 rounded-full bg-glow-rose"
            style={{ animation: "ow-scroll 1.8s ease-in-out infinite" }}
          />
        </span>
        scroll slowly
      </div>
    </header>
  );
}

function MomentText({
  moment,
  index,
  align,
}: {
  moment: GalleryMoment;
  index: number;
  align: "center" | "side";
}) {
  const side = align === "side";
  return (
    <div className={`text-center ${side ? "md:text-left" : ""}`}>
      <p className={`flex items-center justify-center gap-3 ${side ? "md:justify-start" : ""}`}>
        <span className="font-display text-sm tracking-[0.3em] text-glow-gold">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span aria-hidden className="h-px w-10 bg-glow-gold/50" />
      </p>
      <h3 className="mt-4 font-display text-3xl leading-tight text-foreground text-glow sm:text-4xl">
        {moment.title}
      </h3>
      <p className="mt-3 font-hand text-2xl text-glow-gold/90">{moment.note}</p>
      <div className={`mt-6 space-y-4 ${side ? "" : "mx-auto max-w-xl"}`}>
        {moment.lines.map((line, i) => (
          <p
            key={i}
            className="whitespace-pre-line font-display text-[1.0625rem] leading-8 text-foreground/80 sm:text-lg"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function SingleMoment({
  root,
  moment,
  index,
  onOpen,
}: {
  root: RefObject<HTMLDivElement | null>;
  moment: GalleryMoment;
  index: number;
  onOpen: () => void;
}) {
  const flip = index % 2 === 1;
  const photo = moment.photos[0];
  if (!photo) return null;
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-10 md:grid-cols-2 md:gap-16">
      <Reveal root={root} className={flip ? "md:order-2" : ""}>
        <div className="mx-auto w-[74vw] max-w-sm">
          <Polaroid photo={photo} tilt={flip ? 3 : -3} onOpen={onOpen} />
        </div>
      </Reveal>
      <Reveal root={root} delay={150}>
        <MomentText moment={moment} index={index} align="side" />
      </Reveal>
    </section>
  );
}

function CollageMoment({
  root,
  moment,
  index,
  onOpen,
}: {
  root: RefObject<HTMLDivElement | null>;
  moment: GalleryMoment;
  index: number;
  onOpen: (photoIndex: number) => void;
}) {
  const featured = moment.featureFirst ? moment.photos[0] : null;
  const offset = featured ? 1 : 0;
  const rest = moment.photos.slice(offset);
  return (
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
      <Reveal root={root}>
        <MomentText moment={moment} index={index} align="center" />
      </Reveal>

      {featured && (
        <Reveal root={root} className="mx-auto mt-12 max-w-2xl">
          <Polaroid photo={featured} tilt={-1.5} onOpen={() => onOpen(0)} />
        </Reveal>
      )}

      <div className="mt-12 columns-2 gap-4 sm:columns-3 sm:gap-7">
        {rest.map((photo, i) => (
          <Reveal
            key={photo.src}
            root={root}
            delay={(i % 3) * 120}
            className="mb-6 break-inside-avoid sm:mb-9"
          >
            <Polaroid
              photo={photo}
              tilt={TILTS[i % TILTS.length] ?? 0}
              small
              onOpen={() => onOpen(i + offset)}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Scrapbook polaroid with a strip of tape; straightens and lifts on hover. */
function Polaroid({
  photo,
  tilt,
  small = false,
  onOpen,
}: {
  photo: GalleryPhoto;
  tilt: number;
  small?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open photo: ${photo.caption}`}
      className="group relative block w-full rotate-(--tilt) transition-all duration-500 ease-out hover:z-10 hover:-translate-y-1.5 hover:rotate-0 active:scale-[0.98]"
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
    >
      <span
        aria-hidden
        className={`absolute left-1/2 z-10 -translate-x-1/2 -rotate-3 rounded-[2px] bg-glow-rose/40 shadow-sm backdrop-blur-sm ${
          small ? "-top-2.5 h-5 w-14" : "-top-3.5 h-7 w-24"
        }`}
      />
      <div
        className={`rounded-sm bg-foreground/95 shadow-[var(--shadow-float)] transition-shadow duration-500 group-hover:shadow-[var(--shadow-glow)] ${
          small ? "p-1.5 pb-2 sm:p-2.5 sm:pb-3" : "p-3 pb-4"
        }`}
      >
        <div className="relative overflow-hidden rounded-xs bg-night-mid">
          <img src={photo.src} alt={photo.caption} loading="lazy" className="block h-auto w-full" />
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at 50% 120%, oklch(0.72 0.192 355 / 30%), transparent 65%)",
            }}
          />
        </div>
        <p
          className={`mt-2 px-1 text-center font-hand leading-tight text-night-deep ${
            small ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
          }`}
        >
          {photo.caption}
        </p>
      </div>
    </button>
  );
}

function HeartDivider() {
  return (
    <div aria-hidden className="flex items-center justify-center gap-4 py-10 sm:py-14">
      <span className="h-px w-16 bg-linear-to-r from-transparent to-glow-rose/60 sm:w-28" />
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-glow-rose animate-heartbeat"
      >
        <path d={HEART} />
      </svg>
      <span className="h-px w-16 bg-linear-to-l from-transparent to-glow-rose/60 sm:w-28" />
    </div>
  );
}

function Outro({ root, onClose }: { root: RefObject<HTMLDivElement | null>; onClose: () => void }) {
  return (
    <footer className="px-6 pb-24 pt-4 text-center">
      <Reveal root={root} className="mx-auto max-w-xl">
        <span className="inline-block text-glow-rose animate-sway">
          <Butterfly size={30} />
        </span>
        <div className="mt-6 space-y-5">
          {ourWorld.outro.lines.map((line, i) => (
            <p
              key={i}
              className="whitespace-pre-line font-display text-xl leading-9 text-foreground/85 sm:text-2xl"
            >
              {line}
            </p>
          ))}
        </div>
        <p className="mt-8 font-hand text-3xl text-glow-gold text-gold-glow">
          {ourWorld.outro.signature}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-10 rounded-full px-8 py-3.5 text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-300 hover:scale-105 active:scale-95"
          style={{ background: "var(--gradient-rose)" }}
        >
          {ourWorld.outro.back}
        </button>
      </Reveal>
    </footer>
  );
}

/** Whole photo, uncropped, with arrows, swipe and a counter. */
function Lightbox({
  index,
  onStep,
  onClose,
}: {
  index: number;
  onStep: (dir: 1 | -1) => void;
  onClose: () => void;
}) {
  const photo = allPhotos[index];
  const touchX = useRef<number | null>(null);
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-70 flex flex-col items-center justify-center bg-night-deep/95 px-4 py-14 backdrop-blur-md"
      style={{ animation: "ow-fade 0.3s ease-out both" }}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const endX = e.changedTouches[0]?.clientX;
        if (touchX.current === null || endX === undefined) return;
        const dx = endX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
      }}
    >
      <PanelClose onClick={onClose} />

      <figure
        key={index}
        className="flex max-h-full flex-col items-center"
        style={{ animation: "ow-pop 0.35s ease-out both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.caption}
          className="max-h-[74dvh] w-auto max-w-full rounded-2xl object-contain shadow-[var(--shadow-float)]"
        />
        <figcaption className="mt-4 max-w-md text-center font-hand text-2xl text-foreground/90">
          {photo.caption}
        </figcaption>
        <p className="mt-1 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
          {index + 1} / {allPhotos.length}
        </p>
      </figure>

      <LightboxArrow dir={-1} onStep={onStep} />
      <LightboxArrow dir={1} onStep={onStep} />
    </div>
  );
}

function LightboxArrow({ dir, onStep }: { dir: 1 | -1; onStep: (dir: 1 | -1) => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 1 ? "Next photo" : "Previous photo"}
      onClick={(e) => {
        e.stopPropagation();
        onStep(dir);
      }}
      className={`glass absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 text-foreground/80 transition-all hover:border-glow-rose/60 hover:text-foreground active:scale-90 sm:flex ${
        dir === 1 ? "right-4 sm:right-8" : "left-4 sm:left-8"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d={dir === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
