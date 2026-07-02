import { Leaf, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Route } from '../types';
import { difficultyStyles, formatDuration } from '../utils';

interface CuratedCarouselProps {
  routes: Route[];
  onOpen: (route: Route) => void;
}

export function CuratedCarousel({ routes, onOpen }: CuratedCarouselProps) {
  if (routes.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-1">
      {routes.map((route) => {
        const diff = difficultyStyles(route.difficulty);
        return (
          <motion.button
            key={route.id}
            type="button"
            onClick={() => onOpen(route)}
            whileTap={{ scale: 0.97 }}
            className="snap-start shrink-0 w-64 text-left rounded-3xl overflow-hidden shadow-sm ring-1 ring-gray-100 bg-white"
          >
            <div className="relative h-36 w-full">
              <img
                src={route.photos[0]}
                alt={route.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <span className="absolute top-3 left-3 bg-emerald-500/95 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Leaf size={11} />
                {route.ecoScore}
              </span>
              <div className="absolute bottom-2.5 left-3 right-3">
                <div className="flex items-center gap-1 text-white/85 text-[11px] font-medium drop-shadow">
                  <MapPin size={11} />
                  <span className="line-clamp-1">{route.location}</span>
                </div>
                <h4 className="text-white font-bold leading-tight drop-shadow line-clamp-1">
                  {route.title}
                </h4>
              </div>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-xs text-slate-500 font-medium">
                {route.distanceKm} km · {formatDuration(route.estimatedDurationMins)}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${diff.soft}`}>
                {diff.label}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
