export type Units = "metric" | "imperial";

export interface Place {
  id: number;
  name: string;
  admin1?: string; // state or region
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  time: string; // local time at the place, e.g. "2026-10-01T14:15"
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  is_day: number; // 1 = day, 0 = night
}

// Open-Meteo returns lists as parallel arrays: time[i] belongs to temperature_2m[i], and so on.
export interface Forecast {
  timezone: string;
  current: CurrentWeather;
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export type ForecastState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Forecast };

export interface UnitLabels {
  temp: string;
  wind: string;
  rain: string;
}
