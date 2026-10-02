"use client";

import { useEffect, useState } from "react";
import CurrentCard from "./CurrentCard";
import DailyForecast from "./DailyForecast";
import HourlyChart, { type HourPoint } from "./HourlyChart";
import SavedPlaces from "./SavedPlaces";
import SearchBox from "./SearchBox";
import { ErrorState, LoadingState } from "./StatusViews";
import UnitToggle from "./UnitToggle";
import { fetchForecast, isAbortError } from "@/lib/api";
import { unitLabels } from "@/lib/format";
import { DEFAULT_PLACE } from "@/lib/places";
import { loadPrefs, savePrefs } from "@/lib/storage";
import type { Forecast, ForecastState, Place, Units } from "@/lib/types";

const MAX_SAVED = 8;

// Hourly data starts at midnight today. Find the current hour and read onward from there.
function upcomingHours(data: Forecast): HourPoint[] {
  const currentHour = `${data.current.time.slice(0, 13)}:00`;
  const found = data.hourly.time.findIndex((t) => t >= currentHour);
  const start = found === -1 ? 0 : found;

  return data.hourly.time.slice(start).map((time, i) => ({
    time,
    temp: data.hourly.temperature_2m[start + i],
    rain: data.hourly.precipitation_probability[start + i] ?? 0,
  }));
}

export default function Dashboard() {
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE);
  const [units, setUnits] = useState<Units>("metric");
  const [saved, setSaved] = useState<Place[]>([]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const [forecast, setForecast] = useState<ForecastState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  // 1. Read saved settings once, in the browser.
  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.place) setPlace(prefs.place);
    if (prefs.units) setUnits(prefs.units);
    if (prefs.saved) setSaved(prefs.saved);
    setPrefsLoaded(true);
  }, []);

  // 2. Save settings whenever they change.
  useEffect(() => {
    if (prefsLoaded) savePrefs({ place, units, saved });
  }, [place, units, saved, prefsLoaded]);

  // 3. Load the forecast whenever the place or units change (or the visitor presses "Try again").
  useEffect(() => {
    if (!prefsLoaded) return;

    const controller = new AbortController();
    setForecast({ status: "loading" });

    fetchForecast(place, units, controller.signal)
      .then((data) => setForecast({ status: "ready", data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return; // a newer request replaced this one
        setForecast({
          status: "error",
          message: error instanceof Error ? error.message : "Something went wrong. Try again.",
        });
      });

    return () => controller.abort();
  }, [place, units, reloadKey, prefsLoaded]);

  const isSaved = saved.some((p) => p.id === place.id);

  function toggleSaved() {
    setSaved((list) =>
      list.some((p) => p.id === place.id)
        ? list.filter((p) => p.id !== place.id)
        : [place, ...list].slice(0, MAX_SAVED),
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-sky-950">Weather Desk</h1>
          <p className="mt-2 max-w-md text-slate-700">
            Search any city for the current weather, the next three days hour by hour, and a 7-day
            outlook.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox onSelect={setPlace} />
          <UnitToggle units={units} onChange={setUnits} />
        </div>
      </header>

      <div className="mt-6">
        <SavedPlaces
          saved={saved}
          currentId={place.id}
          onSelect={setPlace}
          onRemove={(p) => setSaved((list) => list.filter((item) => item.id !== p.id))}
        />
      </div>

      <div className="mt-8">
        {forecast.status === "loading" && <LoadingState />}

        {forecast.status === "error" && (
          <ErrorState message={forecast.message} onRetry={() => setReloadKey((k) => k + 1)} />
        )}

        {forecast.status === "ready" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <CurrentCard
              place={place}
              data={forecast.data}
              units={units}
              isSaved={isSaved}
              onToggleSave={toggleSaved}
            />
            <HourlyChart hours={upcomingHours(forecast.data)} unitLabel={unitLabels(units).temp} />
            <div className="lg:col-span-2">
              <DailyForecast data={forecast.data} units={units} />
            </div>
          </div>
        )}
      </div>

      <footer className="mt-10 border-t border-sky-200 pt-6 text-sm text-slate-600">
        Weather data by{" "}
        <a className="font-medium underline underline-offset-4 hover:text-sky-900" href="https://open-meteo.com/">
          Open-Meteo.com
        </a>{" "}
        (CC BY 4.0). Place search by the Open-Meteo geocoding API.
      </footer>
    </div>
  );
}
