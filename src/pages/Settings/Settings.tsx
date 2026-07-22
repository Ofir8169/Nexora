import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Cloud, Database, Download, HardDrive, Languages, Play, RefreshCw, RotateCcw, Shield, Sparkles, UserRoundCog } from "lucide-react";
import { toast } from "sonner";

import { useBusiness } from "../../business/context/business-context";
import { useApp } from "../../context/app-context";
import { applyLocale, getLocale, getUserRole, localized, type Locale } from "../../lib/preferences";
import { getAuthHeaders } from "../../lib/auth";

type SystemInfo = {
  status: string;
  workspaceId: string;
  storage: { provider: string; revision: number; updatedAt: string; sizeBytes: number };
  records: Record<string, number>;
  safeguards: Record<string, boolean>;
  integrations: Record<string, boolean>;
  checkedAt: string;
};

export default function Settings() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const operations = useApp();
  const business = useBusiness();
  const [company, setCompany] = useState(() => localStorage.getItem("nexora_company") ?? "My workspace");
  const [running, setRunning] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);
  const canManageSystem = ["Admin", "Manager"].includes(getUserRole());

  const loadSystemInfo = useCallback(async () => {
    if (!canManageSystem) return;
    setSystemLoading(true);
    try {
      const response = await fetch("/api/admin/system", { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("Unable to load system status");
      setSystemInfo(await response.json());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load system status");
    } finally { setSystemLoading(false); }
  }, [canManageSystem]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadSystemInfo(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadSystemInfo]);

  function saveCompany() {
    localStorage.setItem("nexora_company", company.trim() || "My workspace");
    toast.success(t("Workspace settings saved", "הגדרות סביבת העבודה נשמרו"));
  }

  async function exportBackup() {
    try {
      const response = await fetch("/api/admin/export", { headers: getAuthHeaders() });
      if (!response.ok) throw new Error((await response.json()).message || "Export failed");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexora-workspace-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t("Verified workspace export created", "ייצוא מאומת של סביבת העבודה נוצר"));
      void loadSystemInfo();
    } catch (error) { toast.error(error instanceof Error ? error.message : t("Export failed", "הייצוא נכשל")); }
  }

  async function runAutomations() {
    setRunning(true);
    try {
      const result = await business.runAutomations();
      toast.success(`${result.ran} workflows checked · ${result.created} tasks created`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Automation failed");
    } finally { setRunning(false); }
  }

  return (
    <div className="space-y-6 pb-10">
      <header><p className="text-sm font-semibold text-blue-600">{t("Workspace control", "ניהול סביבת העבודה")}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{t("Settings", "הגדרות")}</h1><p className="mt-2 text-slate-500">{t("Manage identity, language, data and connected intelligence.", "ניהול זהות, שפה, נתונים ויכולות חכמות.")}</p></header>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel icon={<Sparkles />} title={t("Workspace profile", "פרופיל סביבת העבודה")} description={t("Used across reports and the onboarding experience.", "משמש בדוחות ובחוויית ההצטרפות.")}>
          <label className="block text-sm font-medium text-slate-700">{t("Workspace name", "שם סביבת העבודה")}<input value={company} onChange={(event) => setCompany(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-blue-400" /></label>
          <button type="button" onClick={saveCompany} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">{t("Save changes", "שמירת שינויים")}</button>
        </Panel>

        <Panel icon={<UserRoundCog />} title={t("Access and language", "הרשאות ושפה")} description={t("Preview the workspace as each team role.", "תצוגת המערכת לפי תפקיד בצוות.")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">{t("Signed-in role", "תפקיד מחובר")}</p><p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900"><Shield size={16} className="text-blue-600" />{getUserRole()}</p><p className="mt-1 text-xs leading-5 text-slate-500">{t("Roles are controlled by the server and team administrator.", "התפקיד נקבע בשרת על ידי מנהל הצוות.")}</p></div>
            <label className="text-sm font-medium text-slate-700">Language<select defaultValue={getLocale()} onChange={(event) => { const locale = event.target.value as Locale; localStorage.setItem("nexora_locale", locale); applyLocale(locale); window.location.reload(); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3"><option value="en">English (LTR)</option><option value="he">עברית (RTL)</option></select></label>
          </div>
          <button type="button" onClick={() => { localStorage.removeItem("nexora_onboarding_complete"); window.location.reload(); }} className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600"><Languages size={16} /> {t("Run setup again", "הפעלת ההגדרה מחדש")}</button>
        </Panel>

        <Panel icon={<Play />} title="Automations" description={`${business.automations.filter((item) => item.enabled).length} workflows are currently active.`}>
          <button type="button" disabled={running} onClick={() => void runAutomations()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Play size={16} /> {running ? "Running…" : "Run workflows now"}</button>
          <p className="mt-3 text-xs leading-5 text-slate-500">Runs are idempotent: Nexora will not create a second open collection task for the same invoice.</p>
        </Panel>

        <Panel icon={<Database />} title="Data and backup" description="Operations and Business use one local API database.">
          <div className="flex flex-wrap gap-3"><button type="button" disabled={getUserRole() !== "Admin"} onClick={() => void exportBackup()} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Download size={16} /> {t("Verified server export", "ייצוא מאומת מהשרת")}</button><button type="button" onClick={operations.resetDemoData} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><RotateCcw size={16} /> {t("Reset operations", "איפוס נתוני תפעול")}</button></div>
        </Panel>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="flex items-center gap-2 font-bold text-slate-900"><HardDrive size={18} className="text-blue-600" />{t("System & data", "מערכת ונתונים")}</h2><p className="mt-1 text-sm text-slate-500">{t("Live status reported by the protected API.", "מצב חי שמדווח מה־API המאובטח.")}</p></div>{canManageSystem && <button type="button" aria-label={t("Refresh system status", "רענון מצב המערכת")} disabled={systemLoading} onClick={() => void loadSystemInfo()} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={17} className={systemLoading ? "animate-spin" : ""} /></button>}</div>
        {!canManageSystem ? <div className="p-6 text-sm text-slate-500">{t("System details are available to administrators and managers.", "פרטי המערכת זמינים למנהלים בלבד.")}</div> : systemLoading && !systemInfo ? <div className="grid gap-3 p-5 sm:grid-cols-4">{[0,1,2,3].map((item) => <div key={item} className="nexora-skeleton h-24 rounded-xl" />)}</div> : systemInfo && <>
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4"><SystemStatus icon={<CheckCircle2 />} label={t("Backend", "שרת")} value={t("Healthy", "תקין")} /><SystemStatus icon={<Database />} label={t("Storage revision", "גרסת אחסון")} value={`#${systemInfo.storage.revision}`} /><SystemStatus icon={<HardDrive />} label={t("Database size", "גודל מסד")} value={formatBytes(systemInfo.storage.sizeBytes)} /><SystemStatus icon={<Shield />} label={t("Safeguards", "הגנות")} value={`${Object.values(systemInfo.safeguards).filter(Boolean).length}/${Object.keys(systemInfo.safeguards).length}`} /></div>
          <div className="grid border-t border-slate-100 lg:grid-cols-2"><div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("Workspace records", "רשומות בסביבה")}</p><div className="mt-3 flex flex-wrap gap-2">{Object.entries(systemInfo.records).filter(([, count]) => count > 0).map(([name, count]) => <span key={name} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">{name} · {count}</span>)}</div></div><div className="border-t border-slate-100 p-5 lg:border-l lg:border-t-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("External connections", "חיבורים חיצוניים")}</p><div className="mt-3 grid grid-cols-2 gap-2">{Object.entries(systemInfo.integrations).map(([name, connected]) => <div key={name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"><span className="flex items-center gap-1.5"><Cloud size={13} />{name}</span><span className={connected ? "text-emerald-600" : "text-slate-400"}>{connected ? t("Connected", "מחובר") : t("Not set", "לא הוגדר")}</span></div>)}</div></div></div>
        </>}
      </section>
    </div>
  );
}

function Panel({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</span><div><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div><div className="mt-5">{children}</div></section>;
}

function SystemStatus({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="text-emerald-600">{icon}</span><div><p className="text-xs text-slate-500">{label}</p><p className="text-sm font-semibold text-slate-900">{value}</p></div></div>;
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
