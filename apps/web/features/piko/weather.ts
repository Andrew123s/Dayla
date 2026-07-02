/**
 * Live weather for a trailhead via Open-Meteo (free, no API key — the
 * recommended Piko weather source). Resilient: returns null on any failure so
 * callers fall back to the route's static weatherScore.
 */

export interface LiveWeather {
  tempC: number;
  windKmh: number;
  precipMm: number;
  code: number;
  label: string;
  /** 0–100 suitability score derived from the live conditions. */
  score: number;
}

// Condensed WMO weather-code → human label map.
function codeLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Mostly clear';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

// Suitability: pleasant + dry + calm scores high; wet/cold/windy/stormy lower.
function suitability(tempC: number, windKmh: number, precipMm: number, code: number): number {
  let s = 100;
  if (precipMm > 0) s -= Math.min(40, precipMm * 12);
  if (code >= 95) s -= 40; // thunderstorm
  else if (code >= 71 && code <= 77) s -= 25; // snow
  if (tempC < 0) s -= 25;
  else if (tempC < 6) s -= 12;
  else if (tempC > 30) s -= 18;
  if (windKmh > 40) s -= 20;
  else if (windKmh > 25) s -= 10;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export async function fetchLiveWeather(lat: number, lng: number): Promise<LiveWeather | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
      `&current=temperature_2m,precipitation,weather_code,wind_speed_10m`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const c = data?.current;
    if (!c) return null;
    const tempC = Math.round(c.temperature_2m);
    const windKmh = Math.round(c.wind_speed_10m);
    const precipMm = c.precipitation ?? 0;
    const code = c.weather_code ?? 0;
    return {
      tempC,
      windKmh,
      precipMm,
      code,
      label: codeLabel(code),
      score: suitability(tempC, windKmh, precipMm, code),
    };
  } catch {
    return null;
  }
}
