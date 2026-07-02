import { sites } from "../../data/sites";

export default function Sites() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Operations</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950">
          Sites Command Center
        </h1>
        <p className="mt-2 text-slate-500">
          Monitor all operational sites in one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sites.map((site) => (
          <div
            key={site.id}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {site.name}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  site.status === "Critical"
                    ? "bg-red-100 text-red-700"
                    : site.status === "Maintenance"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {site.status}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Stat title="Employees" value={site.employees.toString()} />
              <Stat title="Vehicles" value={site.vehicles.toString()} />
              <Stat title="Tasks" value={site.tasks.toString()} />
              <Stat title="Risk Score" value={`${site.risk}%`} />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-sm font-semibold">AI Recommendation</p>

              <p className="mt-2 text-sm text-slate-300">
                {site.risk > 70
                  ? "Deploy additional resources immediately."
                  : "Operations are stable."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs uppercase text-slate-400">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}