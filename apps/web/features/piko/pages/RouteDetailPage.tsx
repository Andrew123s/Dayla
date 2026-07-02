import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Route as RouteIcon,
  Mountain,
  Clock,
  CloudSun,
  Leaf,
  Accessibility,
  BadgeCheck,
  Users,
  Navigation,
  CalendarPlus,
  MapPin,
  Wind,
  Droplets,
} from 'lucide-react';
import { Route, RouteComment } from '../types';
import { difficultyStyles, formatDuration } from '../utils';
import { EcoImpactCard } from '../components/EcoImpactCard';
import { RouteCommunity } from '../components/RouteCommunity';
import { RouteMiniMap } from '../components/RouteMiniMap';
import { TrailMap } from '../components/TrailMapLazy';
import { ElevationProfile } from '../components/ElevationProfile';
import { isMapConfigured } from '../map/mapConfig';
import { fetchLiveWeather, LiveWeather } from '../weather';

interface RouteDetailPageProps {
  route: Route;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAddToPlan: (route: Route) => void;
  onNavigate: (route: Route) => void;
  onOpenGroup: (route: Route) => void;
  voteScore: number;
  userVote: -1 | 0 | 1;
  onVote: (value: -1 | 0 | 1) => void;
  comments: RouteComment[];
  commentsLoading: boolean;
  onAddComment: (content: string) => void;
  addingComment: boolean;
}

