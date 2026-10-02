"use client";

import { useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatHour, round, weekdayShort } from "@/lib/format";

export interface HourPoint {
  time: string;
  temp: number;
  rain: number; // chance of rain, 0 to 100
}

interface HourlyChartProps {
  hours: HourPoint[];
  unitLabel: string;
}

const RANGES = [24, 48, 72] as const;

// Drawing area, in SVG units. The SVG scales to the width of its container.
const W = 720;
const H = 260;
const LEFT = 44;
const RIGHT = 16;
const TOP = 16;
const BOTTOM = 36;
const PLOT_W = W - LEFT - RIGHT;
const PLOT_H = H - TOP - BOTTOM;

export default function HourlyChart({ hours, unitLabel }: HourlyChartProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(24);
  const [active, setActive] = useState<number | null>(null);

  const points = useMemo(() => hours.slice(0, range), [hours, range]);
  const n = points.length;
  if (n < 2) return null;

  const temps = points.map((p) => p.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const lo = Math.floor(min - 1);
  const hi = Math.ceil(max + 1);

  const x = (i: number) => LEFT + (i / (n - 1)) * PLOT_W;
  const y = (value: number) => TOP + (1 - (value - lo) / (hi - lo)) * PLOT_H;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.temp).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)} ${TOP + PLOT_H} L${x(0).toFixed(1)} ${TOP + PLOT_H} Z`;

  const yTicks = [0, 1, 2, 3].map((k) => lo + ((hi - lo) * k) / 3);
  const labelEvery = range === 24 ? 3 : range === 48 ? 6 : 12;
  const barWidth = Math.max(2, (PLOT_W / n) * 0.6);

  const shownIndex = active ?? 0;
  const shown = points[shownIndex];
  const readoutTitle =
    shownIndex === 0
      ? "Now"
      : `${weekdayShort(shown.time.slice(0, 10))} ${formatHour(shown.time)}`;

  function indexFromPointer(e: PointerEvent<SVGSVGElement>): number {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - LEFT) / PLOT_W) * (n - 1));
    return Math.min(n - 1, Math.max(0, i));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((i) => Math.min(n - 1, (i ?? -1) + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((i) => Math.max(0, (i ?? 1) - 1));
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  return (
    <section aria-labelledby="hourly-heading" className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="hourly-heading" className="text-xl font-bold text-slate-900">
          Hourly temperature
        </h2>
        <div role="group" aria-label="Time range" className="inline-flex rounded-md border border-slate-300 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => {
                setRange(r);
                setActive(null);
              }}
              className={`rounded px-3 py-1.5 text-sm font-semibold ${
                range === r ? "bg-sky-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {r} hours
            </button>
          ))}
        </div>
      </div>

      {/* The readout follows the mouse, the finger or the arrow keys. */}
      <p aria-live="polite" className="mt-4 min-h-6 text-slate-800">
        <span className="font-bold">{readoutTitle}:</span>{" "}
        <span className="tabular-nums">
          {round(shown.temp)}
          {unitLabel}
        </span>
        , <span className="tabular-nums">{shown.rain}%</span> chance of rain
      </p>

      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onBlur={() => setActive(null)}
        aria-label="Hourly temperature chart. Use the left and right arrow keys to read each hour."
        className="mt-2 rounded-md"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Temperature for the next ${n} hours, from ${round(min)} to ${round(max)} ${unitLabel}`}
          className="h-auto w-full touch-pan-y"
          onPointerMove={(e) => setActive(indexFromPointer(e))}
          onPointerDown={(e) => setActive(indexFromPointer(e))}
          onPointerLeave={() => setActive(null)}
        >
          {/* Grid lines and temperature labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={LEFT} x2={W - RIGHT} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" strokeWidth="1" />
              <text x={LEFT - 8} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="#475569">
                {round(tick)}°
              </text>
            </g>
          ))}

          {/* Chance of rain as thin bars at the bottom */}
          {points.map((p, i) => (
            <rect
              key={p.time}
              x={x(i) - barWidth / 2}
              y={TOP + PLOT_H - (p.rain / 100) * 48}
              width={barWidth}
              height={(p.rain / 100) * 48}
              fill="#7dd3fc"
              opacity="0.55"
            />
          ))}

          {/* Temperature */}
          <path d={area} fill="#0369a1" opacity="0.1" />
          <path d={line} fill="none" stroke="#0369a1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

          {/* Time labels */}
          {points.map((p, i) => {
            const hour = Number(p.time.slice(11, 13));
            if (hour % labelEvery !== 0) return null;
            return (
              <text key={p.time} x={x(i)} y={H - 12} textAnchor="middle" fontSize="12" fill="#475569">
                {hour === 0 ? weekdayShort(p.time.slice(0, 10)) : formatHour(p.time)}
              </text>
            );
          })}

          {/* Marker for the hour being read */}
          {active !== null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={TOP} y2={TOP + PLOT_H} stroke="#0c4a6e" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx={x(active)} cy={y(points[active].temp)} r="6" fill="#0c4a6e" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>

      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
        <span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm bg-sky-300" />
        Light blue bars show the chance of rain.
      </p>
    </section>
  );
}
