import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Edit,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  MapPin,
  Activity,
} from "lucide-react";
import { useApp } from "../../context/app-context";
import { useLocation } from "react-router-dom";
import { getLocale, localized } from "../../lib/preferences";
import EntityActivity from "../../components/ui-v2/EntityActivity";
import EntityNotes from "../../components/ui-v2/EntityNotes";

export default function Employees() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const location = useLocation();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useApp();

  const [selectedEmployee, setSelectedEmployee] = useState(() => {
    const selectedId = Number((location.state as { selectedId?: unknown } | null)?.selectedId);
    return employees.find((employee) => employee.id === selectedId) ?? employees[0];
  });
  const [isModalOpen, setIsModalOpen] = useState(
    () => location.state?.quickCreate === "employee"
  );
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [site, setSite] = useState("");
  const [status, setStatus] = useState("Available");
  const [workload, setWorkload] = useState("40");

  const available = employees.filter((e) => e.status === "Available").length;
  const busy = employees.filter((e) => e.status === "Busy").length;
  const highWorkload = employees.filter((e) => e.workload >= 80).length;

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
    <div className="pb-10 text-white">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            {t("Workforce Operations", "ניהול כוח אדם")}
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            {t("Employees Command", "מרכז העובדים")}
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            {t("Monitor workforce, availability, workload and field assignments.", "מעקב אחר זמינות, עומס עבודה ושיבוצים בשטח.")}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/20"
        >
          <Plus size={18} />
          {t("New Employee", "עובד חדש")}
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <EmployeeKPI icon={<Users />} title={t("Total Employees", "סך עובדים")} value={employees.length} note={t("Workforce tracked", "עובדים במעקב")} color="blue" />
        <EmployeeKPI icon={<CheckCircle2 />} title={t("Available", "זמינים")} value={available} note={t("Ready for assignment", "מוכנים לשיבוץ")} color="green" />
        <EmployeeKPI icon={<Briefcase />} title={t("Busy", "עסוקים")} value={busy} note={t("Currently assigned", "משובצים כעת")} color="orange" />
        <EmployeeKPI icon={<Activity />} title={t("High Load", "עומס גבוה")} value={highWorkload} note={t("Needs balancing", "נדרש איזון")} color="red" />
      </div>

      <div className="my-6 flex items-center gap-3 rounded-3xl border border-blue-400/30 bg-slate-900/95 px-5 py-4 shadow-2xl shadow-blue-500/10">
        <Search size={18} className="text-cyan-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search employees, roles, sites or status...", "חיפוש לפי עובד, תפקיד, אתר או סטטוס...")}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <Panel title={t("Workforce", "צוות העובדים")}>
          {filteredEmployees.length === 0 ? (
            <p className="text-sm text-slate-400">{t("No employees found.", "לא נמצאו עובדים.")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployee(employee)}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-left transition hover:border-cyan-400/40 hover:bg-slate-900"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-black">
                        {employee.name.charAt(0)}
                      </div>

                      <div>
                        <p className="font-black text-white">
                          {employee.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {employee.role}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={employee.status} />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MapPin size={16} className="text-cyan-400" />
                    {employee.site}
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">Workload</span>
                      <span className="font-black text-white">
                        {employee.workload}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className={`h-2 rounded-full ${
                          employee.workload >= 80
                            ? "bg-red-400"
                            : employee.workload >= 50
                            ? "bg-orange-400"
                            : "bg-green-400"
                        }`}
                        style={{
                          width: `${employee.workload}%`,
                        }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {selectedEmployee ? (
          <Panel title={t("Employee Details", "פרטי עובד")}>
            <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
              {t("Selected Employee", "עובד שנבחר")}
            </p>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-black">
                {selectedEmployee.name.charAt(0)}
              </div>

              <div>
                <h2 className="text-3xl font-black text-white">
                  {selectedEmployee.name}
                </h2>

                <p className="text-slate-400">
                  {selectedEmployee.role}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <InfoDark label="Role" value={selectedEmployee.role} />
              <InfoDark label="Site" value={selectedEmployee.site} />
              <InfoDark label="Status" value={selectedEmployee.status} />
              <InfoDark
                label="Workload"
                value={`${selectedEmployee.workload}%`}
              />
            </div>

            <div className="mt-7 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
              <p className="text-sm font-black text-cyan-300">
                {t("AI Workforce Recommendation", "המלצת כוח אדם חכמה")}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {selectedEmployee.workload >= 80
                  ? "Reduce workload and assign backup operator."
                  : selectedEmployee.status === "Busy"
                  ? "Currently assigned to an active mission."
                  : "Available for immediate deployment."}
              </p>
            </div>

            <EntityActivity createdLabel={t("Employee joined the workspace", "העובד נוסף למערכת")} updatedLabel={t(`Workload updated to ${selectedEmployee.workload}%`, `העומס עודכן ל-${selectedEmployee.workload}%`)} />
            <EntityNotes key={`employee_${selectedEmployee.id}`} entityKey={`employee_${selectedEmployee.id}`} />

            <div className="mt-7 flex gap-3">
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-black text-white"
              >
                <Edit size={16} />
                {t("Edit", "עריכה")}
              </button>

              <button
                onClick={handleDeleteEmployee}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"
              >
                <Trash2 size={16} />
                {t("Delete", "מחיקה")}
              </button>
            </div>
          </Panel>
        ) : (
          <Panel title={t("Employee Details", "פרטי עובד")}>
            <p className="text-slate-400">{t("No employee selected.", "לא נבחר עובד.")}</p>
          </Panel>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-blue-400/30 bg-slate-900 p-6 shadow-2xl shadow-blue-500/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
                  {editingEmployeeId ? "Edit Employee" : "New Employee"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {editingEmployeeId
                    ? "Update employee"
                    : "Create employee"}
                </h2>
              </div>

              <button
                onClick={resetForm}
                className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <DarkInput
                value={name}
                onChange={setName}
                placeholder="Employee name"
              />

              <DarkInput
                value={role}
                onChange={setRole}
                placeholder="Role"
              />

              <DarkInput
                value={site}
                onChange={setSite}
                placeholder="Site"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option>Available</option>
                <option>Busy</option>
                <option>Vacation</option>
              </select>

              <DarkInput
                value={workload}
                onChange={setWorkload}
                placeholder="Workload %"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-black text-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEmployee}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white"
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

function EmployeeKPI({
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
  color: "blue" | "green" | "orange" | "red";
}) {
  const colors = {
    blue: "border-blue-400/50 text-blue-300",
    green: "border-green-400/50 text-green-300",
    orange: "border-orange-400/50 text-orange-300",
    red: "border-red-400/50 text-red-300",
  };

  return (
    <div
      className={`rounded-3xl border bg-slate-900/95 p-6 shadow-xl ${colors[color]}`}
    >
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
    status === "Busy"
      ? "border-orange-400/40 bg-orange-500/20 text-orange-300"
      : status === "Vacation"
      ? "border-red-400/40 bg-red-500/20 text-red-300"
      : "border-green-400/40 bg-green-500/20 text-green-300";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${color}`}>
      {status}
    </span>
  );
}

function InfoDark({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-black uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}

function DarkInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
      placeholder={placeholder}
    />
  );
}
