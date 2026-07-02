import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Compass, SearchX, Sparkles, MapPin, ChevronDown } from 'lucide-react';
import { Route, RouteFilter } from '../types';
import { countryFlag } from '../utils';
import { TopBar } from '../components/TopBar';
import { SearchBar } from '../components/SearchBar';
import { MapPreview } from '../components/MapPreview';
import { FilterChips } from '../components/FilterChips';
import { CuratedCarousel } from '../components/CuratedCarousel';
import { RouteCard } from '../components/RouteCard';
import { LocationPicker, CountryOption } from '../components/LocationPicker';

interface DiscoverPageProps {
  routes: Route[];
  embedded?: boolean;
  onOpenRoute: (route: Route) => void;
  onBack: () => void;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
}

const FILTER_HEADINGS: Record<RouteFilter, string> = {
  all: 'All routes',
  eco: 'Greenest routes',
  group: 'Great for groups',
  easy: 'Easygoing trails',
  hard: 'Challenging trails',
};

function matchesFilter(route: Route, filter: RouteFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'eco':
      return route.ecoScore >= 90;
    case 'group':
      return route.tags.includes('Group Friendly');
    case 'easy':
      return route.difficulty === 'easy';
    case 'hard':
      return route.difficulty === 'hard';
  }
}

export function DiscoverPage({ routes, embedded = false, onOpenRoute, onBack, savedIds, onToggleSave }: DiscoverPageProps) {
  const [filter, setFilter] = useState<RouteFilter>('all');
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<string>('all');
  const [locationOpen, setLocationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Countries with route counts for the location picker.
  const countries = useMemo<CountryOption[]>(() => {
    const counts = new Map<string, number>();
    for (const r of routes) counts.set(r.country, (counts.get(r.country) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([name]) => name)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [routes]);

  // Routes in the chosen country (before attribute/search filters).
  const inCountry = useMemo(
    () => (country === 'all' ? routes : routes.filter((r) => r.country === country)),
    [country, routes],
  );

  const featured = useMemo(() => inCountry.slice(0, 6), [inCountry]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inCountry.filter((route) => {
      if (!matchesFilter(route, filter)) return false;
      if (!q) return true;
      return (
        route.title.toLowerCase().includes(q) ||
        route.location.toLowerCase().includes(q) ||
        route.country.toLowerCase().includes(q) ||
        route.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [inCountry, filter, query]);

  const isSearching = query.trim().length > 0;
  const locationLabel = country === 'all' ? 'All locations' : country;

  const heading = isSearching
    ? 'Search results'
    : filter === 'all'
      ? country === 'all'
        ? 'All routes'
        : `Trails in ${country}`
      : FILTER_HEADINGS[filter];

  return (
    <div
      onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}
      className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-gray-50 pb-28"
    >
      {!embedded && <TopBar onBack={onBack} scrolled={scrolled} />}

      {/* Hero greeting + location */}
      <div className="px-4 pt-2 pb-4">
        <button
          type="button"
          onClick={() => setLocationOpen(true)}
          className="inline-flex items-center gap-1.5 mb-2 pl-1 pr-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm active:scale-95 transition-transform"
        >
          <span className="text-base leading-none">
            {country === 'all' ? '🌍' : countryFlag(country)}
          </span>
          <span className="text-sm font-bold text-slate-800">{locationLabel}</span>
          <ChevronDown size={15} className="text-slate-400" />
        </button>
        <h1 className="text-[28px] leading-tight font-black text-slate-900 tracking-tight mb-4">
          Find your next
          <br />
          trail to explore
        </h1>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {/* Map preview */}
      {!isSearching && (
        <div className="px-4 pb-2">
          <MapPreview nearbyCount={inCountry.length} locationLabel={locationLabel} />
        </div>
      )}

      {/* Featured carousel */}
      {!isSearching && featured.length > 0 && (
        <section className="pt-3">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="flex items-center gap-1.5 text-lg font-bold text-slate-900">
              <Sparkles size={18} className="text-emerald-500" />
              Curated by Dayla
            </h2>
            <button className="text-sm font-semibold text-emerald-600">See all</button>
          </div>
          <CuratedCarousel routes={featured} onOpen={onOpenRoute} />
        </section>
      )}

      {/* Filter chips */}
      <FilterChips active={filter} onChange={setFilter} />

      {/* Results list */}
      <section className="px-4 pt-1">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">{heading}</h2>
          <span className="text-sm font-medium text-slate-400">
            {results.length} {results.length === 1 ? 'route' : 'routes'}
          </span>
        </div>

        {results.length > 0 ? (
          <div className="flex flex-col gap-4">
            {results.map((route, i) => (
              <RouteCard
                key={route.id}
                route={route}
                index={i}
                isSaved={savedIds.has(route.id)}
                onOpen={onOpenRoute}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center py-16 px-6"
          >
            <div className="grid place-items-center w-16 h-16 rounded-2xl bg-white text-slate-300 ring-1 ring-gray-100 mb-4">
              {isSearching ? <SearchX size={28} /> : <MapPin size={28} />}
            </div>
            <p className="font-bold text-slate-700 mb-1">No routes found</p>
            <p className="text-sm text-slate-500 max-w-[16rem]">
              {isSearching
                ? `Nothing matches “${query.trim()}”. Try a different search.`
                : `No routes match this filter in ${locationLabel} yet — try another location.`}
            </p>
            {country !== 'all' && !isSearching && (
              <button
                type="button"
                onClick={() => setCountry('all')}
                className="mt-5 flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-5 py-3 rounded-full active:scale-95 transition-transform"
              >
                <Compass size={17} />
                Browse all locations
              </button>
            )}
          </motion.div>
        )}
      </section>

      {/* Location picker sheet */}
      <LocationPicker
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        selected={country}
        onSelect={setCountry}
        countries={countries}
        totalCount={routes.length}
      />
    </div>
  );
}
