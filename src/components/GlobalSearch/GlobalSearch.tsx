import { useCallback, useMemo, useState } from "react";
import { BriefcaseBusiness, ClipboardList, FileText, FolderOpen, History, MapPin, Receipt, Search, Trash2, Truck, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/app-context";
import { useBusiness } from "../../business/context/business-context";
import { getLocale, localized } from "../../lib/preferences";

type RecentResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  path: string;
  entityId?: string | number;
};

export default function GlobalSearch() {
  const locale = getLocale();
  const t = useCallback((en: string, he: string) => localized(en, he, locale), [locale]);
  const { tasks, fleet, sites, employees } = useApp();
  const business = useBusiness();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<RecentResult[]>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem("nexora_recent_searches") ?? "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is RecentResult => Boolean(
        item && typeof item === "object" && "id" in item && "title" in item && "path" in item
      )).slice(0, 5);
    } catch {
      return [];
    }
  });

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
        type: t("Task", "משימה"),
        title: item.title,
        subtitle: `${item.site} • ${item.status}`,
        path: "/tasks",
        entityId: item.id,
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
        type: t("Vehicle", "רכב"),
        title: item.name,
        subtitle: `${item.site} • ${item.status}`,
        path: "/fleet",
        entityId: item.id,
        icon: Truck,
      }));

    const siteResults = sites
      .filter((item) =>
        `${item.name} ${item.status}`.toLowerCase().includes(q)
      )
      .map((item) => ({
        id: `site-${item.id}`,
        type: t("Site", "אתר"),
        title: item.name,
        subtitle: `${item.status} • ${item.risk}% risk`,
        path: "/sites",
        entityId: item.id,
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
        type: t("Employee", "עובד"),
        title: item.name,
        subtitle: `${item.role} • ${item.status}`,
        path: "/employees",
        entityId: item.id,
        icon: User,
      }));

    const customerResults = business.customers.filter((item) =>
      `${item.name} ${item.company} ${item.email} ${item.phone}`.toLowerCase().includes(q)
    ).map((item) => ({ id: `customer-${item.id}`, type: t("Customer", "לקוח"), title: item.name, subtitle: `${item.company} • ${item.status}`, path: "/business", entityId: item.id, icon: BriefcaseBusiness }));

    const businessTaskResults = business.tasks.filter((item) =>
      `${item.title} ${item.description} ${item.status}`.toLowerCase().includes(q)
    ).map((item) => ({ id: `business-task-${item.id}`, type: t("Business task", "משימה עסקית"), title: item.title, subtitle: `${item.status} • ${t("Score", "ציון")} ${item.priorityScore}`, path: "/business", entityId: item.id, icon: FileText }));

    const invoiceResults = business.invoices.filter((item) =>
      `${item.documentNumber} ${item.status} ${item.notes ?? ""}`.toLowerCase().includes(q)
    ).map((item) => ({ id: `invoice-${item.id}`, type: t("Invoice", "חשבונית"), title: item.documentNumber, subtitle: `${item.status} • ${formatCurrency(item.total)}`, path: "/business", entityId: item.id, icon: Receipt }));

    const documentResults = business.documents.filter((item) =>
      `${item.name} ${item.type} ${item.fileName ?? ""}`.toLowerCase().includes(q)
    ).map((item) => ({ id: `document-${item.id}`, type: t("Document", "מסמך"), title: item.name, subtitle: item.type, path: "/business", entityId: item.id, icon: FolderOpen }));

    return [
      ...taskResults,
      ...fleetResults,
      ...siteResults,
      ...employeeResults,
      ...customerResults,
      ...businessTaskResults,
      ...invoiceResults,
      ...documentResults,
    ].slice(0, 10);
  }, [query, tasks, fleet, sites, employees, business.customers, business.tasks, business.invoices, business.documents, t]);

  function openResult(result: RecentResult) {
    const view = result.id.startsWith("customer-")
      ? "customers"
      : result.id.startsWith("business-task-")
        ? "tasks"
        : result.id.startsWith("invoice-")
          ? "finance"
          : result.id.startsWith("document-")
            ? "documents"
            : undefined;
    navigate(result.path, { state: { selectedId: result.entityId, view, resultType: result.id.split("-")[0] } });
    const nextRecent = [result, ...recent.filter((item) => item.id !== result.id)].slice(0, 5);
    setRecent(nextRecent);
    localStorage.setItem("nexora_recent_searches", JSON.stringify(nextRecent));
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <div className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
        <Search size={17} className="shrink-0 text-slate-400" />

        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={t("Search everything...", "חיפוש משימות, לקוחות, רכבים ומסמכים...")}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label={t("Clear search", "נקה חיפוש")}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && (query || recent.length > 0) && (
        <div className="absolute left-0 top-13 z-50 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
          {!query ? (
            <div>
              <div className="flex items-center justify-between px-2 py-2">
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><History size={14} /> {t("Recently viewed", "נצפו לאחרונה")}</p>
                <button type="button" onClick={() => { setRecent([]); localStorage.removeItem("nexora_recent_searches"); setOpen(false); }} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600"><Trash2 size={13} /> {t("Clear", "ניקוי")}</button>
              </div>
              <div className="space-y-1">
                {recent.map((result) => (
                  <button key={result.id} type="button" onClick={() => openResult(result)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><History size={17} /></span>
                    <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{result.title}</span><span className="block truncate text-xs text-slate-500">{result.subtitle}</span></span>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              {t("No results found.", "לא נמצאו תוצאות.")}
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => {
                const Icon = result.icon;

                return (
                  <button
                    key={result.id}
                    onClick={() => openResult(result)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                        {result.type}
                      </p>
                      <p className="font-semibold text-slate-900">{result.title}</p>
                      <p className="text-xs text-slate-500">
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(value);
}
