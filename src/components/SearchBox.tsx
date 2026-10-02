"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { isAbortError, searchPlaces } from "@/lib/api";
import { formatPlace } from "@/lib/places";
import type { Place } from "@/lib/types";

type SearchStatus = "idle" | "loading" | "done" | "error";

interface SearchBoxProps {
  onSelect: (place: Place) => void;
}

export default function SearchBox({ onSelect }: SearchBoxProps) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Search 350 ms after the visitor stops typing, and cancel the previous request.
  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const found = await searchPlaces(text, controller.signal);
        setResults(found);
        setActiveIndex(-1);
        setStatus("done");
      } catch (error) {
        if (isAbortError(error)) return;
        setResults([]);
        setStatus("error");
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function choose(place: Place) {
    onSelect(place);
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const pick = results[activeIndex] ?? results[0];
      if (open && pick) {
        e.preventDefault();
        choose(pick);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const hasQuery = query.trim().length >= 2;
  const showList = open && hasQuery && results.length > 0;
  const showMessage = open && hasQuery && results.length === 0;

  return (
    <div className="relative w-full sm:w-80">
      <label htmlFor={inputId} className="sr-only">
        Search for a city
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder="Search for a city"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-500"
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching places"
          // Keep focus in the input so clicking an option does not close the list first.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm"
        >
          {results.map((place, index) => (
            <li
              key={place.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => choose(place)}
              className={`cursor-pointer px-3 py-2 ${
                index === activeIndex ? "bg-sky-100 text-sky-950" : "hover:bg-slate-50"
              }`}
            >
              {formatPlace(place)}
            </li>
          ))}
        </ul>
      )}

      {showMessage && (
        <div
          role="status"
          className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          {status === "loading" && "Searching..."}
          {status === "done" && "No places found. Check the spelling or try a larger nearby city."}
          {status === "error" && "Search failed. Check your connection and try again."}
        </div>
      )}
    </div>
  );
}
