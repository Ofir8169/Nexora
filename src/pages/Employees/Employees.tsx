import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Edit,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Badge from "../../components/ui/Badge/Badge";
import Card from "../../components/ui/Card/Card";

export default function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useApp();

  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [site, setSite] = useState("");
  const [status, setStatus] = useState("Available");
  const [workload, setWorkload] = useState("40");

  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.role} ${employee.site} ${employee.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function resetForm() {
    setName("");
    setRole("");
    setSite("");
    setStatus("Available");
    setWorkload("40");
    setEditingEmployeeId(null);
    setIsModalOpen(false);
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal() {
    if (!selectedEmployee) return;

    setEditingEmployeeId(selectedEmployee.id);
    setName(selectedEmployee.name);
    setRole(selectedEmployee.role);
    setSite(selectedEmployee.site);
    setStatus(selectedEmployee.status);
    setWorkload(String(selectedEmployee.workload));
    setIsModalOpen(true);
  }

  function handleSaveEmployee() {
    const employee = {
      id: editingEmployeeId || Date.now(),
      name: name || "Unnamed Employee",
      role: role || "Field Operator",
      site: site || "No site",
      status,
      workload: Number(workload) || 0,
    };

    if (editingEmployeeId) {
      updateEmployee(employee);
      setSelectedEmployee(employee);
    } else {
      addEmployee(employee);
      setSelectedEmployee(employee);
    }

    resetForm();
  }

  function handleDeleteEmployee() {
    if (!selectedEmployee) return;

    deleteEmployee(selectedEmployee.id);
    const remaining = employees.filter(
      (employee) => employee.id !== selectedEmployee.id
    );
    setSelectedEmployee(remaining[0]);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">People</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Employees</h1>
          <p className="mt-2 text-slate-500">
            Monitor workforce, workload, availability and current site.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          New Employee
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <EmployeeStat icon={<Users />} title="Total Employees" value={String(employees.length)} />
        <EmployeeStat
          icon={<CheckCircle2 />}
          title="Available"
          value={String(employees.filter((e) => e.status === "Available").length)}
        />
        <EmployeeStat
          icon={<Briefcase />}
          title="Busy"
          value={String(employees.filter((e) => e.status === "Busy").length)}
        />
        <EmployeeStat
          icon={<User />}
          title="High Workload"
          value={String(employees.filter((e) => e.workload >= 80).length)}
        />
      </div>

      <div className="my-6 flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees, roles, sites or status..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          {filteredEmployees.length === 0 ? (
            <p className="text-sm text-slate-500">No employees found.</p>
          ) : (
            <div className="overflow-hidden">
              {filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployee(employee)}
                  className="grid w-full grid-cols-5 items-center border-b border-slate-100 py-5 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 font-bold text-blue-600">
                      {employee.name.slice(0, 1)}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">{employee.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{employee.role}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">{employee.site}</p>

                  <Badge color={getBadgeColor(employee.status)}>
                    {employee.status}
                  </Badge>

                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {employee.workload}%
                    </p>
                    <p className="text-xs text-slate-500">workload</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {selectedEmployee ? (
          <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-blue-600">Employee Details</p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-2xl font-bold text-blue-600">
                {selectedEmployee.name.slice(0, 1)}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  {selectedEmployee.name}
                </h2>
                <p className="text-sm text-slate-500">{selectedEmployee.role}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Info label="Site" value={selectedEmployee.site} />
              <Info label="Status" value={selectedEmployee.status} />
              <Info label="Role" value={selectedEmployee.role} />
              <Info label="Workload" value={`${selectedEmployee.workload}%`} />
            </div>

            <div className="mt-7 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-sm font-semibold">AI Workforce Insight</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {selectedEmployee.workload >= 80
                  ? `${selectedEmployee.name} has high workload. Consider redistributing tasks.`
                  : `${selectedEmployee.name}'s workload is within a healthy range.`}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <Edit size={16} />
                Edit
              </button>

              <button
                onClick={handleDeleteEmployee}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </aside>
        ) : (
          <aside className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            No employee selected.
          </aside>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  {editingEmployeeId ? "Edit Employee" : "New Employee"}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {editingEmployeeId ? "Update employee" : "Create employee"}
                </h2>
              </div>

              <button
                onClick={resetForm}
                className="rounded-xl bg-slate-100 p-2 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Employee name"
              />

              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Role"
              />

              <input
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Current site"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option>Available</option>
                <option>Busy</option>
                <option>Maintenance</option>
                <option>Off Duty</option>
              </select>

              <input
                value={workload}
                onChange={(e) => setWorkload(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Workload %"
                type="number"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEmployee}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {editingEmployeeId ? "Save Changes" : "Create Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeStat({
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function getBadgeColor(status: string): "green" | "orange" | "red" | "blue" {
  if (status === "Busy") return "red";
  if (status === "Maintenance" || status === "Off Duty") return "orange";
  if (status === "Available") return "green";
  return "blue";
}