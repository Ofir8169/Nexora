import { Accessibility, Check, Contrast, Moon, Sun, Type, X, ZapOff } from "lucide-react";
import { useEffect, useState } from "react";

import { getLocale, localized } from "../../lib/preferences";

type FontSize = "normal" | "large" | "xlarge";

export default function AccessibilityMenu() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem("nexora_font_size");
    return saved === "large" || saved === "xlarge" ? saved : "normal";
  });
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("nexora_high_contrast") === "true");
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem("nexora_reduce_motion") === "true");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("nexora_theme") === "dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("nexora-font-large", fontSize === "large");
    root.classList.toggle("nexora-font-xlarge", fontSize === "xlarge");
    root.classList.toggle("nexora-high-contrast", highContrast);
    root.classList.toggle("nexora-reduce-motion", reduceMotion);
    root.classList.toggle("dark", darkMode);
    localStorage.setItem("nexora_font_size", fontSize);
    localStorage.setItem("nexora_high_contrast", String(highContrast));
    localStorage.setItem("nexora_reduce_motion", String(reduceMotion));
    localStorage.setItem("nexora_theme", darkMode ? "dark" : "light");
  }, [fontSize, highContrast, reduceMotion, darkMode]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function reset() {
    setFontSize("normal");
    setHighContrast(false);
    setReduceMotion(false);
    setDarkMode(false);
  }

  return (
    <div className="relative">
      <button type="button" aria-label={t("Accessibility options", "אפשרויות נגישות")} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-blue-50 hover:text-blue-700">
        <Accessibility size={19} />
      </button>
      {open && <div role="dialog" aria-label={t("Accessibility", "נגישות")} className="absolute end-0 top-14 z-50 w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
        <div className="flex items-center justify-between"><div><p className="font-semibold text-slate-900">{t("Accessibility", "נגישות")}</p><p className="mt-0.5 text-xs text-slate-500">{t("Adjust the interface for comfortable use", "התאמת הממשק לשימוש נוח")}</p></div><button type="button" aria-label={t("Close", "סגירה")} onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button></div>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-slate-200 p-3"><p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Type size={16} className="text-blue-600" /> {t("Text size", "גודל טקסט")}</p><div className="mt-3 grid grid-cols-3 gap-2">{(["normal", "large", "xlarge"] as FontSize[]).map((size, index) => <button type="button" key={size} onClick={() => setFontSize(size)} className={`rounded-lg px-2 py-2 text-xs font-semibold ${fontSize === size ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{[t("Normal", "רגיל"), t("Large", "גדול"), t("Larger", "גדול מאוד")][index]}</button>)}</div></div>
          <Toggle icon={darkMode ? <Sun size={17} /> : <Moon size={17} />} title={t("Dark mode", "מצב כהה")} enabled={darkMode} onToggle={() => setDarkMode((value) => !value)} />
          <Toggle icon={<Contrast size={17} />} title={t("High contrast", "ניגודיות גבוהה")} enabled={highContrast} onToggle={() => setHighContrast((value) => !value)} />
          <Toggle icon={<ZapOff size={17} />} title={t("Reduce motion", "הפחתת תנועה")} enabled={reduceMotion} onToggle={() => setReduceMotion((value) => !value)} />
        </div>
        <button type="button" onClick={reset} className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">{t("Reset accessibility settings", "איפוס הגדרות נגישות")}</button>
      </div>}
    </div>
  );
}

function Toggle({ icon, title, enabled, onToggle }: { icon: React.ReactNode; title: string; enabled: boolean; onToggle: () => void }) {
  return <button type="button" aria-pressed={enabled} onClick={onToggle} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-start"><span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><span className="text-blue-600">{icon}</span>{title}</span><span className={`flex h-6 w-10 items-center rounded-full p-0.5 transition ${enabled ? "justify-end bg-blue-600" : "justify-start bg-slate-200"}`}><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">{enabled && <Check size={12} className="text-blue-600" />}</span></span></button>;
}
