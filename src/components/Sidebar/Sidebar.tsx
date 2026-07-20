import {
  BarChart3,
  Bot,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

type NavigationItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    title: "Command",
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
      {
        label: "Live Map",
        path: "/command",
        icon: Map,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Fleet",
        path: "/fleet",
        icon: Truck,
      },
      {
        label: "Sites",
        path: "/sites",
        icon: Building2,
      },
      {
        label: "Tasks",
        path: "/tasks",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        label: "Employees",
        path: "/employees",
        icon: Users,
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        label: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
      {
        label: "Reports",
        path: "/reports",
        icon: FileText,
      },
      {
        label: "AI Commander",
        path: "/ai",
        icon: Bot,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#080b12]/95 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "w-[88px]" : "w-[280px]"
      }`}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-lg shadow-cyan-500/10">
            <ShieldCheck size={24} />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-[0.14em] text-white">
                NEXORA
              </p>

              <p className="truncate text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Command OS
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-white/10 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `group relative flex min-h-12 items-center rounded-2xl border transition-all duration-200 ${
                          collapsed
                            ? "justify-center px-3"
                            : "gap-3 px-4"
                        } ${
                          isActive
                            ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200 shadow-lg shadow-cyan-500/5"
                            : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
                          )}

                          <Icon
                            size={20}
                            className="shrink-0"
                          />

                          {!collapsed && (
                            <span className="truncate text-sm font-bold">
                              {item.label}
                            </span>
                          )}

                          {collapsed && (
                            <span className="pointer-events-none absolute left-[76px] z-50 whitespace-nowrap rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-2xl transition group-hover:opacity-100">
                              {item.label}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div
          className={`rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] ${
            collapsed ? "p-3" : "p-4"
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>

            {!collapsed && (
              <div>
                <p className="text-xs font-black text-emerald-300">
                  System Online
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  All services connected
                </p>
              </div>
            )}
          </div>
        </div>

        {!collapsed && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <SystemStat
              label="GPS"
              value="Online"
            />

            <SystemStat
              label="API"
              value="Connected"
            />
          </div>
        )}
      </div>
    </aside>
  );
}

function SystemStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-bold text-slate-300">
        {value}
      </p>
    </div>
  );
}