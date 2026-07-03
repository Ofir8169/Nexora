import { FileText, Download, Bot, CheckCircle2, AlertTriangle, Truck } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/ui/Card/Card";

export default function Reports() {
  const { tasks, fleet, sites, employees } = useApp();

  const completed = tasks.filter((t) => t.status === "Done").length;
  const open = tasks.filter((t) => t.status !== "Done").length;
  const criticalVehicles = fleet.filter((v) => v.status === "Critical").length;
  const highRiskSites = sites.filter((s) => s.risk >= 70).length;
  const overloadedEmployees = employees.filter((e) => e.workload >= 80).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Reports</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Daily Report</h1>
          <p className="mt-2 text-slate-500">
            Auto-generated operational summary based on current data.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          <Download size={18} />
          Export PDF
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ReportStat icon={<CheckCircle2 />} title="Completed Tasks" value={String(completed)} />
        <ReportStat icon={<FileText />} title="Open Tasks" value={String(open)} />
        <ReportStat icon={<Truck />} title="Critical Vehicles" value={String(criticalVehicles)} />
        <ReportStat icon={<AlertTriangle />} title="High Risk Sites" value={String(highRiskSites)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card title="Operational Summary">
          <div className="space-y-4 text-sm leading-7 text-slate-700">
            <p>
              Today the operation includes <strong>{tasks.length}</strong> total tasks,
              <strong> {fleet.length}</strong> fleet assets,
              <strong> {sites.length}</strong> active sites and
              <strong> {employees.length}</strong> employees.
            </p>

            <p>
              There are <strong>{open}</strong> open tasks and
              <strong> {completed}</strong> completed tasks.
            </p>

            <p>
              Fleet has <strong>{criticalVehicles}</strong> critical vehicles.
              Sites include <strong>{highRiskSites}</strong> high-risk locations.
            </p>

            <p>
              Workforce has <strong>{overloadedEmployees}</strong> employees with high workload.
            </p>
          </div>
        </Card>

        <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <Bot className="text-blue-400" />
            <h2 className="text-xl font-semibold">AI Report Insight</h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            {criticalVehicles > 0 || highRiskSites > 0
              ? "Operations require attention. Review critical vehicles and high-risk sites before approving tomorrow's plan."
              : "Operations are stable. No major risks detected in the current data."}
          </p>

          <div className="mt-6 space-y-3">
            <AIItem text="Review all open tasks before end of day." />
            <AIItem text="Check workload balance across employees." />
            <AIItem text="Verify fleet readiness before tomorrow morning." />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReportStat({
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

function AIItem({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-300">
      {text}
    </div>
  );
}