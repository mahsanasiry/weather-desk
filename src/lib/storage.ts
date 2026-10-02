import { isPlace } from "./places";
import type { Place, Units } from "./types";

const KEY = "weatherdesk:v1";

export interface Prefs {
  place: Place;
  units: Units;
  saved: Place[];
}

export function loadPrefs(): Partial<Prefs> {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      place: isPlace(parsed.place) ? parsed.place : undefined,
      units: parsed.units === "imperial" || parsed.units === "metric" ? parsed.units : undefined,
      saved: Array.isArray(parsed.saved) ? parsed.saved.filter(isPlace) : undefined,
    };
  } catch {
    return {};
  }
}

export function savePrefs(prefs: Prefs): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage can be full or blocked (private mode). The app still works for this visit.
  }
}
