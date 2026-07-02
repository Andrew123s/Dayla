import { Route } from './types';
import { makeLine } from './geo';

/** Real trailhead coordinates [lat, lng], keyed by route id. */
const COORDS: Record<string, [number, number]> = {
  'morskie-oko': [49.262, 20.108],
  giewont: [49.272, 19.981],
  koscieliska: [49.273, 19.87],
  'path-of-the-gods': [40.638, 14.565],
  'tre-cime': [46.617, 12.295],
  'cinque-terre-blue': [44.146, 9.654],
  'calanques-cassis': [43.215, 5.539],
  'verdon-blanc-martel': [43.793, 6.367],
  'caminito-del-rey': [36.908, -4.794],
  'montserrat-sant-jeroni': [41.594, 1.838],
  'eiger-trail': [46.577, 8.02],
  'five-lakes-zermatt': [46.02, 7.78],
  'adlerweg-tyrol': [47.408, 11.475],
  'partnach-gorge': [47.477, 11.118],
  'zugspitze-hollental': [47.477, 11.022],
  trolltunga: [60.124, 6.741],
  preikestolen: [58.988, 6.136],
  'arthurs-seat': [55.944, -3.162],
  'old-man-storr': [57.507, -6.18],
  reykjadalur: [64.022, -21.222],
  'levada-25-fontes': [32.759, -17.131],
  'angels-landing': [37.259, -112.951],
  'bright-angel': [36.057, -112.144],
  'bear-mountain-loop': [41.312, -73.988],
  'six-glaciers': [51.417, -116.218],
  'grouse-grind': [49.37, -123.082],
  'nevado-toluca': [19.108, -99.758],
};

/**
 * Seed routes for Piko — real, existing trails across Europe and the Americas
 * (Phase 1 "curated" seed). These are genuine, well-known routes, not invented
 * ones, spread across many countries so the location selector has real depth.
 *
 * No engagement data (likes / saves / ratings) is seeded: those start at zero
 * and accumulate in real time once people use the app.
 *
 * Photos cycle through a small pool of representative landscape images.
 */
const IMG = [
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1444090542259-0af8fa96557e?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=1200',
];
const img = (i: number): string[] => [IMG[i % IMG.length], IMG[(i + 5) % IMG.length]];

interface Seed {
  id: string;
  title: string;
  country: string;
  location: string;
  description: string;
  difficulty: Route['difficulty'];
  distanceKm: number;
  elevationGainM: number;
  estimatedDurationMins: number;
  tags: string[];
  ecoScore: number;
  weatherScore: number;
  accessibilityScore: number;
  transport: string;
  co2: number;
  greener: string[];
}

