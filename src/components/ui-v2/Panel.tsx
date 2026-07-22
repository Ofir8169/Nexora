export default function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`nexora-surface rounded-2xl p-5 sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-5 text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>
      )}

      {children}
    </section>
  );
}
