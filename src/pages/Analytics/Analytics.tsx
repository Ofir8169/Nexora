import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../../context/AppContext";
import Card from "../../components/ui/Card/Card";

export default function Analytics() {
  const { tasks, fleet, employees, sites } = useApp();

  const taskData = [
    { name: "Open", value: tasks.filter((t) => t.status === "Open").length },
    { name: "Done", value: tasks.filter((t) => t.status === "Done").length },
    {
      name: "Progress",
      value: tasks.filter((t) => t.status === "In Progress").length,
    },
  ];

  const fleetData = [
    { name: "Active", value: fleet.filter((v) => v.status === "Active").length },
    {
      name: "Maintenance",
      value: fleet.filter((v) => v.status === "Maintenance").length,
    },
    {
      name: "Critical",
      value: fleet.filter((v) => v.status === "Critical").length,
    },
  ];

  const workloadData = employees.map((e) => ({
    name: e.name.split(" ")[0],
    workload: e.workload,
  }));

  const siteRiskData = sites.map((s) => ({
    name: s.name,
    risk: s.risk,
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Insights</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950">Analytics</h1>
        <p className="mt-2 text-slate-500">
          Visual overview of operations, risk, workload and fleet health.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Tasks by Status">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskData} dataKey="value" nameKey="name" outerRadius={90}>
                  {taskData.map((_, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Fleet Status">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Employee Workload">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="workload" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Site Risk Score">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteRiskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="risk" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}