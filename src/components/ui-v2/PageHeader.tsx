export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">
          {eyebrow}
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-white lg:text-5xl">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}