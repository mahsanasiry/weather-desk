import type { Place } from "./types";

export const DEFAULT_PLACE: Place = {
  id: 2643743,
  name: "London",
  admin1: "England",
  country: "United Kingdom",
  latitude: 51.50853,
  longitude: -0.12574,
};

// "Berlin, Germany" or "Portland, Oregon, United States"
export function formatPlace(place: Place): string {
  const parts = [place.name];
  if (place.admin1 && place.admin1 !== place.name) parts.push(place.admin1);
  parts.push(place.country);
  return parts.join(", ");
}

export function isPlace(value: unknown): value is Place {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.country === "string" &&
    typeof v.latitude === "number" &&
    typeof v.longitude === "number"
  );
}
