
# Weather Desk: a weather dashboard in Next.js and TypeScript

Search any city and see the current conditions, an hourly temperature chart and a 7-day forecast.
Built with **Next.js 14**, **TypeScript** and **Tailwind CSS**, exported as a static site.
It uses the free [Open-Meteo](https://open-meteo.com/) API: no API key and no backend.

## Features

- City search with live suggestions (debounced, keyboard accessible combobox)
- Current conditions: temperature, feels like, humidity, wind, rain, sunrise and sunset
- Hourly temperature chart drawn with plain SVG (no chart library), with chance-of-rain bars,
  a 24 / 48 / 72 hour range filter, and a readout that follows the mouse, touch or arrow keys
- 7-day forecast with a temperature range bar for each day
- Celsius and Fahrenheit toggle (the API converts the units)
- Save favorite cities; settings are kept in the browser
- Loading skeletons, friendly error messages with a "Try again" button
- Cancels outdated requests (`AbortController`) so a slow response never replaces a newer one

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

The static site is created in the `out` folder.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` and publishes the site at
   `http://mahsanasiry.github.io/weather-desk/`.

## Project structure

```
src/
  app/          layout, page, global styles
  components/   Dashboard, SearchBox, CurrentCard, HourlyChart, DailyForecast, ...
  lib/
    api.ts      requests to Open-Meteo (geocoding and forecast) with error handling
    types.ts    TypeScript types for the API data
    weather.ts  weather codes to text and icons
    format.ts   time and unit formatting
    storage.ts  saving settings in localStorage
```

## Data

Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under CC BY 4.0.
Open-Meteo is free for non-commercial use.
