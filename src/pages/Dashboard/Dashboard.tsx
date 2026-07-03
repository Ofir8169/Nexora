import Header from "../../components/Header/Header";
import StatCard from "../../components/StatCard/StatCard";
import AICopilot from "../../features/ai/AICopilot";
import NotificationCenter from "../../features/notifications/Notifications";
import { useApp } from "../../context/AppContext";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Users,
  MapPin,
} from "lucide-react";

export default function Dashboard() {
  const { tasks, fleet, employees, sites, notifications } = useApp();

  const completedTasks = tasks.filter((task) => task.status === "Done").length;
  const openTasks = tasks.length - completedTasks;
  const criticalFleet = fleet.filter((vehicle) => vehicle.status === "Critical").length;
  const highRiskSites = sites.filter((site) => site.risk >= 70).length;

  return (
    <>
      <Header />

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard icon={<CheckCircle2 />} title="Completed" value={String(completedTasks)} />
        <StatCard icon={<Clock />} title="Open Tasks" value={String(openTasks)} />
        <StatCard icon={<AlertTriangle />} title="Critical Fleet" value={String(criticalFleet)} />
        <StatCard icon={<Truck />} title="Vehicles" value={String(fleet.length)} />
        <StatCard icon={<Users />} title="Employees" value={String(employees.length)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-semibold">Live Operations Brief</h2>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            OpsFlow is tracking {tasks.length} tasks, {fleet.length} fleet assets,
            {employees.length} employees and {sites.length} sites.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <MiniCard title="High Risk Sites" value={String(highRiskSites)} />
            <MiniCard title="Critical Fleet" value={String(criticalFleet)} />
            <MiniCard title="Open Tasks" value={String(openTasks)} />
          </div>
        </div>

        <AICopilot />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-950">Live Timeline</h2>

          <div className="mt-5 space-y-5">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No activity yet.</p>
            ) : (
              notifications.slice(0, 6).map((item) => (
                <Timeline key={item.id} time={item.time} text={item.title} />
              ))
            )}
          </div>
        </div>

        <NotificationCenter />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <MapPin className="text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-950">Sites</h2>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {sites.map((site) => (
            <div key={site.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{site.name}</p>
              <p className="mt-1 text-sm text-slate-500">{site.risk}% risk</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function Timeline({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-12 text-sm font-semibold text-slate-400">{time}</span>
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  );
}