const SEEDS: Seed[] = [
  // ───────── Poland ─────────
  {
    id: 'morskie-oko', title: 'Morskie Oko', country: 'Poland', location: 'Tatra National Park · Poland',
    description: 'The classic walk to Poland’s most famous glacial lake, on a steady well-surfaced road through the valley to the "Eye of the Sea". Reachable by bus from Zakopane.',
    difficulty: 'easy', distanceKm: 9.5, elevationGainM: 430, estimatedDurationMins: 150,
    tags: ['Lake', 'Public Transport', 'Family', 'Group Friendly'], ecoScore: 94, weatherScore: 88, accessibilityScore: 82,
    transport: 'Bus from Zakopane', co2: 1.1, greener: ['Cycle the valley road', 'Shared minibus'],
  },
  {
    id: 'giewont', title: 'Giewont', country: 'Poland', location: 'Zakopane · Poland',
    description: 'Zakopane’s iconic "Sleeping Knight", topped by a 15-metre summit cross. A demanding climb from Kuźnice with a chained final section near the top.',
    difficulty: 'hard', distanceKm: 11.2, elevationGainM: 935, estimatedDurationMins: 300,
    tags: ['Summit', 'Iconic', 'Challenging', 'Views'], ecoScore: 90, weatherScore: 66, accessibilityScore: 38,
    transport: 'Bus to Kuźnice', co2: 0.9, greener: ['Walk in from Zakopane centre'],
  },
  {
    id: 'koscieliska', title: 'Kościeliska Valley', country: 'Poland', location: 'Tatra National Park · Poland',
    description: 'A gentle, scenic valley walk past limestone cliffs and meadows. Mostly flat and stroller-friendly, one of the most accessible routes in the Tatras.',
    difficulty: 'easy', distanceKm: 8.0, elevationGainM: 150, estimatedDurationMins: 140,
    tags: ['Valley', 'Accessible', 'Family', 'Group Friendly'], ecoScore: 96, weatherScore: 90, accessibilityScore: 92,
    transport: 'Bus to Kiry', co2: 1.0, greener: ['Cycle from Zakopane'],
  },

  // ───────── Italy ─────────
  {
    id: 'path-of-the-gods', title: 'Path of the Gods', country: 'Italy', location: 'Amalfi Coast · Italy',
    description: 'The Sentiero degli Dei traverses high above the Amalfi Coast, with dizzying views over the Tyrrhenian Sea, terraced vineyards and the isle of Capri.',
    difficulty: 'moderate', distanceKm: 7.8, elevationGainM: 500, estimatedDurationMins: 180,
    tags: ['Coastal', 'Views', 'Iconic', 'Group Friendly'], ecoScore: 91, weatherScore: 86, accessibilityScore: 45,
    transport: 'SITA bus to Bomerano', co2: 1.0, greener: ['Ferry + bus combo'],
  },
  {
    id: 'tre-cime', title: 'Tre Cime di Lavaredo Loop', country: 'Italy', location: 'Dolomites · Italy',
    description: 'A loop around the three unmistakable peaks of the Dolomites, past alpine refuges and war-history tunnels. Big scenery for a moderate effort.',
    difficulty: 'moderate', distanceKm: 10.0, elevationGainM: 400, estimatedDurationMins: 210,
    tags: ['Dolomites', 'Loop', 'Views', 'Group Friendly'], ecoScore: 88, weatherScore: 80, accessibilityScore: 50,
    transport: 'Bus to Auronzo refuge', co2: 1.4, greener: ['Shared shuttle from Misurina'],
  },
  {
    id: 'cinque-terre-blue', title: 'Cinque Terre Blue Trail', country: 'Italy', location: 'Cinque Terre · Italy',
    description: 'The coastal path linking the five pastel fishing villages, hopping between harbours, vineyards and clifftops. Easily broken up using the regional train.',
    difficulty: 'easy', distanceKm: 11.0, elevationGainM: 500, estimatedDurationMins: 240,
    tags: ['Coastal', 'Villages', 'Public Transport', 'Group Friendly'], ecoScore: 90, weatherScore: 85, accessibilityScore: 40,
    transport: 'Regional train', co2: 0.6, greener: ['Train hop between villages'],
  },

  // ───────── France ─────────
  {
    id: 'calanques-cassis', title: 'Calanques de Cassis', country: 'France', location: 'Calanques NP · France',
    description: 'A rugged coastal walk from Cassis to the turquoise inlets of En-Vau and Port-Pin, framed by white limestone cliffs and pine. Reachable by bus from Marseille.',
    difficulty: 'moderate', distanceKm: 9.0, elevationGainM: 350, estimatedDurationMins: 195,
    tags: ['Coastal', 'Cliffs', 'Views', 'Group Friendly'], ecoScore: 89, weatherScore: 82, accessibilityScore: 35,
    transport: 'Bus from Marseille', co2: 0.9, greener: ['Boat shuttle to calanque'],
  },
  {
    id: 'verdon-blanc-martel', title: 'Gorges du Verdon: Blanc-Martel', country: 'France', location: 'Verdon Gorge · France',
    description: 'Europe’s grandest canyon on the famous Blanc-Martel trail, through tunnels (bring a torch), ladders and emerald pools far below the rim.',
    difficulty: 'hard', distanceKm: 14.0, elevationGainM: 700, estimatedDurationMins: 330,
    tags: ['Canyon', 'Challenging', 'Views'], ecoScore: 85, weatherScore: 76, accessibilityScore: 28,
    transport: 'Navette shuttle bus', co2: 1.2, greener: ['Seasonal shuttle navette'],
  },

  // ───────── Spain ─────────
  {
    id: 'caminito-del-rey', title: 'Caminito del Rey', country: 'Spain', location: 'El Chorro · Spain',
    description: 'The restored "King’s Little Path" clings to a sheer gorge wall on boardwalks 100 m above the river. A one-way, ticketed route reachable by train.',
    difficulty: 'moderate', distanceKm: 7.7, elevationGainM: 250, estimatedDurationMins: 150,
    tags: ['Gorge', 'Walkway', 'Iconic', 'Public Transport'], ecoScore: 90, weatherScore: 88, accessibilityScore: 48,
    transport: 'Train to El Chorro', co2: 0.7, greener: ['Walk back to station'],
  },
  {
    id: 'montserrat-sant-jeroni', title: 'Montserrat: Sant Jeroni', country: 'Spain', location: 'Montserrat · Spain',
    description: 'A climb to the highest point of the serrated Montserrat massif, with views over Catalonia and the famous monastery. Reachable by train and rack railway.',
    difficulty: 'moderate', distanceKm: 8.5, elevationGainM: 600, estimatedDurationMins: 210,
    tags: ['Summit', 'Monastery', 'Views', 'Group Friendly'], ecoScore: 89, weatherScore: 84, accessibilityScore: 42,
    transport: 'Train + rack railway', co2: 0.8, greener: ['Cremallera rack railway'],
  },

  // ───────── Switzerland ─────────
  {
    id: 'eiger-trail', title: 'Eiger Trail', country: 'Switzerland', location: 'Grindelwald · Switzerland',
    description: 'A dramatic path running directly beneath the Eiger North Face, from Eigergletscher down to Alpiglen. Pure alpine theatre, reachable entirely by train.',
    difficulty: 'moderate', distanceKm: 6.0, elevationGainM: 250, estimatedDurationMins: 165,
    tags: ['Alpine', 'Views', 'Iconic', 'Public Transport'], ecoScore: 92, weatherScore: 78, accessibilityScore: 40,
    transport: 'Train to Eigergletscher', co2: 0.5, greener: ['Cog railway both ways'],
  },
  {
    id: 'five-lakes-zermatt', title: 'Five Lakes Walk', country: 'Switzerland', location: 'Zermatt · Switzerland',
    description: 'The 5-Seenweg links five alpine lakes above Zermatt, three of which mirror the Matterhorn on a still day. Accessed by cable car from the car-free village.',
    difficulty: 'moderate', distanceKm: 9.3, elevationGainM: 600, estimatedDurationMins: 240,
    tags: ['Lakes', 'Alpine', 'Views', 'Group Friendly'], ecoScore: 90, weatherScore: 80, accessibilityScore: 45,
    transport: 'Train + cable car', co2: 0.6, greener: ['Car-free Zermatt access'],
  },

  // ───────── Austria ─────────
  {
    id: 'adlerweg-tyrol', title: 'Eagle Walk: Karwendel Stage', country: 'Austria', location: 'Tyrol · Austria',
    description: 'A signature stage of Tyrol’s Adlerweg through the Karwendel range, with limestone walls, high pastures and a classic mountain hut for lunch.',
    difficulty: 'moderate', distanceKm: 12.0, elevationGainM: 700, estimatedDurationMins: 300,
    tags: ['Alpine', 'Long Distance', 'Views'], ecoScore: 88, weatherScore: 75, accessibilityScore: 40,
    transport: 'Train to Tyrol valley', co2: 0.7, greener: ['Postbus to trailhead'],
  },

  // ───────── Germany ─────────
  {
    id: 'partnach-gorge', title: 'Partnach Gorge', country: 'Germany', location: 'Garmisch · Germany',
    description: 'A short, spectacular walk through a deep gorge carved by the Partnach, past waterfalls and ice formations. Family-friendly and reachable by train.',
    difficulty: 'easy', distanceKm: 4.5, elevationGainM: 120, estimatedDurationMins: 90,
    tags: ['Gorge', 'Family', 'Accessible', 'Group Friendly'], ecoScore: 93, weatherScore: 88, accessibilityScore: 70,
    transport: 'Train to Garmisch', co2: 0.6, greener: ['Walk in from the ski stadium'],
  },
  {
    id: 'zugspitze-hollental', title: 'Zugspitze via Höllental', country: 'Germany', location: 'Bavarian Alps · Germany',
    description: 'A serious, exposed ascent of Germany’s highest peak through the Höllental, with a via-ferrata section and a glacier crossing. For experienced hikers only.',
    difficulty: 'hard', distanceKm: 21.0, elevationGainM: 2200, estimatedDurationMins: 600,
    tags: ['Summit', 'Alpine', 'Challenging'], ecoScore: 83, weatherScore: 60, accessibilityScore: 20,
    transport: 'Train to Hammersbach', co2: 0.9, greener: ['Descend by cog railway'],
  },

  // ───────── Norway ─────────
  {
    id: 'trolltunga', title: 'Trolltunga', country: 'Norway', location: 'Odda · Norway',
    description: 'The "Troll’s Tongue" juts out 700 m above Lake Ringedalsvatnet. A long, strenuous day for one of the most jaw-dropping viewpoints in Scandinavia.',
    difficulty: 'hard', distanceKm: 28.0, elevationGainM: 1200, estimatedDurationMins: 600,
    tags: ['Cliff', 'Iconic', 'Challenging', 'Views'], ecoScore: 86, weatherScore: 62, accessibilityScore: 22,
    transport: 'Bus to Skjeggedal', co2: 1.3, greener: ['Shuttle bus to upper car park'],
  },
  {
    id: 'preikestolen', title: 'Preikestolen', country: 'Norway', location: 'Stavanger · Norway',
    description: 'The flat-topped Pulpit Rock towers 600 m above the Lysefjord. A well-built, hugely popular trail reachable by ferry and bus from Stavanger.',
    difficulty: 'moderate', distanceKm: 8.0, elevationGainM: 500, estimatedDurationMins: 210,
    tags: ['Cliff', 'Iconic', 'Views', 'Group Friendly'], ecoScore: 89, weatherScore: 78, accessibilityScore: 45,
    transport: 'Ferry + bus', co2: 1.0, greener: ['Public ferry from Stavanger'],
  },

  // ───────── United Kingdom ─────────
  {
    id: 'arthurs-seat', title: 'Arthur’s Seat', country: 'United Kingdom', location: 'Edinburgh · Scotland',
    description: 'An extinct volcano rising straight out of central Edinburgh, with a short climb to a 360° view over the city and the Firth of Forth. Walkable from the centre.',
    difficulty: 'easy', distanceKm: 4.0, elevationGainM: 250, estimatedDurationMins: 90,
    tags: ['City', 'Views', 'Public Transport', 'Group Friendly'], ecoScore: 95, weatherScore: 80, accessibilityScore: 65,
    transport: 'Walk from city centre', co2: 0.2, greener: ['Zero-emission city walk'],
  },
  {
    id: 'old-man-storr', title: 'Old Man of Storr', country: 'United Kingdom', location: 'Isle of Skye · Scotland',
    description: 'A steep pull up to the surreal rock pinnacles of the Storr, with the Sound of Raasay glittering below. One of Skye’s most photographed landscapes.',
    difficulty: 'moderate', distanceKm: 5.5, elevationGainM: 320, estimatedDurationMins: 150,
    tags: ['Iconic', 'Views', 'Coastal'], ecoScore: 88, weatherScore: 70, accessibilityScore: 45,
    transport: 'Bus from Portree', co2: 0.9, greener: ['Stagecoach bus to trailhead'],
  },

  // ───────── Iceland ─────────
  {
    id: 'reykjadalur', title: 'Reykjadalur Hot Spring', country: 'Iceland', location: 'Hveragerði · Iceland',
    description: 'A walk up a steaming geothermal valley to a warm river you can bathe in. Bubbling mud pots and fumaroles line the way. An easy day trip from Reykjavík.',
    difficulty: 'moderate', distanceKm: 7.0, elevationGainM: 300, estimatedDurationMins: 180,
    tags: ['Hot Spring', 'Geothermal', 'Views', 'Group Friendly'], ecoScore: 90, weatherScore: 70, accessibilityScore: 45,
    transport: 'Bus from Reykjavík', co2: 1.1, greener: ['Shared bus tour'],
  },

  // ───────── Portugal ─────────
  {
    id: 'levada-25-fontes', title: 'Levada das 25 Fontes', country: 'Portugal', location: 'Madeira · Portugal',
    description: 'A gentle level walk along a historic irrigation channel through Madeira’s laurel forest to a green amphitheatre fed by 25 springs and waterfalls.',
    difficulty: 'easy', distanceKm: 9.0, elevationGainM: 200, estimatedDurationMins: 180,
    tags: ['Levada', 'Waterfalls', 'Family', 'Group Friendly'], ecoScore: 91, weatherScore: 86, accessibilityScore: 60,
    transport: 'Bus from Funchal', co2: 1.0, greener: ['Shared transfer from Funchal'],
  },

  // ───────── United States ─────────
  {
    id: 'angels-landing', title: 'Angels Landing', country: 'United States', location: 'Zion NP, Utah · USA',
    description: 'A thrilling, chain-assisted climb to a narrow fin of rock high above Zion Canyon. Permit required; reached on the park’s free shuttle.',
    difficulty: 'hard', distanceKm: 8.7, elevationGainM: 460, estimatedDurationMins: 240,
    tags: ['Iconic', 'Cliff', 'Challenging', 'Views'], ecoScore: 80, weatherScore: 82, accessibilityScore: 25,
    transport: 'Park shuttle', co2: 0.8, greener: ['Zion electric shuttle'],
  },
  {
    id: 'bright-angel', title: 'Bright Angel Trail', country: 'United States', location: 'Grand Canyon, Arizona · USA',
    description: 'The Grand Canyon’s classic descent below the South Rim, switchbacking past Indian Garden. Turn around early — the climb out is the hard part.',
    difficulty: 'hard', distanceKm: 19.0, elevationGainM: 1340, estimatedDurationMins: 420,
    tags: ['Canyon', 'Iconic', 'Challenging'], ecoScore: 78, weatherScore: 85, accessibilityScore: 30,
    transport: 'Park shuttle', co2: 0.9, greener: ['Rim shuttle bus'],
  },
  {
    id: 'bear-mountain-loop', title: 'Bear Mountain Loop', country: 'United States', location: 'Hudson Valley, NY · USA',
    description: 'A rewarding loop above the Hudson River with views to the Manhattan skyline on clear days. A popular car-free escape reachable by train from the city.',
    difficulty: 'moderate', distanceKm: 6.5, elevationGainM: 350, estimatedDurationMins: 180,
    tags: ['Views', 'Forest', 'Public Transport', 'Group Friendly'], ecoScore: 86, weatherScore: 80, accessibilityScore: 55,
    transport: 'Train + trailhead bus', co2: 1.2, greener: ['Metro-North + bus'],
  },

  // ───────── Canada ─────────
  {
    id: 'six-glaciers', title: 'Plain of Six Glaciers', country: 'Canada', location: 'Banff, Alberta · Canada',
    description: 'From the turquoise shore of Lake Louise up toward the glaciers of Mount Victoria, finishing at a historic backcountry tea house. Iconic Rockies scenery.',
    difficulty: 'moderate', distanceKm: 13.8, elevationGainM: 600, estimatedDurationMins: 300,
    tags: ['Alpine', 'Glacier', 'Tea House', 'Views'], ecoScore: 88, weatherScore: 76, accessibilityScore: 45,
    transport: 'Park shuttle to Lake Louise', co2: 1.0, greener: ['Parks Canada shuttle'],
  },
  {
    id: 'grouse-grind', title: 'Grouse Grind', country: 'Canada', location: 'Vancouver, BC · Canada',
    description: 'Vancouver’s "Mother Nature’s Stairmaster" — a relentless 2.9 km climb up Grouse Mountain. Ride the gondola back down. Reachable by city bus.',
    difficulty: 'hard', distanceKm: 2.9, elevationGainM: 850, estimatedDurationMins: 120,
    tags: ['Steep', 'Fitness', 'Iconic', 'Public Transport'], ecoScore: 84, weatherScore: 78, accessibilityScore: 30,
    transport: 'Bus from Vancouver', co2: 0.5, greener: ['SeaBus + bus combo'],
  },

  // ───────── Mexico ─────────
  {
    id: 'nevado-toluca', title: 'Nevado de Toluca', country: 'Mexico', location: 'Toluca · Mexico',
    description: 'A high-altitude trek into the crater of an extinct volcano, ringed by jagged peaks and two sacred crater lakes — the Sun and the Moon. Acclimatise first.',
    difficulty: 'hard', distanceKm: 8.0, elevationGainM: 700, estimatedDurationMins: 240,
    tags: ['Volcano', 'Crater Lakes', 'Alpine'], ecoScore: 82, weatherScore: 68, accessibilityScore: 25,
    transport: 'Shared van from Toluca', co2: 1.3, greener: ['Group colectivo van'],
  },
];

export const pikoRoutes: Route[] = SEEDS.map((s, i) => {
  const coord = COORDS[s.id];
  const geometry = coord ? makeLine(coord, s.id) : undefined;
  return {
    id: s.id,
    type: 'curated',
    title: s.title,
    country: s.country,
    location: s.location,
    description: s.description,
    difficulty: s.difficulty,
    distanceKm: s.distanceKm,
    elevationGainM: s.elevationGainM,
    estimatedDurationMins: s.estimatedDurationMins,
    photos: img(i),
    tags: s.tags,
    ecoScore: s.ecoScore,
    weatherScore: s.weatherScore,
    accessibilityScore: s.accessibilityScore,
    ecoImpact: {
      transportMode: s.transport,
      co2EstimateKg: s.co2,
      greenerAlternatives: s.greener,
    },
    geometry,
    startPoint: coord ? [coord[1], coord[0]] : null,
    creatorName: 'Dayla',
    moderationStatus: 'approved',
  } as Route;
});
