import { CheckCircle2, Clock3, History } from "lucide-react";

import { getLocale, localized } from "../../lib/preferences";

export default function EntityActivity({
  createdLabel,
  updatedLabel,
}: {
  createdLabel: string;
  updatedLabel: string;
}) {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <History size={17} className="text-blue-600" />
        {t("Recent activity", "פעילות אחרונה")}
      </div>
      <div className="mt-4 space-y-3">
        <ActivityRow icon={<CheckCircle2 size={14} />} title={updatedLabel} time={t("Today", "היום")} />
        <ActivityRow icon={<Clock3 size={14} />} title={createdLabel} time={t("Workspace history", "היסטוריית המערכת")} />
      </div>
    </section>
  );
}

function ActivityRow({ icon, title, time }: { icon: React.ReactNode; title: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}
