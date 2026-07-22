import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, Bell, Check, FileWarning, ShieldAlert, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useBusiness } from "../../business/context/business-context";
import { useApp } from "../../context/app-context";
import { getLocale, localized } from "../../lib/preferences";

type SmartNotification = {
  id: string;
  title: string;
  description: string;
  tone: "critical" | "warning" | "info";
  path: string;
};

export default function NotificationCenter() {
  const locale = getLocale();
  const t = useCallback((en: string, he: string) => localized(en, he, locale), [locale]);
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<string[]>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem("nexora_read_alerts") ?? "[]");
      return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
    } catch {
      return [];
    }
  });
  const { fleet, sites, tasks } = useApp();
  const { invoices, dashboard } = useBusiness();
  const navigate = useNavigate();

  const notifications = useMemo<SmartNotification[]>(() => {
    const items: SmartNotification[] = [];
    fleet.filter((item) => item.status === "Critical").forEach((item) => items.push({
      id: `fleet-${item.id}-${item.status}`,
      title: t(`${item.name} requires attention`, `${item.name} דורש טיפול`),
      description: t(`${item.issues} open issues at ${item.site}`, `${item.issues} תקלות פתוחות ב-${item.site}`),
      tone: "critical",
      path: "/fleet",
    }));
    sites.filter((item) => item.risk >= 70).forEach((item) => items.push({
      id: `site-${item.id}-${item.risk}`,
      title: t(`High risk at ${item.name}`, `סיכון גבוה ב-${item.name}`),
      description: t(`Risk level is currently ${item.risk}%`, `רמת הסיכון הנוכחית היא ${item.risk}%`),
      tone: "warning",
      path: "/sites",
    }));
    invoices.filter((item) => item.status === "Overdue").forEach((item) => items.push({
      id: `invoice-${item.id}-${item.status}`,
      title: t(`${item.documentNumber} is overdue`, `${item.documentNumber} באיחור`),
      description: t(`${formatCurrency(item.total)} is awaiting collection`, `${formatCurrency(item.total)} ממתינים לגבייה`),
      tone: "critical",
      path: "/business",
    }));
    const urgentTasks = tasks.filter((item) => item.status !== "Done" && ["Critical", "High"].includes(item.priority));
    if (urgentTasks.length) items.push({
      id: `tasks-${urgentTasks.length}`,
      title: t(`${urgentTasks.length} priority tasks are open`, `${urgentTasks.length} משימות דחופות פתוחות`),
      description: t("Review assignments and deadlines", "כדאי לבדוק שיוכים ומועדי יעד"),
      tone: "warning",
      path: "/tasks",
    });
    if (!items.length && dashboard) items.push({
      id: "all-clear",
      title: t("Everything looks stable", "הכול נראה יציב"),
      description: t("No critical business or operational alerts", "אין כרגע התראות קריטיות"),
      tone: "info",
      path: "/",
    });
    return items;
  }, [dashboard, fleet, invoices, sites, tasks, t]);

  const unread = notifications.filter((item) => !read.includes(item.id)).length;

  function markAllRead() {
    const next = notifications.map((item) => item.id);
    setRead(next);
    localStorage.setItem("nexora_read_alerts", JSON.stringify(next));
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t(`Notifications, ${unread} unread`, `התראות, ${unread} לא נקראו`)}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-800"
      >
        <Bell size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div>
              <p className="font-semibold text-slate-900">{t("Smart alerts", "התראות חכמות")}</p>
              <p className="text-xs text-slate-500">{t("Live priorities across Nexora", "עדיפויות בזמן אמת מכל המערכת")}</p>
            </div>
            <div className="flex gap-1">
              <button type="button" aria-label={t("Mark all as read", "סמן הכול כנקרא")} onClick={markAllRead} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"><Check size={17} /></button>
              <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button>
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-2">
            {notifications.map((item) => {
              const Icon = item.tone === "critical" ? ShieldAlert : item.tone === "warning" ? AlertTriangle : Sparkles;
              const tone = item.tone === "critical" ? "bg-red-50 text-red-600" : item.tone === "warning" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600";
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => { navigate(item.path); setOpen(false); }}
                  className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 ${read.includes(item.id) ? "opacity-60" : ""}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={17} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span>
                  </span>
                  {!read.includes(item.id) && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <FileWarning className="me-1.5 inline" size={14} /> {t("Alerts update automatically from live data.", "ההתראות מתעדכנות אוטומטית מהנתונים החיים.")}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(value);
}
