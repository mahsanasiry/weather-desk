import { formatPlace } from "@/lib/places";
import type { Place } from "@/lib/types";

interface SavedPlacesProps {
  saved: Place[];
  currentId: number;
  onSelect: (place: Place) => void;
  onRemove: (place: Place) => void;
}

export default function SavedPlaces({ saved, currentId, onSelect, onRemove }: SavedPlacesProps) {
  if (saved.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        Press the star next to a city name to save it here for quick access.
      </p>
    );
  }

  return (
    <ul aria-label="Saved places" className="flex flex-wrap gap-2">
      {saved.map((place) => {
        const current = place.id === currentId;
        return (
          <li
            key={place.id}
            className={`flex items-center rounded-full border text-sm ${
              current ? "border-sky-900 bg-sky-900 text-white" : "border-slate-300 bg-white text-slate-800"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(place)}
              aria-current={current ? "true" : undefined}
              title={formatPlace(place)}
              className="rounded-l-full py-1.5 pl-3 pr-2 font-medium"
            >
              {place.name}
            </button>
            <button
              type="button"
              onClick={() => onRemove(place)}
              aria-label={`Remove ${place.name} from saved places`}
              className="rounded-r-full py-1.5 pl-1 pr-3 opacity-70 hover:opacity-100"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
