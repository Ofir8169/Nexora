import { useState } from "react";
import {
  AlertTriangle,
  Battery,
  CheckCircle2,
  Edit,
  Fuel,
  MapPin,
  Plus,
  Search,
  Signal,
  Trash2,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import { useApp } from "../../context/app-context";
import { useLocation } from "react-router-dom";
import { getLocale, localized } from "../../lib/preferences";
import EntityActivity from "../../components/ui-v2/EntityActivity";
import EntityNotes from "../../components/ui-v2/EntityNotes";

export default function Fleet() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const location = useLocation();
  const { fleet, addVehicle, updateVehicle, deleteVehicle } = useApp();

  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    const selectedId = Number((location.state as { selectedId?: unknown } | null)?.selectedId);
    return fleet.find((vehicle) => vehicle.id === selectedId) ?? fleet[0];
  });
  const [isModalOpen, setIsModalOpen] = useState(
    () => location.state?.quickCreate === "vehicle"
  );
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [site, setSite] = useState("");
  const [status, setStatus] = useState("Active");
  const [health, setHealth] = useState("90%");
  const [issues, setIssues] = useState("0");

  const active = fleet.filter((v) => v.status === "Active").length;
  const maintenance = fleet.filter((v) => v.status === "Maintenance").length;
  const critical = fleet.filter((v) => v.status === "Critical").length;

  const filteredFleet = fleet.filter((vehicle) =>
    `${vehicle.name} ${vehicle.type} ${vehicle.site} ${vehicle.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function resetForm() {
    setName("");
    setType("");
    setSite("");
    setStatus("Active");
    setHealth("90%");
    setIssues("0");
    setEditingVehicleId(null);
    setIsModalOpen(false);
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal() {
    if (!selectedVehicle) return;

    setEditingVehicleId(selectedVehicle.id);
    setName(selectedVehicle.name);
    setType(selectedVehicle.type);
    setSite(selectedVehicle.site);
    setStatus(selectedVehicle.status);
    setHealth(selectedVehicle.health);
    setIssues(String(selectedVehicle.issues));
    setIsModalOpen(true);
  }

  function handleSaveVehicle() {
    const vehicle = {
      id: editingVehicleId || Date.now(),
      name: name || "Unnamed Vehicle",
      type: type || "Equipment",
      site: site || "No site",
      status,
      health: health || "90%",
      issues: Number(issues) || 0,
    };

    if (editingVehicleId) {
      updateVehicle(vehicle);
      setSelectedVehicle(vehicle);
    } else {
      addVehicle(vehicle);
      setSelectedVehicle(vehicle);
    }

    resetForm();
  }

  function handleDeleteVehicle() {
    if (!selectedVehicle) return;

    deleteVehicle(selectedVehicle.id);
    const remaining = fleet.filter((vehicle) => vehicle.id !== selectedVehicle.id);
    setSelectedVehicle(remaining[0]);
  }

  return (
    <div className="pb-10 text-white">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            {t("Fleet Operations", "ניהול צי")}
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            {t("Fleet Command", "מרכז צי הרכב")}
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            {t("Monitor vehicle health, readiness, locations and critical issues.", "מעקב אחר כשירות, מיקום ותקלות קריטיות בצי הרכב.")}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/20"
        >
          <Plus size={18} />
          {t("New Vehicle", "רכב חדש")}
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <FleetKPI icon={<Truck />} title={t("Total Assets", "סך רכבים")} value={fleet.length} note={t("Fleet tracked", "רכבים במעקב")} color="blue" />
        <FleetKPI icon={<CheckCircle2 />} title={t("Operational", "פעילים")} value={active} note={t("Ready to deploy", "מוכנים לפעילות")} color="green" />
        <FleetKPI icon={<Wrench />} title={t("Maintenance", "בטיפול")} value={maintenance} note={t("Service required", "נדרש שירות")} color="orange" />
        <FleetKPI icon={<AlertTriangle />} title={t("Critical", "קריטיים")} value={critical} note={t("Needs review", "דורשים בדיקה")} color="red" />
      </div>

      <div className="my-6 flex items-center gap-3 rounded-3xl border border-blue-400/30 bg-slate-900/95 px-5 py-4 shadow-2xl shadow-blue-500/10">
        <Search size={18} className="text-cyan-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search vehicles, sites or status...", "חיפוש לפי רכב, אתר או סטטוס...")}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <Panel title={t("Fleet Assets", "רכבי הצי")}>
          {filteredFleet.length === 0 ? (
            <p className="text-sm text-slate-400">{t("No vehicles found.", "לא נמצאו רכבים.")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredFleet.map((vehicle) => {
                const healthNumber = Number(vehicle.health.replace("%", "")) || 0;

                return (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-left transition hover:border-blue-400/40 hover:bg-slate-900"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
                          <Truck size={23} />
                        </div>

                        <div>
                          <p className="font-black text-white">{vehicle.name}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            {vehicle.type}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={vehicle.status} />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <MapPin size={16} className="text-cyan-400" />
                      {vehicle.site}
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <MiniMetric icon={<Battery size={15} />} label="Battery" value={`${Math.max(20, healthNumber - 6)}%`} />
                      <MiniMetric icon={<Fuel size={15} />} label="Fuel" value={`${Math.max(18, healthNumber - 18)}%`} />
                      <MiniMetric icon={<Signal size={15} />} label="LTE" value="Online" />
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">{t("Health", "כשירות")}</span>
                        <span className="font-black text-white">{vehicle.health}</span>
                      </div>

                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className={`h-2 rounded-full ${
                            vehicle.status === "Critical"
                              ? "bg-red-400"
                              : vehicle.status === "Maintenance"
                              ? "bg-orange-400"
                              : "bg-green-400"
                          }`}
                          style={{ width: vehicle.health }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Panel>

        {selectedVehicle ? (
          <Panel title={t("Vehicle Details", "פרטי רכב")}>
            <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
              {t("Selected Asset", "רכב שנבחר")}
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              {selectedVehicle.name}
            </h2>

            <p className="mt-2 text-slate-400">{selectedVehicle.type}</p>

            <div className="mt-5">
              <StatusBadge status={selectedVehicle.status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <InfoDark label={t("Site", "אתר")} value={selectedVehicle.site} />
              <InfoDark label={t("Status", "סטטוס")} value={selectedVehicle.status} />
              <InfoDark label={t("Health", "כשירות")} value={selectedVehicle.health} />
              <InfoDark label={t("Issues", "תקלות")} value={String(selectedVehicle.issues)} />
            </div>

            <div className="mt-7 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Battery size={18} />
                <p className="text-sm font-black">{t("AI Fleet Brief", "סיכום צי חכם")}</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {selectedVehicle.status === "Critical"
                  ? t(`${selectedVehicle.name} should not be deployed before inspection.`, `אין להוציא את ${selectedVehicle.name} לפעילות לפני בדיקה.`)
                  : selectedVehicle.status === "Maintenance"
                  ? t(`${selectedVehicle.name} is due for maintenance.`, `${selectedVehicle.name} ממתין לטיפול תחזוקה.`)
                  : t(`${selectedVehicle.name} is operational and ready for deployment.`, `${selectedVehicle.name} תקין ומוכן לפעילות.`)}
              </p>
            </div>

            <EntityActivity createdLabel={t("Vehicle added to fleet", "הרכב נוסף לצי")} updatedLabel={t(`Health updated to ${selectedVehicle.health}`, `הכשירות עודכנה ל-${selectedVehicle.health}`)} />
            <EntityNotes key={`vehicle_${selectedVehicle.id}`} entityKey={`vehicle_${selectedVehicle.id}`} />

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-black text-white hover:bg-slate-700"
              >
                <Edit size={16} />
                {t("Edit", "עריכה")}
              </button>

              <button
                onClick={handleDeleteVehicle}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-500"
              >
                <Trash2 size={16} />
                {t("Delete", "מחיקה")}
              </button>
            </div>
          </Panel>
        ) : (
          <Panel title={t("Vehicle Details", "פרטי רכב")}>
            <p className="text-sm text-slate-400">{t("No vehicle selected.", "לא נבחר רכב.")}</p>
          </Panel>
        )}
      </div>

{isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-blue-400/30 bg-slate-900 p-6 shadow-2xl shadow-blue-500/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
                  {editingVehicleId ? "Edit Vehicle" : "New Vehicle"}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {editingVehicleId ? "Update asset" : "Create fleet asset"}
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
              <DarkInput value={name} onChange={setName} placeholder="Vehicle name" />
              <DarkInput value={type} onChange={setType} placeholder="Type" />
              <DarkInput value={site} onChange={setSite} placeholder="Site" />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option>Active</option>
                <option>Maintenance</option>
                <option>Critical</option>
              </select>

              <DarkInput value={health} onChange={setHealth} placeholder="Health, example: 91%" />

              <input
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Open issues"
                type="number"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-black text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveVehicle}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20"
              >
                {editingVehicleId ? "Save Changes" : "Create Vehicle"}
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

function FleetKPI({
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
    blue: "border-blue-400/50 text-blue-300 shadow-blue-500/20",
    green: "border-green-400/50 text-green-300 shadow-green-500/20",
    orange: "border-orange-400/50 text-orange-300 shadow-orange-500/20",
    red: "border-red-400/50 text-red-300 shadow-red-500/20",
  };

  return (
    <div className={`rounded-3xl border bg-slate-900/95 p-6 shadow-2xl ${colors[color]}`}>
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

function InfoDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
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
      <p className="mt-1 text-xs font-black text-white">{value}</p>
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
