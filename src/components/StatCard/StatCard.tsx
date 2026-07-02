export default function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}