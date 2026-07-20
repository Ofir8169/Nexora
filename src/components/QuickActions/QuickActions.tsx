import { useState } from "react";
import { Bot, ClipboardList, FileText, MapPin, Plus, Truck, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { label: "Add Task", icon: ClipboardList, path: "/tasks" },
    { label: "Add Vehicle", icon: Truck, path: "/fleet" },
    { label: "Add Site", icon: MapPin, path: "/sites" },
    { label: "Add Employee", icon: UserPlus, path: "/employees" },
    { label: "Ask AI", icon: Bot, path: "/ai" },
    { label: "Generate Report", icon: FileText, path: "/reports" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-black text-white"
      >
        <Plus size={18} />
        Quick Action
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-72 rounded-3xl border border-blue-400/30 bg-slate-900 p-4 shadow-2xl shadow-blue-500/20">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-black text-white">Quick Actions</p>

            <button
              onClick={() => setOpen(false)}
              className="rounded-xl bg-slate-800 p-2 text-slate-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  onClick={() => {
                    navigate(action.path);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:border-cyan-400/40 hover:bg-slate-800"
                >
                  <Icon size={18} className="text-cyan-300" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}