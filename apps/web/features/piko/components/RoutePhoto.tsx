import { Mountain } from 'lucide-react';

interface RoutePhotoProps {
  src?: string | null;
  alt: string;
  className?: string;
}

/**
 * Route imagery with a graceful placeholder.
 *
 * User-generated routes no longer get stock photos pretending to be the trail
 * (licensing + honesty): until the creator uploads their own photo, we render a
 * branded placeholder instead of a broken/misleading image.
 */
export function RoutePhoto({ src, alt, className = '' }: RoutePhotoProps) {
  if (src) {
    return <img src={src} alt={alt} className={className} loading="lazy" draggable={false} />;
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`grid place-items-center bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 text-emerald-400 ${className}`}
    >
      <Mountain aria-hidden="true" className="w-1/4 h-1/4 min-w-5 min-h-5 max-w-12 max-h-12" strokeWidth={1.8} />
    </div>
  );
}
