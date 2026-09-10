import { useRef, useState } from 'react';
import Lightbox, { type Shot } from './Lightbox';

interface Props {
  shots: Shot[];
  /** Masonry columns feel archival; grid feels like a museum wall. */
  layout?: 'masonry' | 'grid';
  label: string;
}

export default function Gallery({ shots, layout = 'grid', label }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const close = () => {
    const last = index;
    setIndex(null);
    if (last !== null) triggers.current[last]?.focus();
  };

  return (
    <>
      <ul className={`gallery gallery--${layout}`} aria-label={label}>
        {shots.map((shot, i) => (
          <li key={shot.src}>
            <button
              type="button"
              ref={(el) => { triggers.current[i] = el; }}
              onClick={() => setIndex(i)}
              aria-label={`View photo: ${shot.alt}`}
            >
              <img
                src={shot.src}
                srcSet={shot.srcset}
                sizes="(max-width: 48rem) 46vw, (max-width: 72rem) 30vw, 22rem"
                width={shot.width}
                height={shot.height}
                alt={shot.alt}
                loading="lazy"
                decoding="async"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox shots={shots} index={index} onClose={close} onMove={setIndex} />
    </>
  );
}
