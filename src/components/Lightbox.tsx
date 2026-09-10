import { useCallback, useEffect, useRef } from 'react';

export interface Shot {
  src: string;
  srcset?: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

interface Props {
  shots: Shot[];
  index: number | null;
  onClose: () => void;
  onMove: (next: number) => void;
}

/**
 * Native <dialog> lightbox. Arrow keys move, Escape closes, focus returns to
 * the thumbnail that opened it (handled by the parent).
 */
export default function Lightbox({ shots, index, onClose, onMove }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const key = useCallback(
    (e: KeyboardEvent) => {
      if (index === null) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); onMove((index + 1) % shots.length); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); onMove((index - 1 + shots.length) % shots.length); }
    },
    [index, shots.length, onMove],
  );

  useEffect(() => {
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [key]);

  const shot = index === null ? null : shots[index];

  return (
    <dialog ref={ref} className="lightbox" onClose={onClose} aria-label="Photo viewer">
      {shot && (
        <div className="lightbox__inner">
          <button className="lightbox__close" type="button" onClick={onClose} aria-label="Close photo viewer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <button
            className="lightbox__nav lightbox__nav--prev"
            type="button"
            onClick={() => onMove((index! - 1 + shots.length) % shots.length)}
            aria-label="Previous photo"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <figure className="lightbox__figure">
            <img
              src={shot.src}
              srcSet={shot.srcset}
              sizes="(max-width: 60rem) 92vw, 78vw"
              width={shot.width}
              height={shot.height}
              alt={shot.alt}
            />
            <figcaption>
              <span>{shot.caption ?? shot.alt}</span>
              <span className="lightbox__count">{index! + 1} / {shots.length}</span>
            </figcaption>
          </figure>

          <button
            className="lightbox__nav lightbox__nav--next"
            type="button"
            onClick={() => onMove((index! + 1) % shots.length)}
            aria-label="Next photo"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </dialog>
  );
}
