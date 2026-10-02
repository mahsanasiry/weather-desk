import type { Forecast, Place, Units } from "./types";

// Open-Meteo: free, no API key, and it allows requests straight from the browser (CORS).
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class ApiError extends Error {}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError(
      "Could not reach the weather service. Check your internet connection and try again.",
    );
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 429
        ? "Too many requests. Wait a minute and try again."
        : `The weather service returned an error (${response.status}). Try again in a moment.`,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("The weather service sent a response we could not read.");
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({
    name: query,
    count: "6",
    language: "en",
    format: "json",
  });
  const data = await getJson<{ results?: GeocodingResult[] }>(`${GEOCODING_URL}?${params}`, signal);

  // When nothing matches, the API leaves "results" out completely.
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1,
    country: r.country ?? "",
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function fetchForecast(
  place: Place,
  units: Units,
  signal?: AbortSignal,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day",
    hourly: "temperature_2m,precipitation_probability",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset",
    timezone: "auto", // times come back in the place's own local time
    forecast_days: "7",
    temperature_unit: units === "metric" ? "celsius" : "fahrenheit",
    wind_speed_unit: units === "metric" ? "kmh" : "mph",
    precipitation_unit: units === "metric" ? "mm" : "inch",
  });

  return getJson<Forecast>(`${FORECAST_URL}?${params}`, signal);
}
