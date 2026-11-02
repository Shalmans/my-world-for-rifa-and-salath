import { useState } from "react";
import type { Photo } from "@/content/story";
import { PanelClose } from "./SceneNav";
import coupleNight from "@/assets/couple-night.jpg";

/**
 * Polaroid-style floating photo.
 * Replace the image by setting `src` in src/content/story.ts.
 */
export function PhotoFrame({
  photo,
  index,
  onOpen,
}: {
  photo: Photo;
  index: number;
  onOpen: () => void;
}) {
  const rotate = [-5, 3.5, -2.5, 6][index % 4];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative shrink-0 snap-center transition-transform duration-500 ease-out hover:-translate-y-2 hover:rotate-0 active:scale-95"
      style={{
        transform: `rotate(${rotate}deg)`,
        animation: `scale-in 0.6s ease-out ${0.15 * index}s both`,
      }}
    >
      <div
        className="w-[62vw] max-w-[260px] rounded-sm bg-foreground/90 p-3 pb-10 shadow-[var(--shadow-float)]"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-xs bg-night-mid">
          {photo.src ? (
            <img
              src={photo.src}
              alt={photo.caption}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <img src={coupleNight} alt={photo.caption} loading="lazy" className="h-full w-full object-cover" />
          )}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(circle at 50% 120%, oklch(0.72 0.192 355 / 30%), transparent 65%)" }}
          />
        </div>
        <p className="mt-3 text-center font-hand text-lg text-night-deep">{photo.caption}</p>
      </div>
    </button>
  );
}

export function PhotoLightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-night-deep/85 p-5 backdrop-blur-md"
      style={{ animation: "fade-in 0.3s ease-out both" }}
      onClick={onClose}
    >
      <div
        className="glass relative w-full max-w-sm overflow-hidden rounded-3xl p-4"
        style={{ animation: "scale-in 0.35s ease-out both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <PanelClose onClick={onClose} />
        <div className="aspect-4/5 w-full overflow-hidden rounded-2xl bg-night-mid">
          {photo.src ? (
            <img src={photo.src} alt={photo.caption} className="h-full w-full object-cover" />
          ) : (
            <img src={coupleNight} alt={photo.caption} className="h-full w-full object-cover" />
          )}
        </div>
        <p className="mt-4 font-display text-xl text-foreground">{photo.caption}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{photo.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-border/60 py-3 text-xs uppercase tracking-[0.3em] text-foreground/85 transition-colors hover:bg-foreground/5"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function usePhotoLightbox() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  return { photo, open: setPhoto, close: () => setPhoto(null) };
}
