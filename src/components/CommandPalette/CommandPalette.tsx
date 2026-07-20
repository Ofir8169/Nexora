import { useEffect, useState } from "react";
import {
  BarChart3,
  Bot,
  ClipboardList,
  FileText,
  Map,
  MapPin,
  Search,
  Settings,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const commands = [
  { label: "Open Command Center", path: "/command", icon: Bot },
  { label: "Open Dashboard", path: "/", icon: BarChart3 },
  { label: "Open Tasks", path: "/tasks", icon: ClipboardList },
  { label: "Open Fleet", path: "/fleet", icon: Truck },
  { label: "Open Sites", path: "/sites", icon: MapPin },
  { label: "Open Employees", path: "/employees", icon: Users },
  { label: "Open Live Map", path: "/map", icon: Map },
  { label: "Open Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Open Reports", path: "/reports", icon: FileText },
  { label: "Ask AI Copilot", path: "/ai", icon: Bot },
  { label: "Open Settings", path: "/settings", icon: Settings },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((value) => !value);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function runCommand(path: string) {
    navigate(path);
    setOpen(false);
    setQuery("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-blue-400/20 bg-slate-950 p-3 shadow-2xl shadow-blue-500/20">
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2">
          <Search size={16} className="text-cyan-400" />

          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search command..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
          >
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[320px] space-y-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="rounded-xl bg-slate-900 p-3 text-sm text-slate-400">
              No commands found.
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;

              return (
                <button
                  key={cmd.label}
                  onClick={() => runCommand(cmd.path)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-900"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                    <Icon size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">{cmd.label}</p>
                    <p className="text-[11px] text-slate-500">Navigate</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-slate-500">
          Esc close · Ctrl + K toggle
        </div>
      </div>
    </div>
  );
}