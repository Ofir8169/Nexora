import { useState } from "react";
import { Bot, ClipboardList, Download, FileText, MapPin, Plus, Truck, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "../../context/app-context";
import { getLocale, localized } from "../../lib/preferences";

type QuickAction = {
  label: string;
  icon: LucideIcon;
  path?: string;
  quickCreate?: string;
  onRun?: () => void;
};

export default function QuickActions() {
  const { tasks } = useApp();
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function exportTasks() {
    const columns = ["ID", "Title", "Site", "Owner", "Priority", "Status", "Due"];
    const rows = tasks.map((task) => [task.id, task.title, task.site, task.owner, task.priority, task.status, task.due]);
    const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexora-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("Tasks exported", "המשימות יוצאו בהצלחה"));
  }

  const actions: QuickAction[] = [
    { label: t("Add Task", "הוספת משימה"), icon: ClipboardList, path: "/tasks", quickCreate: "task" },
    { label: t("Add Vehicle", "הוספת רכב"), icon: Truck, path: "/fleet", quickCreate: "vehicle" },
    { label: t("Add Site", "הוספת אתר"), icon: MapPin, path: "/sites", quickCreate: "site" },
    { label: t("Add Employee", "הוספת עובד"), icon: UserPlus, path: "/employees", quickCreate: "employee" },
    { label: t("Add Customer", "הוספת לקוח"), icon: UserPlus, path: "/business", quickCreate: "customer" },
    { label: t("New Invoice", "חשבונית חדשה"), icon: FileText, path: "/business", quickCreate: "invoice" },
    { label: t("Ask AI", "שאלה ל-AI"), icon: Bot, path: "/ai" },
    { label: t("Generate Report", "הפקת דוח"), icon: FileText, path: "/reports" },
    { label: t("Export tasks CSV", "ייצוא משימות ל-CSV"), icon: Download, onRun: exportTasks },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700"
      >
        <Plus size={18} />
        {t("Quick Action", "פעולה מהירה")}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">{t("Quick actions", "פעולות מהירות")}</p>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close quick actions"
              className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
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
                    if (action.onRun) action.onRun();
                    else if (action.path) navigate(action.path, { state: { quickCreate: action.quickCreate } });
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <Icon size={17} />
                  </span>
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
