import {
  Bot,
  CheckCircle2,
  Download,
  FileText,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { useApp } from "../../context/app-context";
import { useBusiness } from "../../business/context/business-context";

export default function Reports() {
  const { tasks, fleet, sites, employees } = useApp();
  const { dashboard: business } = useBusiness();

  const completed = tasks.filter((t) => t.status === "Done").length;
  const open = tasks.filter((t) => t.status !== "Done").length;
  const criticalVehicles = fleet.filter((v) => v.status === "Critical").length;
  const highRiskSites = sites.filter((s) => s.risk >= 70).length;
  const overloadedEmployees = employees.filter((e) => e.workload >= 80).length;

  function exportPdf() {
    const document = new jsPDF();
    const lines = [
      `Generated: ${new Date().toLocaleString()}`,
      `Operational tasks: ${tasks.length} (${open} open, ${completed} completed)`,
      `Fleet: ${fleet.length} (${criticalVehicles} critical)`,
      `Sites: ${sites.length} (${highRiskSites} high risk)`,
      `Employees: ${employees.length} (${overloadedEmployees} overloaded)`,
      `Customers: ${business?.customers.total ?? 0}`,
      `Outstanding revenue: ILS ${business?.finance.outstandingRevenue ?? 0}`,
      `Expenses: ILS ${business?.finance.totalExpenses ?? 0}`,
      `Profit: ILS ${business?.finance.profit ?? 0}`,
    ];

    document.setFontSize(20);
    document.text("Nexora Operations Report", 20, 22);
    document.setFontSize(11);
    lines.forEach((line, index) => document.text(line, 20, 38 + index * 9));
    document.save(`nexora-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF report exported");
  }

  return (
    <div className="pb-10 text-white">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Operational Intelligence
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            Reports Command
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            AI-generated daily summary based on live operational data.
          </p>
        </div>

        <button onClick={exportPdf} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/20">
          <Download size={18} />
          Export PDF
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <KPI icon={<CheckCircle2 />} title="Completed" value={completed} color="green" />
        <KPI icon={<FileText />} title="Open Tasks" value={open} color="orange" />
        <KPI icon={<Truck />} title="Critical Fleet" value={criticalVehicles} color="red" />
        <KPI icon={<Users />} title="High Workload" value={overloadedEmployees} color="blue" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Daily Operational Summary">
          <div className="space-y-5 text-sm leading-7 text-slate-300">
            <ReportLine text={`Current operation includes ${tasks.length} tasks, ${fleet.length} fleet assets, ${sites.length} sites and ${employees.length} employees.`} />
            <ReportLine text={`${completed} tasks have been completed and ${open} tasks remain open.`} />
            <ReportLine text={`${criticalVehicles} fleet assets are marked critical and require review.`} />
            <ReportLine text={`${highRiskSites} sites are currently considered high risk.`} />
            <ReportLine text={`${overloadedEmployees} employees are currently above recommended workload.`} />
          </div>
        </Panel>

        <Panel title="AI Report Insight">
          <div className="mb-5 flex items-center gap-3 text-cyan-300">
            <Bot />
            <p className="font-black">Nexora AI</p>
          </div>

          <p className="text-sm leading-7 text-slate-300">
            {criticalVehicles > 0 || highRiskSites > 0
              ? "Operations require attention. Review critical fleet and high-risk sites before approving tomorrow's plan."
              : "Operations are stable. No major operational risks detected in the current data."}
          </p>

          <div className="mt-6 space-y-3">
            <AIItem text="Review all open tasks before end of day." />
            <AIItem text="Check workforce balance across sites." />
            <AIItem text="Validate fleet readiness before next deployment." />
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Mission Readiness">
          <div className="flex items-center gap-3 text-green-300">
            <ShieldCheck />
            <p className="text-4xl font-black">
              {Math.max(35, 100 - open * 3 - criticalVehicles * 12 - highRiskSites * 8)}%
            </p>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Estimated readiness based on open tasks, site risk and fleet status.
          </p>
        </Panel>

        <Panel title="Fleet Summary">
          <Summary label="Total Assets" value={fleet.length} />
          <Summary label="Critical" value={criticalVehicles} />
          <Summary label="Maintenance" value={fleet.filter((v) => v.status === "Maintenance").length} />
        </Panel>

        <Panel title="Risk Summary">
          <Summary label="High Risk Sites" value={highRiskSites} />
          <Summary label="Open Tasks" value={open} />
          <Summary label="Overloaded Staff" value={overloadedEmployees} />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
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
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "blue" | "green" | "orange" | "red";
}) {
  const colors = {
    blue: "border-blue-400/50 text-blue-300",
    green: "border-green-400/50 text-green-300",
    orange: "border-orange-400/50 text-orange-300",
    red: "border-red-400/50 text-red-300",
  };

  return (
    <div className={`rounded-3xl border bg-slate-900/95 p-6 shadow-xl ${colors[color]}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-5xl font-black text-white">{value}</p>
    </div>
  );
}

function ReportLine({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      {text}
    </div>
  );
}

function AIItem({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-slate-200">
      {text}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-xl font-black text-white">{value}</span>
    </div>
  );
}