export function RouteDetailPage({
  route,
  onBack,
  isSaved,
  onToggleSave,
  onAddToPlan,
  onNavigate,
  onOpenGroup,
  voteScore,
  userVote,
  onVote,
  comments,
  commentsLoading,
  onAddComment,
  addingComment,
}: RouteDetailPageProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const diff = difficultyStyles(route.difficulty);

  // Live trailhead weather via Open-Meteo (free, no key). startPoint is [lng, lat].
  useEffect(() => {
    let active = true;
    setWeather(null);
    if (route.startPoint) {
      fetchLiveWeather(route.startPoint[1], route.startPoint[0]).then((w) => {
        if (active) setWeather(w);
      });
    }
    return () => {
      active = false;
    };
  }, [route.id, route.startPoint]);

  const weatherScore = weather ? weather.score : route.weatherScore;

  const handleShare = async () => {
    const shareData = { title: route.title, text: `${route.title} — ${route.location}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      className="absolute inset-0 z-50 bg-white flex flex-col"
    >
      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-28">
        {/* Hero */}
        <div className="relative h-[19rem] w-full shrink-0">
          <motion.img
            key={activePhoto}
            initial={{ opacity: 0.4, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={route.photos[activePhoto]}
            alt={route.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

          {/* Top nav */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-safe-top">
            <div className="h-14 flex items-center">
              <motion.button
                type="button"
                onClick={onBack}
                whileTap={{ scale: 0.9 }}
                aria-label="Go back"
                className="grid place-items-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={20} strokeWidth={2.4} />
              </motion.button>
            </div>
            <div className="h-14 flex items-center gap-2.5">
              <motion.button
                type="button"
                onClick={handleShare}
                whileTap={{ scale: 0.9 }}
                aria-label="Share"
                className="grid place-items-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
              >
                <Share2 size={18} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => onToggleSave(route.id)}
                whileTap={{ scale: 0.9 }}
                aria-label={isSaved ? 'Remove from saved' : 'Save route'}
                aria-pressed={isSaved}
                className="grid place-items-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
              >
                <Bookmark size={18} className={isSaved ? 'fill-white' : ''} />
              </motion.button>
            </div>
          </div>

          {/* Title block */}
          <div className="absolute bottom-4 inset-x-4">
            <div className="flex flex-wrap gap-2 mb-2.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md ${diff.solid} bg-opacity-90`}>
                {diff.label}
              </span>
              <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Leaf size={11} />
                {route.ecoScore} Eco
              </span>
            </div>
            <h1 className="text-[26px] font-black text-white leading-tight drop-shadow">{route.title}</h1>
            <p className="flex items-center gap-1 text-white/85 text-sm font-medium drop-shadow">
              <MapPin size={13} />
              {route.location}
            </p>
          </div>
        </div>

        {/* Photo thumbnails */}
        {route.photos.length > 1 && (
          <div className="flex gap-2.5 px-5 pt-4">
            {route.photos.map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePhoto(i)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden ring-2 transition-all ${
                  i === activePhoto ? 'ring-emerald-500' : 'ring-transparent opacity-70'
                }`}
              >
                <img src={p} alt={`${route.title} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="px-5">
          {/* Verified attribution */}
          {route.type === 'curated' && (
            <div className="flex items-center gap-2 py-4 mt-1">
              <BadgeCheck size={18} className="text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700">Verified by Dayla</span>
              <span className="text-sm text-slate-400">· Official route</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 py-4 border-y border-gray-100">
            <Stat icon={RouteIcon} value={`${route.distanceKm}`} unit="km" />
            <Stat icon={Mountain} value={`${route.elevationGainM}`} unit="m gain" />
            <Stat icon={Clock} value={formatDuration(route.estimatedDurationMins)} unit="est." />
            <Stat
              icon={CloudSun}
              value={weather ? `${weather.tempC}°` : `${weatherScore}`}
              unit={weather ? weather.label : 'weather'}
            />
          </div>

          {/* Route map (real geometry) + live weather */}
          {route.geometry && route.geometry.coordinates.length > 1 && (
            <section className="pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Route map</h2>
              {isMapConfigured() ? (
                <TrailMap routes={[route]} className="h-56" />
              ) : (
                <RouteMiniMap geometry={route.geometry} className="h-44" />
              )}
              {weather && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-sky-50 border border-sky-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-sky-700">
                    <CloudSun size={18} />
                    <span className="text-sm font-bold">{weather.label}</span>
                    <span className="text-sm font-semibold text-slate-500">{weather.tempC}°C</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Wind size={13} /> {weather.windKmh} km/h</span>
                    <span className="flex items-center gap-1"><Droplets size={13} /> {weather.precipMm} mm</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Elevation profile (hidden when the geometry has no elevation data) */}
          <ElevationProfile geometry={route.geometry} />

          {/* About */}
          <section className="pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2.5">About this route</h2>
            <p className="text-slate-600 leading-relaxed">{route.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {route.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-slate-600 text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  #{tag.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          </section>

          {/* Scores */}
          <section className="pt-7">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Route scores</h2>
            <div className="flex flex-col gap-3.5">
              <ScoreBar icon={Leaf} label="Eco friendliness" value={route.ecoScore} color="bg-emerald-500" />
              <ScoreBar icon={CloudSun} label={weather ? 'Weather suitability (live)' : 'Weather suitability'} value={weatherScore} color="bg-sky-500" />
              <ScoreBar icon={Accessibility} label="Accessibility" value={route.accessibilityScore} color="bg-violet-500" />
            </div>
          </section>

          {/* Eco impact */}
          <div className="pt-7">
            <EcoImpactCard impact={route.ecoImpact} />
          </div>

          {/* Community — votes + comments */}
          <RouteCommunity
            voteScore={voteScore}
            userVote={userVote}
            onVote={onVote}
            comments={comments}
            commentsLoading={commentsLoading}
            onAddComment={onAddComment}
            addingComment={addingComment}
          />

          {/* Group activity */}
          <section className="pt-7">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Plan with your group</h2>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5 text-center">
              <div className="grid place-items-center w-12 h-12 rounded-2xl bg-white text-emerald-500 ring-1 ring-gray-100 mx-auto mb-3">
                <Users size={24} />
              </div>
              <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">
                Invite friends to vote, split tasks, and auto-generate a packing list for this hike.
              </p>
              <button
                type="button"
                onClick={() => onOpenGroup(route)}
                className="text-emerald-600 font-bold text-sm bg-emerald-50 px-5 py-2.5 rounded-full active:scale-95 transition-transform"
              >
                View group options
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 pt-3 pb-safe shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
        <div className="flex gap-3 pb-1">
          <button
            type="button"
            onClick={() => onNavigate(route)}
            className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.97] transition-all"
          >
            <Navigation size={18} />
            Navigate
          </button>
          <button
            type="button"
            onClick={() => onAddToPlan(route)}
            className="flex-1 bg-emerald-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-[0.97] transition-all shadow-lg shadow-emerald-500/30"
          >
            <CalendarPlus size={18} />
            Add to plan
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  value,
  unit,
}: {
  icon: typeof RouteIcon;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon size={20} className="text-emerald-600" />
      <span className="text-base font-bold text-slate-800 leading-none">{value}</span>
      <span className="text-[11px] text-slate-400 font-medium">{unit}</span>
    </div>
  );
}

function ScoreBar({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof RouteIcon;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Icon size={16} className="text-slate-400" />
          {label}
        </span>
        <span className="text-sm font-bold text-slate-800">{value}/100</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
