import React, { useRef, useState } from 'react';
import { Heart } from 'lucide-react';

interface MediaCarouselProps {
  images: { url: string; type?: 'image' | 'video'; caption?: string }[];
  alt: string;
  /** Double-tap (or double-click) anywhere on the media likes the post. */
  onDoubleTapLike?: () => void;
  /** Single tap opens the post/comments. */
  onOpen?: () => void;
}

/**
 * Instagram-grade media presentation for post images:
 * - swipeable scroll-snap carousel for multi-image posts (dots + counter)
 * - fixed 4:5 stage (object-cover) so the feed rhythm stays consistent
 *   instead of jumping between arbitrary image heights
 * - double-tap to like with an animated heart burst
 * Single image renders without carousel chrome. No external deps.
 */
export const MediaCarousel: React.FC<MediaCarouselProps> = ({ images, alt, onDoubleTapLike, onOpen }) => {
  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) return null;
  const multi = images.length > 1;

  const triggerLike = () => {
    setBurst(true);
    setTimeout(() => setBurst(false), 700);
    onDoubleTapLike?.();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(15);
  };

  // Distinguish double-tap (like) from single tap (open) without eating either.
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      lastTap.current = 0;
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      triggerLike();
    } else {
      lastTap.current = now;
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      singleTapTimer.current = setTimeout(() => onOpen?.(), 300);
    }
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  return (
    <div className="relative bg-stone-100 select-none" onClick={handleTap}>
      <div
        ref={trackRef}
        onScroll={multi ? handleScroll : undefined}
        className={`flex ${multi ? 'overflow-x-auto snap-x snap-mandatory scrollbar-hide' : ''}`}
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="w-full shrink-0 snap-center aspect-[4/5] max-h-[520px]">
            {img.type === 'video' ? (
              // Native controls own taps/clicks; stop propagation so the
              // carousel's tap-to-open / double-tap-to-like doesn't fight them.
              <video
                src={img.url}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover bg-black"
                onClick={(e) => e.stopPropagation()}
                aria-label={img.caption || `${alt} (video)`}
              />
            ) : (
              <img
                src={img.url}
                alt={img.caption || `${alt}${multi ? ` (${i + 1} of ${images.length})` : ''}`}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Double-tap heart burst */}
      {burst && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <Heart size={84} className="text-white fill-white drop-shadow-lg animate-ping" style={{ animationIterationCount: 1, animationDuration: '0.7s' }} />
        </div>
      )}

      {multi && (
        <>
          {/* Counter chip */}
          <span className="absolute top-3 right-3 bg-black/55 text-white text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {index + 1}/{images.length}
          </span>
          {/* Dots */}
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5" aria-hidden="true">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/45'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
