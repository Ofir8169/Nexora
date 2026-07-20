import { useMemo, useState } from "react";
import { ClipboardList, MapPin, Search, Truck, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function GlobalSearch() {
  const { tasks, fleet, sites, employees } = useApp();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return [];

    const taskResults = tasks
      .filter((item) =>
        `${item.title} ${item.site} ${item.owner} ${item.status}`
          .toLowerCase()
          .includes(q)
      )
      .map((item) => ({
        id: `task-${item.id}`,
        type: "Task",
        title: item.title,
        subtitle: `${item.site} • ${item.status}`,
        path: "/tasks",
        icon: ClipboardList,
      }));

    const fleetResults = fleet
      .filter((item) =>
        `${item.name} ${item.type} ${item.site} ${item.status}`
          .toLowerCase()
          .includes(q)
      )
      .map((item) => ({
        id: `fleet-${item.id}`,
        type: "Vehicle",
        title: item.name,
        subtitle: `${item.site} • ${item.status}`,
        path: "/fleet",
        icon: Truck,
      }));

    const siteResults = sites
      .filter((item) =>
        `${item.name} ${item.status}`.toLowerCase().includes(q)
      )
      .map((item) => ({
        id: `site-${item.id}`,
        type: "Site",
        title: item.name,
        subtitle: `${item.status} • ${item.risk}% risk`,
        path: "/sites",
        icon: MapPin,
      }));

    const employeeResults = employees
      .filter((item) =>
        `${item.name} ${item.role} ${item.site} ${item.status}`
          .toLowerCase()
          .includes(q)
      )
      .map((item) => ({
        id: `employee-${item.id}`,
        type: "Employee",
        title: item.name,
        subtitle: `${item.role} • ${item.status}`,
        path: "/employees",
        icon: User,
      }));

    return [
      ...taskResults,
      ...fleetResults,
      ...siteResults,
      ...employeeResults,
    ].slice(0, 8);
  }, [query, tasks, fleet, sites, employees]);

  function openResult(path: string) {
    navigate(path);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
        <Search size={18} className="text-cyan-400" />

        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Search operations..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="text-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute left-0 top-14 z-50 w-full rounded-3xl border border-blue-400/30 bg-slate-900 p-3 shadow-2xl shadow-blue-500/20">
          {results.length === 0 ? (
            <div className="rounded-2xl bg-slate-950/70 p-4 text-sm text-slate-400">
              No results found.
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => {
                const Icon = result.icon;

                return (
                  <button
                    key={result.id}
                    onClick={() => openResult(result.path)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left hover:border-cyan-400/40 hover:bg-slate-800"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
                        {result.type}
                      </p>
                      <p className="font-black text-white">{result.title}</p>
                      <p className="text-xs text-slate-400">
                        {result.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}