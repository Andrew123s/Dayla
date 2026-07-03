import { Bookmark, Clock, Leaf, Mountain, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Route } from '../types';
import { difficultyStyles, formatDuration } from '../utils';
import { RoutePhoto } from './RoutePhoto';

interface RouteCardProps {
  route: Route;
  index: number;
  isSaved: boolean;
  onOpen: (route: Route) => void;
  onToggleSave: (id: string) => void;
}

export function RouteCard({ route, index, isSaved, onOpen, onToggleSave }: RouteCardProps) {
  const diff = difficultyStyles(route.difficulty);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.35), ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(route)}
      whileTap={{ scale: 0.985 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm ring-1 ring-gray-100 cursor-pointer transition-shadow hover:shadow-xl hover:shadow-slate-900/5"
    >
      <div className="relative h-52 w-full overflow-hidden">
        <RoutePhoto
          src={route.photos[0]}
          alt={route.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {route.type === 'curated' && (
            <span className="bg-white/95 backdrop-blur text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified
            </span>
          )}
          <span className="bg-emerald-500/95 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Leaf size={11} />
            {route.ecoScore} Eco
          </span>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(route.id);
          }}
          aria-label={isSaved ? 'Remove from saved' : 'Save route'}
          aria-pressed={isSaved}
          className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-full bg-white/90 backdrop-blur text-slate-700 shadow-sm hover:bg-white active:scale-90 transition-all"
        >
          <Bookmark
            size={17}
            className={isSaved ? 'fill-emerald-500 text-emerald-500' : ''}
          />
        </button>

        {/* Title block over image */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-1 text-white/90 text-xs font-medium mb-0.5 drop-shadow">
            <MapPin size={12} />
            <span className="line-clamp-1">{route.location}</span>
          </div>
          <h3 className="text-white text-xl font-bold leading-tight drop-shadow line-clamp-1">
            {route.title}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-baseline gap-1">
              <span className="font-bold text-slate-800">{route.distanceKm}</span>
              <span className="text-xs text-slate-400">km</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Clock size={14} className="text-slate-400" />
              <span className="font-medium">{formatDuration(route.estimatedDurationMins)}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Mountain size={14} className="text-slate-400" />
              <span className="font-medium">{route.elevationGainM}</span>
              <span className="text-xs text-slate-400">m</span>
            </span>
          </div>
          <span
            className={`text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${diff.soft}`}
          >
            {diff.label}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
