import { formatClock, round, unitLabels } from "@/lib/format";
import { formatPlace } from "@/lib/places";
import { describeWeather } from "@/lib/weather";
import type { Forecast, Place, Units } from "@/lib/types";

interface CurrentCardProps {
  place: Place;
  data: Forecast;
  units: Units;
  isSaved: boolean;
  onToggleSave: () => void;
}

export default function CurrentCard({ place, data, units, isSaved, onToggleSave }: CurrentCardProps) {
  const { current, daily } = data;
  const labels = unitLabels(units);
  const condition = describeWeather(current.weather_code, current.is_day === 1);

  const details = [
    { term: "Feels like", value: `${round(current.apparent_temperature)}${labels.temp}` },
    { term: "Humidity", value: `${round(current.relative_humidity_2m)}%` },
    { term: "Wind", value: `${round(current.wind_speed_10m)} ${labels.wind}` },
    { term: "Rain now", value: `${current.precipitation} ${labels.rain}` },
    { term: "Sunrise", value: formatClock(daily.sunrise[0]) },
    { term: "Sunset", value: formatClock(daily.sunset[0]) },
  ];

  return (
    <section aria-labelledby="current-heading" className="rounded-lg bg-sky-950 p-6 text-white sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="current-heading" className="text-xl font-bold leading-snug">
            {formatPlace(place)}
          </h2>
          <p className="mt-1 text-sm text-sky-200">Local time {formatClock(current.time)}</p>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${place.name} from saved places` : `Save ${place.name}`}
          className="shrink-0 rounded-md p-2 hover:bg-sky-900"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "#fbbf24" : "none"} stroke={isSaved ? "#fbbf24" : "currentColor"} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z" />
          </svg>
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <p className="text-7xl font-extrabold tabular-nums leading-none sm:text-8xl">
          {round(current.temperature_2m)}
          <span className="align-top text-4xl font-bold text-sky-200">{labels.temp}</span>
        </p>
        <div>
          <p className="text-5xl" aria-hidden="true">
            {condition.icon}
          </p>
          <p className="mt-1 text-lg font-semibold">{condition.label}</p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
        {details.map((item) => (
          <div key={item.term} className="flex justify-between gap-3 border-t border-sky-800 py-3">
            <dt className="text-sky-200">{item.term}</dt>
            <dd className="font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
