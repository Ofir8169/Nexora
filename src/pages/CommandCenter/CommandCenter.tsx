import { AlertTriangle, Bot, CheckCircle2, MapPin, Truck, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/ui/Card/Card";
import Badge from "../../components/ui/Badge/Badge";

export default function CommandCenter() {
  const { tasks, fleet, employees, sites, notifications } = useApp();

  const criticalFleet = fleet.filter((v) => v.status === "Critical").length;
  const openTasks = tasks.filter((t) => t.status !== "Done").length;
  const availableEmployees = employees.filter((e) => e.status === "Available").length;
  const highRiskSites = sites.filter((s) => s.risk >= 70).length;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Live Operations</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950">Command Center</h1>
        <p className="mt-2 text-slate-500">
          One screen for fleet, sites, people, tasks and AI recommendations.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr_380px]">
        <Card title="Fleet Status">
          <div className="space-y-3">
            {fleet.slice(0, 6).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{vehicle.name}</p>
                    <p className="text-xs text-slate-500">{vehicle.site}</p>
                  </div>
                </div>
                <Badge color={vehicle.status === "Critical" ? "red" : vehicle.status === "Maintenance" ? "orange" : "green"}>
                  {vehicle.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <h2 className="text-xl font-semibold">Mission Readiness</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Current operation includes {openTasks} open tasks, {criticalFleet} critical fleet assets,
              {availableEmployees} available employees and {highRiskSites} high risk sites.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <Mini title="Open Tasks" value={String(openTasks)} />
              <Mini title="Critical Fleet" value={String(criticalFleet)} />
              <Mini title="Available" value={String(availableEmployees)} />
              <Mini title="High Risk" value={String(highRiskSites)} />
            </div>
          </div>

          <Card title="Live Operations">
            <div className="grid gap-4 md:grid-cols-2">
              {sites.map((site) => (
                <div key={site.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-blue-600" />
                      <p className="font-semibold text-slate-900">{site.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-500">{site.risk}%</span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-600">
                    <span>{site.employees} employees</span>
                    <span>{site.vehicles} vehicles</span>
                    <span>{site.tasks} tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <Bot className="text-blue-400" />
              <h2 className="text-xl font-semibold">AI Commander</h2>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <p>
                {criticalFleet > 0
                  ? "Critical fleet detected. Review maintenance before deployment."
                  : "Fleet status is stable."}
              </p>
              <p>
                {highRiskSites > 0
                  ? "High-risk sites require operational review today."
                  : "No high-risk sites detected."}
              </p>
              <p>
                {availableEmployees < 2
                  ? "Low available workforce. Consider rescheduling non-critical tasks."
                  : "Workforce availability is acceptable."}
              </p>
            </div>
          </div>

          <Card title="Activity Feed">
            <div className="space-y-4">
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  {n.type === "critical" ? (
                    <AlertTriangle size={18} className="text-red-500" />
                  ) : (
                    <CheckCircle2 size={18} className="text-green-500" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-400">{n.time}</p>
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Mini({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}