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
    blue: "border-blue-400/40 text-blue-300",
    green: "border-green-400/40 text-green-300",
    orange: "border-orange-400/40 text-orange-300",
    red: "border-red-400/40 text-red-300",
    purple: "border-purple-400/40 text-purple-300",
    cyan: "border-cyan-400/40 text-cyan-300",
  };

  return (
    <div
      className={`rounded-3xl border bg-[#0F172A]/95 p-6 shadow-xl shadow-cyan-950/20 ${colors[color]}`}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>

      <p className="text-sm font-bold text-slate-300">{title}</p>

      <p className="mt-2 text-4xl font-black tracking-tight text-white">
        {value}
      </p>

      {note && <p className="mt-2 text-sm font-bold">{note}</p>}
    </div>
  );
}