import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardList,
  MapPin,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function CommandCenter() {
  const { tasks, fleet, employees, sites, notifications } = useApp();

  const openTasks = tasks.filter((task) => task.status !== "Done").length;
  const criticalFleet = fleet.filter((vehicle) => vehicle.status === "Critical").length;
  const availableEmployees = employees.filter((employee) => employee.status === "Available").length;
  const highRiskSites = sites.filter((site) => site.risk >= 70).length;

  const readiness = Math.max(
    35,
    100 - openTasks * 3 - criticalFleet * 12 - highRiskSites * 8
  );

  return (
    <div className="pb-10 text-white">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Live Operations
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            Command Center
          </h1>

          <p className="mt-3 text-lg text-slate-300">
            Real-time overview of fleet, sites, people, tasks and AI recommendations.
          </p>
        </div>

        <div className="rounded-2xl border border-green-400/40 bg-green-500/15 px-5 py-3 text-sm font-black text-green-300 shadow-lg shadow-green-500/20">
          ● LIVE
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <KPI icon={<Truck />} title="Fleet" value={fleet.length} note={`${criticalFleet} Critical`} color="blue" />
        <KPI icon={<ClipboardList />} title="Tasks" value={tasks.length} note={`${openTasks} Open`} color="green" />
        <KPI icon={<MapPin />} title="Sites" value={sites.length} note={`${highRiskSites} High Risk`} color="purple" />
        <KPI icon={<Users />} title="Employees" value={employees.length} note={`${availableEmployees} Available`} color="orange" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Fleet Status">
          <div className="space-y-3">
            {fleet.slice(0, 5).map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
                    <Truck size={22} />
                  </div>

                  <div>
                    <p className="font-black text-white">{vehicle.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{vehicle.site}</p>
                  </div>
                </div>

                <StatusBadge status={vehicle.status} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Mission Readiness">
          <div className="flex flex-col items-center">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-tr from-green-500 via-yellow-400 to-purple-600 p-4 shadow-2xl shadow-green-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                <div className="text-center">
                  <p className="text-6xl font-black text-white">{readiness}%</p>

                  <p className="mt-2 flex items-center justify-center gap-2 text-sm font-black text-green-400">
                    <ShieldCheck size={16} />
                    {readiness >= 75 ? "High Readiness" : "Needs Review"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 w-full space-y-4">
              <Metric label="Open Tasks" value={openTasks} color="bg-orange-400" />
              <Metric label="Critical Fleet" value={criticalFleet} color="bg-red-400" />
              <Metric label="Available Staff" value={availableEmployees} color="bg-blue-400" />
              <Metric label="High Risk Sites" value={highRiskSites} color="bg-purple-400" />
            </div>
          </div>
        </Panel>

        <Panel title="AI Commander">
          <div className="mb-5 flex items-center gap-3">
            <Bot className="text-cyan-400" />
            <span className="rounded-xl bg-purple-500/20 px-3 py-1 text-xs font-black text-purple-300">
              AI POWERED
            </span>
          </div>

          <div className="space-y-4">
            <Recommendation
              title="Recommendation #1"
              text={
                criticalFleet > 0
                  ? "Critical fleet detected. Inspect before next deployment."
                  : "Fleet status is stable."
              }
              color="blue"
            />

            <Recommendation
              title="Recommendation #2"
              text={
                availableEmployees > 0
                  ? "Workforce availability is acceptable. Keep monitoring."
                  : "No available employees. Reschedule non-critical work."
              }
              color="green"
            />

            <Recommendation
              title="Recommendation #3"
              text={
                highRiskSites > 0
                  ? "High-risk site detected. Review operational plan today."
                  : "Site risk levels are under control."
              }
              color="orange"
            />
          </div>

          <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/20">
            ✦ Analyze Operation
          </button>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Live Operations">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sites.map((site) => (
              <div
                key={site.id}
                className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-black text-white">{site.name}</p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      site.risk >= 70
                        ? "bg-red-500/20 text-red-300"
                        : site.risk >= 40
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {site.risk}% Risk
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <p>{site.vehicles} Vehicles</p>
                  <p>{site.tasks} Tasks</p>
                  <p>{site.employees} Employees</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Activity Feed">
          <div className="space-y-5">
            {notifications.slice(0, 6).map((notification) => (
              <div key={notification.id} className="flex gap-4 rounded-2xl bg-slate-950/70 p-4">
                <div className="mt-1">
                  {notification.type === "critical" ? (
                    <AlertTriangle size={20} className="text-red-400" />
                  ) : (
                    <CheckCircle2 size={20} className="text-green-400" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-200">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-blue-400/30 bg-slate-900/95 p-6 shadow-2xl shadow-blue-500/20">
      <h2 className="mb-5 text-2xl font-black text-white">{title}</h2>
      {children}
    </div>
  );
}

function KPI({
  icon,
  title,
  value,
  note,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  note: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "border-blue-400/50 text-blue-300 shadow-blue-500/20",
    green: "border-green-400/50 text-green-300 shadow-green-500/20",
    purple: "border-purple-400/50 text-purple-300 shadow-purple-500/20",
    orange: "border-orange-400/50 text-orange-300 shadow-orange-500/20",
  };

  return (
    <div className={`rounded-3xl border bg-slate-900/95 p-6 shadow-2xl ${colors[color]}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>

      <p className="text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-5xl font-black text-white">{value}</p>
      <p className="mt-2 font-black">{note}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Critical"
      ? "border-red-400/40 bg-red-500/20 text-red-300"
      : status === "Maintenance"
      ? "border-orange-400/40 bg-orange-500/20 text-orange-300"
      : "border-green-400/40 bg-green-500/20 text-green-300";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${color}`}>
      {status}
    </span>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-black text-white">{value}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-800">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min(100, value * 12)}%` }}
        />
      </div>
    </div>
  );
}

function Recommendation({
  title,
  text,
  color,
}: {
  title: string;
  text: string;
  color: "blue" | "green" | "orange";
}) {
  const colors = {
    blue: "border-blue-400/30 bg-blue-500/10 text-blue-300",
    green: "border-green-400/30 bg-green-500/10 text-green-300",
    orange: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="mb-2 text-xs font-black">{title}</p>
      <p className="text-sm leading-6 text-slate-200">{text}</p>
    </div>
  );
}