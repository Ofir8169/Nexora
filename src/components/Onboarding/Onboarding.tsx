import { useState } from "react";
import { ArrowRight, Building2, Check, Sparkles, X } from "lucide-react";

import { applyLocale, applyWorkspaceAppearance, getLocale, localized, type Locale } from "../../lib/preferences";

const goals = ["Operations", "Customers", "Finance", "Fleet", "AI insights"];

export default function Onboarding() {
  const [open, setOpen] = useState(() => localStorage.getItem("nexora_onboarding_complete") !== "true");
  const [company, setCompany] = useState(() => localStorage.getItem("nexora_company") ?? "");
  const [locale, setLocale] = useState<Locale>(getLocale());
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Operations", "Customers"]);
  const [businessType, setBusinessType] = useState(() => localStorage.getItem("nexora_business_type") ?? "field-service");
  const [teamSize, setTeamSize] = useState(() => localStorage.getItem("nexora_team_size") ?? "1-5");
  const [primaryService, setPrimaryService] = useState(() => localStorage.getItem("nexora_primary_service") ?? "");
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem("nexora_brand_color") ?? "#2563eb");
  const t = (en: string, he: string) => localized(en, he, locale);

  if (!open) return null;

  function finish() {
    localStorage.setItem("nexora_company", company.trim() || t("My workspace", "העסק שלי"));
    localStorage.setItem("nexora_workspace_goals", JSON.stringify(selectedGoals));
    localStorage.setItem("nexora_locale", locale);
    localStorage.setItem("nexora_business_type", businessType);
    localStorage.setItem("nexora_team_size", teamSize);
    localStorage.setItem("nexora_primary_service", primaryService.trim());
    localStorage.setItem("nexora_brand_color", brandColor);
    localStorage.setItem("nexora_onboarding_complete", "true");
    applyLocale(locale);
    applyWorkspaceAppearance();
    setOpen(false);
  }

  return <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-slate-950/35 p-4 backdrop-blur-md">
    <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-7 text-white sm:px-8">
        <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><Sparkles size={21} /></span><button type="button" aria-label={t("Skip setup", "דילוג על ההגדרה")} onClick={finish} className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={19} /></button></div>
        <h1 id="onboarding-title" className="mt-5 text-3xl font-bold tracking-tight">{t("Set up your Nexora workspace", "הקמת סביבת Nexora")}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">{t("A quick setup keeps the workspace focused on what your team actually uses.", "הגדרה קצרה מתאימה את המערכת לעסק ולצוות שלך.")}</p>
      </div>
      <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6 sm:p-8">
        <label className="block text-sm font-semibold text-slate-700">{t("Company or workspace name", "שם העסק או סביבת העבודה")}<div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 focus-within:border-blue-400"><Building2 size={18} className="text-slate-400" /><input autoFocus value={company} onChange={(event) => setCompany(event.target.value)} placeholder="BlueWhite Operations" className="min-w-0 flex-1 outline-none" /></div></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">{t("Business type", "סוג העסק")}<select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3"><option value="field-service">{t("Field service", "שירות ועבודת שטח")}</option><option value="maintenance">{t("Maintenance", "אחזקה")}</option><option value="contractor">{t("Contractor", "קבלנות")}</option><option value="delivery">{t("Delivery and logistics", "שליחויות ולוגיסטיקה")}</option><option value="other">{t("Other", "אחר")}</option></select></label>
          <label className="block text-sm font-semibold text-slate-700">{t("Team size", "גודל הצוות")}<select value={teamSize} onChange={(event) => setTeamSize(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3"><option>1-5</option><option>6-20</option><option>21-50</option><option>50+</option></select></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block text-sm font-semibold text-slate-700">{t("Primary service", "השירות המרכזי")}<input value={primaryService} onChange={(event) => setPrimaryService(event.target.value)} placeholder={t("Example: air conditioning maintenance", "לדוגמה: אחזקת מיזוג אוויר")} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-blue-400" /></label>
          <label className="block text-sm font-semibold text-slate-700">{t("Brand color", "צבע מותג")}<input type="color" value={brandColor} onChange={(event) => setBrandColor(event.target.value)} className="mt-2 block h-12 w-full min-w-24 rounded-xl border border-slate-200 bg-white p-1.5" /></label>
        </div>
        <div><p className="text-sm font-semibold text-slate-700">{t("What do you want to manage?", "מה תרצו לנהל?")}</p><div className="mt-3 flex flex-wrap gap-2">{goals.map((goal) => { const selected = selectedGoals.includes(goal); return <button type="button" key={goal} aria-pressed={selected} onClick={() => setSelectedGoals((current) => selected ? current.filter((item) => item !== goal) : [...current, goal])} className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium ${selected ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>{selected && <Check size={15} />}{goal}</button>; })}</div></div>
        <label className="block text-sm font-semibold text-slate-700">{t("Interface language", "שפת הממשק")}<select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3"><option value="en">English</option><option value="he">עברית</option></select></label>
        <button type="button" onClick={finish} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">{t("Enter workspace", "כניסה לסביבת העבודה")} <ArrowRight size={17} /></button>
      </div>
    </div>
  </div>;
}
