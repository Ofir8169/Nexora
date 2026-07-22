export default function KPI({
  icon,
  title,
  value,
  note,
  color = "cyan",
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  note?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "cyan";
}) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    orange: "text-amber-600 bg-amber-50",
    red: "text-red-600 bg-red-50",
    purple: "text-violet-600 bg-violet-50",
    cyan: "text-sky-600 bg-sky-50",
  };

  return (
    <div
      className="nexora-surface nexora-lift rounded-2xl p-5"
    >
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      {note && <p className="mt-2 text-xs font-semibold text-slate-500">{note}</p>}
    </div>
  );
}
