import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StableMap from "../../components/maps/StableMap";
import { useApp } from "../../context/app-context";
import { useBusiness } from "../../business/context/business-context";
import { getLocale, localized } from "../../lib/preferences";
import EmptyState from "../../components/ui-v2/EmptyState";

const locations = [
  { lat: 32.584, lng: 35.184 },
  { lat: 32.085, lng: 34.781 },
  { lat: 32.794, lng: 34.989 },
  { lat: 31.768, lng: 35.213 },
];

const priorityRank: Record<string, number> = {
  Critical: 3,
  High: 2,
  Medium: 1,
};

type WidgetId = "metrics" | "operations" | "business" | "priorities";
const widgetOptions: { id: WidgetId; label: string }[] = [
  { id: "metrics", label: "Key metrics" },
  { id: "operations", label: "Map & health" },
  { id: "business", label: "Business snapshot" },
  { id: "priorities", label: "Priority tasks" },
];

export default function Dashboard() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const navigate = useNavigate();
  const { fleet, employees, tasks, sites } = useApp();
  const { dashboard: businessDashboard, loading: businessLoading } = useBusiness();
  const [customizing, setCustomizing] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(() => {
    const defaults = widgetOptions.map((item) => item.id);
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem("nexora_dashboard_widgets") ?? "null");
      if (!Array.isArray(parsed)) return defaults;
      const valid = parsed.filter((item): item is WidgetId => widgetOptions.some((option) => option.id === item));
      return valid.length ? valid : defaults;
    } catch {
      return defaults;
    }
  });

  function toggleWidget(id: WidgetId) {
    const next = visibleWidgets.includes(id)
      ? visibleWidgets.filter((item) => item !== id)
      : [...visibleWidgets, id];
    setVisibleWidgets(next);
    localStorage.setItem("nexora_dashboard_widgets", JSON.stringify(next));
  }

  const criticalFleet = fleet.filter(
    (vehicle) => vehicle.status === "Critical"
  ).length;
  const availableEmployees = employees.filter(
    (employee) => employee.status === "Available"
  ).length;
  const openTasks = tasks.filter((task) => task.status !== "Done");
  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;
  const highRiskSites = sites.filter((site) => site.risk >= 70).length;
  const readiness = fleet.length
    ? Math.round(((fleet.length - criticalFleet) / fleet.length) * 100)
    : 100;

  const priorityTasks = [...openTasks]
    .sort(
      (a, b) =>
        (priorityRank[b.priority] ?? 0) -
        (priorityRank[a.priority] ?? 0)
    )
    .slice(0, 4);

  const dashboardMarkers = sites.map((site, index) => ({
    id: String(site.id),
    lat: locations[index % locations.length].lat,
    lng: locations[index % locations.length].lng,
    title: site.name,
    lines: [
      `Risk: ${site.risk}%`,
      `Vehicles: ${site.vehicles}`,
      `Employees: ${site.employees}`,
    ],
  }));

  return (
    <div className="nexora-enter space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50 p-6 shadow-sm lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-indigo-300/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t("Operations online", "המערכת מחוברת")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
            {getGreeting(locale)}, {localStorage.getItem("nexora_user")?.split("@")[0] ?? "Ofir"}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            {t("Here is the operational picture across your teams, fleet and sites.", "זו תמונת המצב החשובה של הצוותים, צי הרכב והאתרים שלך.")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCustomizing((value) => !value)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            <SlidersHorizontal size={16} /> {t("Customize", "התאמה אישית")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/tasks", { state: { quickCreate: "task" } })}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {t("Create task", "יצירת משימה")}
            <ArrowRight size={16} />
          </button>
        </div>
        </div>
        <div className="relative mt-7 grid grid-cols-3 gap-3 border-t border-blue-100/80 pt-5 sm:max-w-lg">
          <HeroSignal label={t("Critical alerts", "התראות קריטיות")} value={criticalFleet + highRiskSites} />
          <HeroSignal label={t("Team available", "צוות זמין")} value={availableEmployees} />
          <HeroSignal label={t("Tasks complete", "משימות שהושלמו")} value={`${tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0}%`} />
        </div>
      </section>

      {customizing && (
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{t("Choose dashboard widgets", "בחירת אזורים להצגה")}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{t("Your layout is saved on this device.", "הבחירה נשמרת במכשיר הזה.")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {widgetOptions.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={visibleWidgets.includes(item.id)}
                  onClick={() => toggleWidget(item.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${visibleWidgets.includes(item.id) ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-500"}`}
                >
                  {item.id === "metrics" ? t("Key metrics", "מדדים מרכזיים") : item.id === "operations" ? t("Map & health", "מפה ובריאות") : item.id === "business" ? t("Business snapshot", "תמונה עסקית") : t("Priority tasks", "משימות דחופות")}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {visibleWidgets.includes("metrics") && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<ShieldCheck size={20} />}
          label={t("Fleet readiness", "כשירות צי")}
          value={`${readiness}%`}
          detail={t(`${fleet.length - criticalFleet} vehicles ready`, `${fleet.length - criticalFleet} רכבים מוכנים`)}
          tone="emerald"
        />
        <MetricCard
          icon={<ClipboardList size={20} />}
          label={t("Open tasks", "משימות פתוחות")}
          value={openTasks.length}
          detail={t(`${completedTasks} completed`, `${completedTasks} הושלמו`)}
          tone="amber"
        />
        <MetricCard
          icon={<Users size={20} />}
          label={t("Available team", "צוות זמין")}
          value={availableEmployees}
          detail={t(`${employees.length} total employees`, `${employees.length} עובדים בסך הכול`)}
          tone="blue"
        />
        <MetricCard
          icon={<MapPin size={20} />}
          label={t("Active sites", "אתרים פעילים")}
          value={sites.length}
          detail={t(`${highRiskSites} require attention`, `${highRiskSites} דורשים טיפול`)}
          tone="violet"
        />
      </section>}

      {visibleWidgets.includes("operations") && <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-900">{t("Live operations", "פעילות בזמן אמת")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("Current activity across connected sites", "פעילות נוכחית בכל האתרים המחוברים")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/map")}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {t("Full map", "למפה המלאה")} <ChevronRight size={16} />
            </button>
          </div>
          <StableMap
            markers={dashboardMarkers}
            center={[32.25, 35]}
            zoom={8}
            height="430px"
            interactive={false}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">{t("Operational health", "בריאות תפעולית")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("Live system overview", "תמונת מערכת חיה")}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="mt-7 space-y-6">
            <HealthRow
              label={t("Fleet readiness", "כשירות צי")}
              value={readiness}
              color="bg-emerald-500"
            />
            <HealthRow
              label={t("Team availability", "זמינות צוות")}
              value={
                employees.length
                  ? Math.round((availableEmployees / employees.length) * 100)
                  : 0
              }
              color="bg-blue-500"
            />
            <HealthRow
              label={t("Task completion", "השלמת משימות")}
              value={
                tasks.length
                  ? Math.round((completedTasks / tasks.length) * 100)
                  : 0
              }
              color="bg-violet-500"
            />
          </div>

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 shrink-0 text-blue-600" size={18} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{t("AI summary", "סיכום AI")}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {criticalFleet
                    ? t(`${criticalFleet} fleet item requires attention before deployment.`, `${criticalFleet} רכבים דורשים טיפול לפני יציאה לפעילות.`)
                    : t("Fleet is stable and ready for scheduled operations.", "צי הרכב יציב ומוכן לפעילות המתוכננת.")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/ai")}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-700"
            >
              <Bot size={16} /> {t("Ask AI Commander", "שאל את Nexora AI")}
            </button>
          </div>
        </div>
      </section>}

      {visibleWidgets.includes("business") && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.1fr_repeat(3,minmax(0,0.7fr))]">
          <div className="border-b border-slate-100 p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BriefcaseBusiness size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">{t("Business snapshot", "תמונה עסקית")}</h2>
                <p className="text-sm text-slate-500">{t("Live from Business OS", "נתונים חיים מהעסק")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/business")}
              className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {t("Open workspace", "פתיחת סביבת העסק")} <ChevronRight size={16} />
            </button>
          </div>
          <BusinessMetric
            label={t("Active customers", "לקוחות פעילים")}
            value={businessLoading ? "—" : businessDashboard?.customers.active ?? 0}
          />
          <BusinessMetric
            label={t("Outstanding", "יתרה לגבייה")}
            value={
              businessLoading
                ? "—"
                : formatCurrency(businessDashboard?.finance.outstandingRevenue ?? 0)
            }
          />
          <BusinessMetric
            label={t("Business tasks", "משימות עסקיות")}
            value={businessLoading ? "—" : businessDashboard?.tasks.open ?? 0}
          />
        </div>
      </section>}

      {visibleWidgets.includes("priorities") && <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">{t("Priority tasks", "משימות בעדיפות גבוהה")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("The most important work requiring attention", "העבודה החשובה ביותר שדורשת טיפול")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {t("View all", "הצגת הכול")}
          </button>
        </div>

        {priorityTasks.length ? (
          <div className="divide-y divide-slate-100">
            {priorityTasks.map((task) => (
              <button
                type="button"
                key={task.id}
                onClick={() => navigate("/tasks")}
                className="grid w-full gap-3 px-6 py-4 text-left transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_160px_110px] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <CircleAlert size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {task.title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{task.site}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">{task.owner}</span>
                <PriorityBadge priority={task.priority} />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={<CheckCircle2 size={21} />} title={t("Everything important is handled", "כל המשימות החשובות טופלו")} description={t("New high-priority work will appear here automatically.", "משימות חדשות בעדיפות גבוהה יופיעו כאן אוטומטית.")} />
        )}
      </section>}
    </div>
  );
}

type MetricTone = "emerald" | "amber" | "blue" | "violet";

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  detail: string;
  tone: MetricTone;
}) {
  const tones: Record<MetricTone, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="nexora-surface nexora-lift relative overflow-hidden rounded-2xl p-5">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${tone === "emerald" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : tone === "blue" ? "bg-blue-500" : "bg-violet-500"}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function HeroSignal({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xl font-bold tracking-tight text-slate-900">{value}</p></div>;
}

function HealthRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "Critical"
      ? "bg-red-50 text-red-700"
      : priority === "High"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {priority}
    </span>
  );
}

function BusinessMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border-b border-slate-100 p-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}

function getGreeting(locale: "en" | "he") {
  const hour = new Date().getHours();
  if (locale === "he") return hour < 12 ? "בוקר טוב" : hour < 18 ? "צהריים טובים" : "ערב טוב";
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}
