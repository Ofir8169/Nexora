export default function WorkspaceSkeleton() {
  return (
    <div role="status" aria-label="Loading workspace" className="animate-in fade-in space-y-6">
      <div className="nexora-surface rounded-[28px] p-6 sm:p-8">
        <div className="nexora-skeleton h-3 w-28 rounded-full" />
        <div className="nexora-skeleton mt-4 h-9 w-[min(420px,80%)] rounded-xl" />
        <div className="nexora-skeleton mt-3 h-4 w-[min(560px,95%)] rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="nexora-surface rounded-2xl p-5"><div className="nexora-skeleton h-11 w-11 rounded-xl" /><div className="nexora-skeleton mt-5 h-3 w-24 rounded" /><div className="nexora-skeleton mt-3 h-8 w-16 rounded-lg" /></div>)}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
