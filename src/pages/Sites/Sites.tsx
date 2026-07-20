import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Edit,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  Truck,
  ClipboardList,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

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

  const active = sites.filter((s) => s.status === "Active").length;
  const maintenance = sites.filter((s) => s.status === "Maintenance").length;
  const critical = sites.filter((s) => s.status === "Critical").length;
  const highRisk = sites.filter((s) => s.risk >= 70).length;

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
    <div className="pb-10 text-white">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Site Operations
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            Sites Command
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            Monitor sites, resources, tasks, issues and operational risk.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/20"
        >
          <Plus size={18} />
          New Site
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <SiteKPI icon={<Building2 />} title="Total Sites" value={sites.length} note="Monitored sites" color="blue" />
        <SiteKPI icon={<MapPin />} title="Active" value={active} note="Online sites" color="green" />
        <SiteKPI icon={<AlertTriangle />} title="Maintenance" value={maintenance} note="Needs review" color="orange" />
        <SiteKPI icon={<AlertTriangle />} title="Critical" value={critical + highRisk} note="High risk" color="red" />
      </div>

      <div className="my-6 flex items-center gap-3 rounded-3xl border border-blue-400/30 bg-slate-900/95 px-5 py-4 shadow-2xl shadow-blue-500/10">
        <Search size={18} className="text-cyan-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sites or status..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <Panel title="Operational Sites">
          {filteredSites.length === 0 ? (
            <p className="text-sm text-slate-400">No sites found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-left transition hover:border-cyan-400/40 hover:bg-slate-900"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
                        <Building2 size={24} />
                      </div>

                      <div>
                        <p className="font-black text-white">{site.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Operational Site
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={site.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniMetric
                      icon={<Users size={15} />}
                      label="Employees"
                      value={String(site.employees)}
                    />

                    <MiniMetric
                      icon={<Truck size={15} />}
                      label="Vehicles"
                      value={String(site.vehicles)}
                    />

                    <MiniMetric
                      icon={<ClipboardList size={15} />}
                      label="Tasks"
                      value={String(site.tasks)}
                    />

                    <MiniMetric
                      icon={<AlertTriangle size={15} />}
                      label="Issues"
                      value={String(site.issues)}
                    />
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">Risk Score</span>
                      <span className="font-black text-white">
                        {site.risk}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className={`h-2 rounded-full ${
                          site.risk >= 70
                            ? "bg-red-400"
                            : site.risk >= 40
                            ? "bg-orange-400"
                            : "bg-green-400"
                        }`}
                        style={{ width: `${site.risk}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {selectedSite ? (
          <Panel title="Site Details">
            <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
              Selected Site
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              {selectedSite.name}
            </h2>

            <div className="mt-5">
              <StatusBadge status={selectedSite.status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <InfoDark
                label="Employees"
                value={String(selectedSite.employees)}
              />
              <InfoDark
                label="Vehicles"
                value={String(selectedSite.vehicles)}
              />
              <InfoDark
                label="Tasks"
                value={String(selectedSite.tasks)}
              />
              <InfoDark
                label="Issues"
                value={String(selectedSite.issues)}
              />
              <InfoDark
                label="Risk"
                value={`${selectedSite.risk}%`}
              />
              <InfoDark
                label="Status"
                value={selectedSite.status}
              />
            </div>

            <div className="mt-7 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <AlertTriangle size={18} />
                <p className="text-sm font-black">AI Site Brief</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {selectedSite.risk > 70
                  ? `${selectedSite.name} requires immediate operational review.`
                  : selectedSite.issues > 0
                  ? "Review open issues before the next mission."
                  : "Site is healthy and mission ready."}
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-black text-white"
              >
                <Edit size={16} />
                Edit
              </button>

              <button
                onClick={handleDeleteSite}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </Panel>
        ) : (
          <Panel title="Site Details">
            <p className="text-slate-400">No site selected.</p>
          </Panel>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-blue-400/30 bg-slate-900 p-6 shadow-2xl shadow-blue-500/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
                  {editingSiteId ? "Edit Site" : "New Site"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {editingSiteId ? "Update operational site" : "Create new site"}
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
              <DarkInput value={name} onChange={setName} placeholder="Site name" />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option>Active</option>
                <option>Maintenance</option>
                <option>Critical</option>
              </select>

              <DarkInput value={employees} onChange={setEmployees} placeholder="Employees" />
              <DarkInput value={vehicles} onChange={setVehicles} placeholder="Vehicles" />
              <DarkInput value={tasks} onChange={setTasks} placeholder="Tasks" />
              <DarkInput value={issues} onChange={setIssues} placeholder="Issues" />
              <DarkInput value={risk} onChange={setRisk} placeholder="Risk %" />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-black text-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveSite}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white"
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-blue-400/30 bg-slate-900/95 p-6 shadow-2xl shadow-blue-500/20">
      <h2 className="mb-5 text-2xl font-black text-white">{title}</h2>
      {children}
    </div>
  );
}

function SiteKPI({
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
    <div className={`rounded-3xl border bg-slate-900/95 p-6 shadow-xl ${colors[color]}`}>
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

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
      <div className="mb-2 text-cyan-300">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function InfoDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
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