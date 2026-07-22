import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { useApp } from "../../context/app-context";

export default function Analytics() {
  const { tasks, fleet, employees, sites } = useApp();

  const taskData = [
    { name: "Open", value: tasks.filter((t) => t.status === "Open").length },
    { name: "Progress", value: tasks.filter((t) => t.status === "In Progress").length },
    { name: "Done", value: tasks.filter((t) => t.status === "Done").length },
  ];

  const fleetData = [
    { name: "Active", value: fleet.filter((v) => v.status === "Active").length },
    { name: "Maintenance", value: fleet.filter((v) => v.status === "Maintenance").length },
    { name: "Critical", value: fleet.filter((v) => v.status === "Critical").length },
  ];

  const workloadData = employees.map((e) => ({
    name: e.name.split(" ")[0],
    workload: e.workload,
  }));

  const riskData = sites.map((s) => ({
    name: s.name,
    risk: s.risk,
  }));

  const trendData = [
    { day: "Sun", readiness: 76 },
    { day: "Mon", readiness: 82 },
    { day: "Tue", readiness: 79 },
    { day: "Wed", readiness: 86 },
    { day: "Thu", readiness: 91 },
  ];

  return (
    <div className="pb-10 text-white">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
          Intelligence Layer
        </p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
          Analytics Command
        </h1>
        <p className="mt-3 text-lg text-slate-300">
          Live insights across tasks, fleet, workforce and site risk.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <KPI icon={<CheckCircle2 />} title="Tasks" value={tasks.length} color="blue" />
        <KPI icon={<Truck />} title="Fleet" value={fleet.length} color="green" />
        <KPI icon={<AlertTriangle />} title="High Risk" value={sites.filter((s) => s.risk >= 70).length} color="red" />
        <KPI icon={<Activity />} title="Workload" value={employees.filter((e) => e.workload >= 80).length} color="orange" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Task Distribution">
          <ChartBox>
            <PieChart>
              <Pie data={taskData} dataKey="value" nameKey="name" outerRadius={95}>
                {taskData.map((_, index) => (
                  <Cell key={index} fill={["#38bdf8", "#f59e0b", "#22c55e"][index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ChartBox>
        </Panel>

        <Panel title="Fleet Status">
          <ChartBox>
            <BarChart data={fleetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#38bdf8" />
            </BarChart>
          </ChartBox>
        </Panel>

        <Panel title="Employee Workload">
          <ChartBox>
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="workload" radius={[12, 12, 0, 0]} fill="#a855f7" />
            </BarChart>
          </ChartBox>
        </Panel>

        <Panel title="Site Risk Score">
          <ChartBox>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="risk" radius={[12, 12, 0, 0]} fill="#ef4444" />
            </BarChart>
          </ChartBox>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Mission Readiness Trend">
          <ChartBox>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="readiness"
                stroke="#22d3ee"
                strokeWidth={4}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ChartBox>
        </Panel>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "#020617",
  border: "1px solid rgba(59,130,246,0.35)",
  borderRadius: "14px",
  color: "#fff",
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-blue-400/30 bg-slate-900/95 p-6 shadow-2xl shadow-blue-500/20">
      <h2 className="mb-5 text-2xl font-black text-white">{title}</h2>
      {children}
    </div>
  );
}

function ChartBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-80 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
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
