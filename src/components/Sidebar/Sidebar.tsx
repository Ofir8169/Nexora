import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  Truck,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ClipboardList, label: "Tasks", path: "/tasks" },
  { icon: MapPinned, label: "Sites", path: "/sites" },
  { icon: Truck, label: "Fleet", path: "/fleet" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col bg-slate-950 p-6 text-white">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600">
          <Sparkles size={22} />
        </div>

        <div>
          <h1 className="text-xl font-bold leading-tight">OpsFlow</h1>
          <p className="text-xs text-slate-400">Command Center</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-slate-900 p-4 ring-1 ring-slate-800">
        <p className="text-sm font-semibold">AI Daily Brief</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          3 issues need attention before tomorrow morning.
        </p>
      </div>
    </aside>
  );
}