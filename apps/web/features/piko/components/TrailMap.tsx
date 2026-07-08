import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource, LngLatBounds, Map as MlMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapIcon } from 'lucide-react';
import { Route, RouteGeometry } from '../types';
import {
  MAP_STYLE_URL,
  isMapConfigured,
  TRAIL_COLOR,
  TRAIL_COLOR_SOFT,
  START_COLOR,
  END_COLOR,
} from '../map/mapConfig';

type LngLat = [number, number];

export interface TrailMapProps {
  /** Routes to draw. One route → single-route mode (start/end markers + fit). */
  routes?: Route[];
  /** Highlight + recolour this route id. */
  selectedId?: string | null;
  /** Tap a trail line / trailhead dot. */
  onSelectRoute?: (route: Route) => void;
  className?: string;

  /** Draw mode: tapping the map reports a snapped-ready waypoint. */
  draw?: boolean;
  drawPoints?: LngLat[];
  onAddDrawPoint?: (lngLat: LngLat) => void;
  /** The server-snapped polyline to overlay while drawing (also used as the live GPS track). */
  drawGeometry?: RouteGeometry | null;
  /** Recenter the camera here when it changes (used to follow a live GPS fix). */
  recenterTo?: LngLat | null;
}

const ROUTES_SRC = 'piko-routes';
const TRAILHEADS_SRC = 'piko-trailheads';
const DRAW_LINE_SRC = 'piko-draw-line';
const DRAW_PTS_SRC = 'piko-draw-points';

function emptyFC(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function routesToLines(routes: Route[], selectedId?: string | null): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: routes
      .filter((r) => r.geometry && r.geometry.coordinates.length > 1)
      .map((r) => ({
        type: 'Feature',
        properties: { id: r.id, selected: r.id === selectedId ? 1 : 0 },
        geometry: { type: 'LineString', coordinates: r.geometry!.coordinates },
      })),
  };
}

function routesToTrailheads(routes: Route[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: routes
      .map((r) => {
        const start = r.startPoint ?? (r.geometry?.coordinates?.[0] as LngLat | undefined);
        if (!start) return null;
        return {
          type: 'Feature' as const,
          properties: { id: r.id, title: r.title },
          geometry: { type: 'Point' as const, coordinates: [start[0], start[1]] },
        };
      })
      .filter(Boolean) as GeoJSON.Feature[],
  };
}

function boundsOf(routes: Route[]): LngLatBounds | null {
  const b = new maplibregl.LngLatBounds();
  let has = false;
  for (const r of routes) {
    for (const c of r.geometry?.coordinates ?? []) {
      b.extend([c[0], c[1]]);
      has = true;
    }
    if (r.startPoint) {
      b.extend(r.startPoint);
      has = true;
    }
  }
  return has ? b : null;
}

