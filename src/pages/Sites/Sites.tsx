import { useState } from "react";
import {
  AlertTriangle,
  Edit,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Badge from "../../components/ui/Badge/Badge";
import Card from "../../components/ui/Card/Card";

export default function Sites() {
  const { sites, addSite, updateSite, deleteSite } = useApp();

  const [selectedSite, setSelectedSite] = useState(sites[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [employees, setEmployees] = useState("0");
  const [vehicles, setVehicles] = useState("0");
  const [tasks, setTasks] = useState("0");
  const [issues, setIssues] = useState("0");
  const [risk, setRisk] = useState("20");

  const filteredSites = sites.filter((site) =>
    `${site.name} ${site.status}`.toLowerCase().includes(search.toLowerCase())
  );

  function resetForm() {
    setName("");
    setStatus("Active");
    setEmployees("0");
    setVehicles("0");
    setTasks("0");
    setIssues("0");
    setRisk("20");
    setEditingSiteId(null);
    setIsModalOpen(false);
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal() {
    if (!selectedSite) return;

    setEditingSiteId(selectedSite.id);
    setName(selectedSite.name);
    setStatus(selectedSite.status);
    setEmployees(String(selectedSite.employees));
    setVehicles(String(selectedSite.vehicles));
    setTasks(String(selectedSite.tasks));
    setIssues(String(selectedSite.issues));
    setRisk(String(selectedSite.risk));
    setIsModalOpen(true);
  }

  function handleSaveSite() {
    const site = {
      id: editingSiteId || Date.now(),
      name: name || "Unnamed Site",
      status,
      employees: Number(employees) || 0,
      vehicles: Number(vehicles) || 0,
      tasks: Number(tasks) || 0,
      issues: Number(issues) || 0,
      risk: Number(risk) || 0,
    };

    if (editingSiteId) {
      updateSite(site);
      setSelectedSite(site);
    } else {
      addSite(site);
      setSelectedSite(site);
    }

    resetForm();
  }

  function handleDeleteSite() {
    if (!selectedSite) return;

    deleteSite(selectedSite.id);
    const remaining = sites.filter((site) => site.id !== selectedSite.id);
    setSelectedSite(remaining[0]);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Operations</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Sites Command Center
          </h1>
          <p className="mt-2 text-slate-500">
            Monitor sites, resources, tasks, issues and operational risk.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          New Site
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sites..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <button
              key={site.id}
              onClick={() => setSelectedSite(site)}
              className="rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {site.name}
                    </h2>
                    <p className="text-sm text-slate-500">Operational site</p>
                  </div>
                </div>

                <Badge color={getBadgeColor(site.status)}>
                  {site.status}
                </Badge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Stat title="Employees" value={String(site.employees)} />
                <Stat title="Vehicles" value={String(site.vehicles)} />
                <Stat title="Tasks" value={String(site.tasks)} />
                <Stat title="Risk" value={`${site.risk}%`} />
              </div>

              <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-sm font-semibold">AI Recommendation</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {site.risk > 70
                    ? "High risk. Deploy additional resources immediately."
                    : site.issues > 0
                    ? "Open issues detected. Review site status today."
                    : "Operations are stable."}
                </p>
              </div>
            </button>
          ))}
        </div>

        {selectedSite ? (
          <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-blue-600">Site Details</p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {selectedSite.name}
            </h2>

            <div className="mt-4">
              <Badge color={getBadgeColor(selectedSite.status)}>
                {selectedSite.status}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Info label="Employees" value={String(selectedSite.employees)} />
              <Info label="Vehicles" value={String(selectedSite.vehicles)} />
              <Info label="Tasks" value={String(selectedSite.tasks)} />
              <Info label="Issues" value={String(selectedSite.issues)} />
              <Info label="Risk Score" value={`${selectedSite.risk}%`} />
              <Info label="Status" value={selectedSite.status} />
            </div>

            <div className="mt-7 rounded-2xl bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-blue-400" />
                <p className="text-sm font-semibold">AI Site Brief</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {selectedSite.risk > 70
                  ? `${selectedSite.name} is high risk. Increase staffing and check open issues.`
                  : `${selectedSite.name} is currently operating within normal range.`}
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
                onClick={handleDeleteSite}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </aside>
        ) : (
          <aside className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            No site selected.
          </aside>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  {editingSiteId ? "Edit Site" : "New Site"}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {editingSiteId ? "Update site" : "Create operational site"}
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
                placeholder="Site name"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option>Active</option>
                <option>Maintenance</option>
                <option>Critical</option>
              </select>

              <input value={employees} onChange={(e) => setEmployees(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Employees" type="number" />
              <input value={vehicles} onChange={(e) => setVehicles(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Vehicles" type="number" />
              <input value={tasks} onChange={(e) => setTasks(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Tasks" type="number" />
              <input value={issues} onChange={(e) => setIssues(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Issues" type="number" />
              <input value={risk} onChange={(e) => setRisk(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Risk score" type="number" />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveSite}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {editingSiteId ? "Save Changes" : "Create Site"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs uppercase text-slate-400">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
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
  if (status === "Critical") return "red";
  if (status === "Maintenance") return "orange";
  if (status === "Active") return "green";
  return "blue";
}