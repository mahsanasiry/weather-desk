import { round, unitLabels, weekdayLong, weekdayShort } from "@/lib/format";
import { describeWeather } from "@/lib/weather";
import type { Forecast, Units } from "@/lib/types";

interface DailyForecastProps {
  data: Forecast;
  units: Units;
}

export default function DailyForecast({ data, units }: DailyForecastProps) {
  const { daily } = data;
  const labels = unitLabels(units);

  const weekMin = Math.min(...daily.temperature_2m_min);
  const weekMax = Math.max(...daily.temperature_2m_max);
  const span = weekMax - weekMin || 1;

  return (
    <section aria-labelledby="daily-heading" className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 id="daily-heading" className="text-xl font-bold text-slate-900">
        7-day forecast
      </h2>

      <ul className="mt-4 divide-y divide-slate-200">
        {daily.time.map((date, i) => {
          const condition = describeWeather(daily.weather_code[i]);
          const low = daily.temperature_2m_min[i];
          const high = daily.temperature_2m_max[i];
          const left = ((low - weekMin) / span) * 100;
          const width = Math.max(4, ((high - low) / span) * 100);

          return (
            <li
              key={date}
              className="grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[5rem_11rem_1fr_4.5rem]"
            >
              <span className="font-semibold text-slate-900">
                <span aria-hidden="true">{i === 0 ? "Today" : weekdayShort(date)}</span>
                <span className="sr-only">{weekdayLong(date)}</span>
              </span>

              <span className="flex items-center gap-2 text-slate-700">
                <span aria-hidden="true" className="text-2xl">
                  {condition.icon}
                </span>
                {condition.label}
              </span>

              <span className="col-span-2 flex items-center gap-3 sm:col-span-1">
                <span className="w-10 text-right tabular-nums text-slate-600">
                  {round(low)}
                  {labels.temp}
                </span>
                <span aria-hidden="true" className="relative h-2 flex-1 rounded-full bg-slate-200">
                  <span
                    className="absolute h-2 rounded-full bg-gradient-to-r from-sky-400 to-orange-400"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </span>
                <span className="w-10 tabular-nums font-semibold text-slate-900">
                  {round(high)}
                  {labels.temp}
                </span>
              </span>

              <span className="hidden text-right text-sm tabular-nums text-slate-600 sm:block">
                {daily.precipitation_sum[i]} {labels.rain}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