export function TrailMap({
  routes = [],
  selectedId,
  onSelectRoute,
  className = '',
  draw = false,
  drawPoints = [],
  onAddDrawPoint,
  drawGeometry = null,
  recenterTo = null,
}: TrailMapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const recenteredOnceRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  // Bumped by the error card's Retry button → tears down and re-creates the map
  // (fresh style/tile fetch) without requiring a full app reload.
  const [retryNonce, setRetryNonce] = useState(0);
  const configured = isMapConfigured();

  const lines = useMemo(() => routesToLines(routes, selectedId), [routes, selectedId]);
  const trailheads = useMemo(() => routesToTrailheads(routes), [routes]);
  const single = routes.length === 1 ? routes[0] : null;

  // Latest callbacks without re-initialising the map.
  const onSelectRef = useRef(onSelectRoute);
  const onAddRef = useRef(onAddDrawPoint);
  const drawRef = useRef(draw);
  onSelectRef.current = onSelectRoute;
  onAddRef.current = onAddDrawPoint;
  drawRef.current = draw;

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!configured || !containerRef.current || mapRef.current) return;
    let map: MlMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [10, 47],
        zoom: 3,
        attributionControl: { compact: true },
      });
    } catch (e) {
      // WebGL unavailable/blocked (some embedded browsers) — surface it instead
      // of a silent blank area.
      // eslint-disable-next-line no-console
      console.error('[TrailMap] map init failed:', e);
      setInitError(e instanceof Error ? e.message : 'Map could not start');
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    // A rejected tile key (401/403) is fatal — surface a helpful message instead
    // of a blank map + repeated console errors.
    map.on('error', (e) => {
      const status = (e?.error as { status?: number } | undefined)?.status;
      if (status === 401 || status === 403) setLoadError(true);
    });
    if (draw) map.getCanvas().style.cursor = 'crosshair';

    // Blank-map guard: MapLibre measures the container once at init. Inside an
    // overlay/tab that animates in (or isn't laid out yet), that measurement can
    // be 0×0, leaving the canvas blank even after the container gets real size.
    // A ResizeObserver + a couple of nudges force a repaint at the true size.
    const ro = new ResizeObserver(() => map.resize());
    if (containerRef.current) ro.observe(containerRef.current);
    resizeObserverRef.current = ro;
    requestAnimationFrame(() => map.resize());
    const resizeTimer = setTimeout(() => map.resize(), 250);

    // Self-healing + diagnostics: if the container is still (near) zero-sized a
    // moment after init, some ancestor collapsed — force a usable height on the
    // root so the map paints anyway, and log decisive evidence either way.
    const sizeCheckTimer = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const { clientWidth: w, clientHeight: h } = el;
      // eslint-disable-next-line no-console
      console.info(`[TrailMap] build 2026-07-06 container ${w}x${h}, canvas ${map.getCanvas().width}x${map.getCanvas().height}`);
      if (h < 40 && rootRef.current) {
        // eslint-disable-next-line no-console
        console.warn('[TrailMap] container height collapsed — applying min-height fallback');
        rootRef.current.style.minHeight = '60vh';
        requestAnimationFrame(() => map.resize());
      }
    }, 600);

    map.on('load', () => {
      map.addSource(ROUTES_SRC, { type: 'geojson', data: emptyFC() });
      map.addLayer({
        id: 'routes-line-casing',
        type: 'line',
        source: ROUTES_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.7 },
      });
      map.addLayer({
        id: 'routes-line',
        type: 'line',
        source: ROUTES_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['case', ['==', ['get', 'selected'], 1], TRAIL_COLOR, TRAIL_COLOR_SOFT],
          'line-width': ['case', ['==', ['get', 'selected'], 1], 5, 3.5],
        },
      });

      map.addSource(TRAILHEADS_SRC, { type: 'geojson', data: emptyFC() });
      map.addLayer({
        id: 'trailheads',
        type: 'circle',
        source: TRAILHEADS_SRC,
        paint: {
          'circle-radius': 7,
          'circle-color': START_COLOR,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2.5,
        },
      });

      // Draw-mode sources/layers.
      map.addSource(DRAW_LINE_SRC, { type: 'geojson', data: emptyFC() });
      map.addLayer({
        id: 'draw-line',
        type: 'line',
        source: DRAW_LINE_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': TRAIL_COLOR, 'line-width': 4 },
      });
      map.addSource(DRAW_PTS_SRC, { type: 'geojson', data: emptyFC() });
      map.addLayer({
        id: 'draw-points',
        type: 'circle',
        source: DRAW_PTS_SRC,
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-color': TRAIL_COLOR,
          'circle-stroke-width': 3,
        },
      });

      const select = (e: maplibregl.MapLayerMouseEvent) => {
        if (drawRef.current) return;
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const r = routes.find((x) => x.id === id);
        if (r) onSelectRef.current?.(r);
      };
      map.on('click', 'trailheads', select);
      map.on('click', 'routes-line', select);
      for (const layer of ['trailheads', 'routes-line']) {
        map.on('mouseenter', layer, () => {
          if (!drawRef.current) map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = drawRef.current ? 'crosshair' : '';
        });
      }

      // Draw clicks.
      map.on('click', (e) => {
        if (!drawRef.current) return;
        onAddRef.current?.([e.lngLat.lng, e.lngLat.lat]);
      });

      // Once the style is loaded, re-measure in case the container was 0×0 at init.
      map.resize();
      setReady(true);
    });

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(sizeCheckTimer);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // Init once; data is pushed via the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, retryNonce]);

  // ── push route data + fit ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource(ROUTES_SRC) as GeoJSONSource)?.setData(lines);
    (map.getSource(TRAILHEADS_SRC) as GeoJSONSource)?.setData(trailheads);
    if (!draw) {
      const b = boundsOf(routes);
      if (b) map.fitBounds(b, { padding: single ? 48 : 56, maxZoom: single ? 14 : 11, duration: 600 });
    }
  }, [ready, lines, trailheads, routes, single, draw]);

  // ── keep cursor in sync with draw mode ──────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.getCanvas().style.cursor = draw ? 'crosshair' : '';
  }, [draw, ready]);

  // ── follow a live position (GPS recording) ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !recenterTo) return;
    if (!recenteredOnceRef.current) {
      recenteredOnceRef.current = true;
      map.flyTo({ center: recenterTo, zoom: 15, duration: 800 });
    } else {
      map.easeTo({ center: recenterTo, duration: 600 });
    }
  }, [ready, recenterTo]);

  // ── push draw overlays ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const ptsFC: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: drawPoints.map((p) => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: p },
      })),
    };
    (map.getSource(DRAW_PTS_SRC) as GeoJSONSource)?.setData(ptsFC);

    const lineCoords = drawGeometry?.coordinates?.length ? drawGeometry.coordinates : drawPoints;
    const lineFC: GeoJSON.FeatureCollection =
      lineCoords.length > 1
        ? {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: lineCoords } }],
          }
        : emptyFC();
    (map.getSource(DRAW_LINE_SRC) as GeoJSONSource)?.setData(lineFC);
  }, [ready, drawPoints, drawGeometry]);

  // Start/end markers for single-route mode.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !single?.geometry || single.geometry.coordinates.length < 2) return;
    const coords = single.geometry.coordinates;
    const start = coords[0];
    const end = coords[coords.length - 1];
    const mk = (c: number[], color: string) =>
      new maplibregl.Marker({ color }).setLngLat([c[0], c[1]]).addTo(map);
    const markers = [mk(start, START_COLOR), mk(end, END_COLOR)];
    return () => markers.forEach((m) => m.remove());
  }, [ready, single]);

  if (!configured) {
    return (
      <div
        className={`relative grid place-items-center rounded-3xl bg-gradient-to-b from-emerald-50 to-emerald-100 ring-1 ring-emerald-100 text-center px-6 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-emerald-700">
          <MapIcon size={26} />
          <p className="text-sm font-bold">Map needs a tile key</p>
          <p className="text-xs text-emerald-600/80 max-w-[15rem]">
            Set <code className="font-mono">VITE_MAPTILER_KEY</code> in <code className="font-mono">.env</code> to enable
            the interactive map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative overflow-hidden rounded-3xl ${className}`}>
      {/* ROOT-CAUSE NOTE: maplibre-gl.css sets `.maplibregl-map { position: relative }`
          on this element and loads AFTER Tailwind, overriding `absolute` — which made
          `inset-0` stop sizing it (height collapsed to 0 → invisible map). Inline
          styles win over any stylesheet order, so size it explicitly. */}
      <div ref={containerRef} className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      {initError && (
        <div className="absolute inset-0 grid place-items-center bg-emerald-50/95 px-6 text-center text-emerald-700">
          <div className="flex flex-col items-center gap-2">
            <MapIcon size={24} />
            <p className="text-sm font-bold">Map couldn’t start</p>
            <p className="max-w-[17rem] text-xs text-emerald-600/80">
              Your browser blocked the map renderer (WebGL). Try opening Dayla in Chrome or Safari directly.
            </p>
            <p className="max-w-[17rem] text-[10px] text-emerald-600/60 font-mono break-all">{initError}</p>
          </div>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 grid place-items-center bg-emerald-50/95 px-6 text-center text-emerald-700">
          <div className="flex flex-col items-center gap-2">
            <MapIcon size={24} />
            <p className="text-sm font-bold">Map couldn’t load</p>
            <p className="max-w-[17rem] text-xs text-emerald-600/80">
              The map tile key was rejected (403). Add{' '}
              <code className="font-mono font-bold">{typeof window !== 'undefined' ? window.location.hostname : 'this origin'}</code>{' '}
              to the key’s allowed origins (HTTP referrers) in your MapTiler dashboard — entries are hostname-only, no
              protocol or trailing slash.
            </p>
            <button
              type="button"
              onClick={() => {
                setLoadError(false);
                setRetryNonce((n) => n + 1);
              }}
              className="mt-1 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
