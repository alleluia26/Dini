export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading admin content">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="h-10 w-72 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-32 animate-pulse rounded-[var(--radius-card)] bg-slate-200"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
