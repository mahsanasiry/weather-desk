import type { UnitLabels, Units } from "./types";

export function unitLabels(units: Units): UnitLabels {
  return units === "metric"
    ? { temp: "°C", wind: "km/h", rain: "mm" }
    : { temp: "°F", wind: "mph", rain: "in" };
}

// The API gives local times like "2026-10-01T14:15". We read the text directly,
// so the result never shifts with the visitor's own time zone.

function to12Hour(hour: number): { h: number; suffix: string } {
  return { h: hour % 12 === 0 ? 12 : hour % 12, suffix: hour >= 12 ? "pm" : "am" };
}

export function formatHour(time: string): string {
  const { h, suffix } = to12Hour(Number(time.slice(11, 13)));
  return `${h} ${suffix}`;
}

export function formatClock(time: string): string {
  const { h, suffix } = to12Hour(Number(time.slice(11, 13)));
  return `${h}:${time.slice(14, 16)} ${suffix}`;
}

export function weekdayShort(date: string): string {
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

export function weekdayLong(date: string): string {
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function round(value: number): number {
  return Math.round(value);
}
