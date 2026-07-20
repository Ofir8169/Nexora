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
      className={`rounded-3xl border border-white/10 bg-[#0F172A]/95 p-6 shadow-2xl shadow-cyan-950/20 ${className}`}
    >
      {title && (
        <h2 className="mb-5 text-xl font-black tracking-tight text-white">
          {title}
        </h2>
      )}

      {children}
    </section>
  );
}