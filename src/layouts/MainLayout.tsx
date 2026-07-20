import {
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  ClipboardList,
  LogOut,
  Map,
  Moon,
  RadioTower,
  Settings,
  Sparkles,
  UserCircle2,
  Wifi,
  X,
  Zap,
} from "lucide-react";

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import GlobalSearch from "../components/GlobalSearch/GlobalSearch";
import QuickActions from "../components/QuickActions/QuickActions";
import CommandPalette from "../components/CommandPalette/CommandPalette";

import AICopilot from "../features/ai/AICopilot";
import { useApp } from "../context/AppContext";

const nav = [
  {
    title: "COMMAND",
    items: [
      {
        icon: RadioTower,
        label: "Mission Control",
        path: "/",
      },
      {
        icon: Map,
        label: "Operations",
        path: "/map",
      },
    ],
  },

  {
    title: "OPERATIONS",
    items: [
      {
        icon: ClipboardList,
        label: "Tasks",
        path: "/tasks",
      },
      {
        icon: BarChart3,
        label: "Analytics",
        path: "/analytics",
      },
    ],
  },

  {
    title: "INTELLIGENCE",
    items: [
      {
        icon: Bot,
        label: "AI Commander",
        path: "/ai",
      },
      {
        icon: Settings,
        label: "Settings",
        path: "/settings",
      },
    ],
  },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [aiOpen, setAiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [notifications] = useState([
    {
      level: "critical",
      title: "BW104 Lost GPS",
    },
    {
      level: "warning",
      title: "Maintenance Due",
    },
    {
      level: "success",
      title: "Mission Completed",
    },
  ]);

  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const {
    fleet,
    employees,
    sites,
    tasks,
  } = useApp();

  const user =
    localStorage.getItem("nexora_user") ??
    "operator@nexora.ai";

  const criticalFleet =
    fleet.filter(
      (v) => v.status === "Critical"
    ).length;

  const openTasks =
    tasks.filter(
      (t) => t.status !== "Done"
    ).length;

  const availableEmployees =
    employees.filter(
      (e) => e.status === "Available"
    ).length;

  function logout() {
    localStorage.removeItem("nexora_logged_in");
    localStorage.removeItem("nexora_user");
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(59,130,246,0.14),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_35%)]" />

      <CommandPalette /><header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 backdrop-blur-2xl">

  <div className="flex items-center justify-between gap-6 px-8 py-5">

    <div className="flex items-center gap-4">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 ring-1 ring-cyan-400/20">

        <Sparkles
          size={22}
          className="text-cyan-300"
        />

      </div>

      <div>

        <h1 className="text-xl font-black tracking-tight">
          Nexora Command OS
        </h1>

        <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
          Autonomous Operations Platform
        </p>

      </div>

    </div>

    <div className="flex-1 max-w-xl">

      <GlobalSearch />

    </div>

    <div className="flex items-center gap-3">

      <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">

        <Wifi
          size={15}
          className="text-green-400"
        />

        <span className="text-xs font-bold text-green-400">
          Connected
        </span>

      </div>

      <div className="hidden xl:block rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">

        <p className="text-xs text-slate-500">
          UTC
        </p>

        <p className="font-bold">
          {clock.toLocaleTimeString()}
        </p>

      </div>

      <button className="rounded-2xl border border-white/10 bg-slate-900 p-3 hover:border-cyan-400/30">

        <Moon size={18} />

      </button>

      <button className="relative rounded-2xl border border-white/10 bg-slate-900 p-3 hover:border-cyan-400/30">

        <Bell size={18} />

        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black">

          {notifications.length}

        </span>

      </button>

      <button
        onClick={() => setAiOpen(true)}
        className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-cyan-300 hover:bg-cyan-500/20"
      >

        <Bot size={18} />

      </button>

      <div className="relative">

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 hover:bg-slate-800"
        >

          <UserCircle2
            className="text-cyan-300"
            size={22}
          />

          <div className="hidden xl:block text-left">

            <p className="font-bold">
              Ofir
            </p>

            <p className="text-xs text-slate-500">
              {user}
            </p>

          </div>

          <ChevronDown size={16} />

        </button>

        {menuOpen && (

          <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">

            <button className="flex w-full items-center gap-3 px-5 py-4 hover:bg-slate-800">

              <UserCircle2 size={18} />

              Profile

            </button>

            <button className="flex w-full items-center gap-3 px-5 py-4 hover:bg-slate-800">

              <Settings size={18} />

              Settings

            </button>

            <div className="border-t border-white/10" />

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500/10"
            >

              <LogOut size={18} />

              Logout

            </button>

          </div>

        )}

      </div>

      <QuickActions />

    </div>

  </div><nav className="border-t border-white/10 bg-[#07101F]">

          <div className="mx-auto flex max-w-[1800px] gap-2 overflow-x-auto px-8 py-3">

            {nav.map((section) => (

              <div
                key={section.title}
                className="mr-6 flex items-center gap-2"
              >

                <span className="mr-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-600">
                  {section.title}
                </span>

                {section.items.map((item) => {

                  const Icon = item.icon;

                  return (

                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${
                          isActive
                            ? "bg-cyan-500/15 text-white ring-1 ring-cyan-400/30"
                            : "text-slate-400 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <Icon size={16} />

                      {item.label}

                    </NavLink>

                  );

                })}

              </div>

            ))}

          </div>

        </nav>

        <div className="border-t border-white/5 bg-[#08101d]">

          <div className="mx-auto flex max-w-[1800px] items-center gap-4 overflow-x-auto px-8 py-3">

            <StatusDot
              color="bg-green-400"
              label="API Connected"
            />

            <StatusDot
              color="bg-cyan-400"
              label="AI Online"
            />

            <StatusDot
              color="bg-blue-400"
              label={`${sites.length} Sites`}
            />

            <StatusDot
              color="bg-orange-400"
              label={`${fleet.length} Vehicles`}
            />

            <StatusDot
              color="bg-purple-400"
              label={`${availableEmployees} Operators`}
            />

            <StatusDot
              color="bg-red-400"
              label={`${criticalFleet} Critical`}
            />

            <StatusDot
              color="bg-yellow-400"
              label={`${openTasks} Open Tasks`}
            />

            <StatusDot
              color="bg-emerald-400"
              label="Local Sync"
            />

          </div>

        </div>

      </header>

      <main className="mx-auto w-full max-w-[1800px] px-8 py-8">

        <div className="animate-in fade-in duration-500">

          {children}

        </div>

      </main>{aiOpen && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm">

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-cyan-400/20 bg-[#070B13] shadow-2xl shadow-cyan-500/20">

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                  AI COMMANDER
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Nexora Copilot
                </h2>

              </div>

              <button
                onClick={() => setAiOpen(false)}
                className="rounded-xl border border-white/10 p-3 hover:bg-white/5"
              >
                <X size={18} />
              </button>

            </div>

            <div className="flex-1 overflow-auto p-6">

              <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-5">

                <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                  Suggested Commands
                </p>

                <div className="flex flex-wrap gap-2">

                  {[
                    "Show Critical Fleet",
                    "Assign Mission",
                    "Generate Report",
                    "Locate Operator",
                    "Fleet Health",
                    "Open Analytics",
                  ].map((command) => (
                    <button
                      key={command}
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm transition hover:border-cyan-400/30 hover:text-cyan-300"
                    >
                      {command}
                    </button>
                  ))}

                </div>

              </div>

              <AICopilot />

            </div>

          </aside>

        </div>
      )}

      <div className="fixed bottom-6 right-6 z-40 hidden items-center gap-3 rounded-2xl border border-cyan-400/20 bg-slate-950/95 px-5 py-3 shadow-2xl shadow-cyan-500/20 xl:flex">

        <Zap
          size={16}
          className="text-cyan-300"
        />

        <div>

          <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Command Palette
          </p>

          <p className="text-xs text-slate-400">
            Press <span className="font-bold text-white">Ctrl + K</span>
          </p>

        </div>

      </div>

    </div>
  );
}

function StatusDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">

      <span
        className={`h-2.5 w-2.5 rounded-full ${color} animate-pulse`}
      />

      <span className="text-xs font-semibold text-slate-300">
        {label}
      </span>

    </div>
  );
}