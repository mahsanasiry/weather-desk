import type { Units } from "@/lib/types";

interface UnitToggleProps {
  units: Units;
  onChange: (units: Units) => void;
}

const OPTIONS: { value: Units; label: string; name: string }[] = [
  { value: "metric", label: "°C", name: "Celsius" },
  { value: "imperial", label: "°F", name: "Fahrenheit" },
];

export default function UnitToggle({ units, onChange }: UnitToggleProps) {
  return (
    <div role="group" aria-label="Temperature units" className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={units === option.value}
          aria-label={option.name}
          onClick={() => onChange(option.value)}
          className={`rounded px-3 py-2 text-sm font-semibold ${
            units === option.value ? "bg-sky-900 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
