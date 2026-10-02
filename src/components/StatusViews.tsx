export function LoadingState() {
  return (
    <div role="status" aria-busy="true" className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <span className="sr-only">Loading weather data</span>
      <div className="h-96 animate-pulse rounded-lg bg-sky-200" />
      <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-96 animate-pulse rounded-lg bg-slate-200 lg:col-span-2" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-950">
      <h2 className="text-xl font-bold">The weather did not load</h2>
      <p className="mt-2 max-w-prose">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-rose-900 px-4 py-2 font-semibold text-white hover:bg-rose-800"
      >
        Try again
      </button>
    </div>
  );
}
