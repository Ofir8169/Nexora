import { Check, Clock3, CreditCard, Headphones, LockKeyhole, Rocket, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { getLocale, localized } from "../../lib/preferences";

const trialDays = 14;

export default function Plans() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const [now] = useState(() => Date.now());
  const [startedAt] = useState(() => Number(localStorage.getItem("nexora_trial_started") || now));
  useEffect(() => {
    if (!localStorage.getItem("nexora_trial_started")) localStorage.setItem("nexora_trial_started", String(startedAt));
  }, [startedAt]);
  const elapsed = Math.floor((now - startedAt) / 86_400_000);
  const remaining = Math.max(0, trialDays - elapsed);

  const plans = [
    { name: t("Starter", "התחלה"), price: "₪149", description: t("For a small service team", "לצוות שירות קטן"), features: [t("Up to 5 users", "עד 5 משתמשים"), t("Customers and service calls", "לקוחות וקריאות שירות"), t("Mobile field workspace", "ממשק עובד שטח")], tone: "slate" },
    { name: t("Business", "עסקי"), price: "₪349", description: t("For a growing operation", "לעסק תפעולי בצמיחה"), features: [t("Up to 20 users", "עד 20 משתמשים"), t("Finance and automations", "כספים ואוטומציות"), t("AI recommendations", "המלצות AI"), t("Priority support", "תמיכה מועדפת")], tone: "blue", popular: true },
    { name: t("Scale", "מתקדם"), price: t("Contact us", "בהתאמה"), description: t("For multiple teams and sites", "למספר צוותים ואתרים"), features: [t("Unlimited users", "ללא הגבלת משתמשים"), t("Custom roles and onboarding", "הרשאות והקמה מותאמות"), t("Dedicated success manager", "מנהל הצלחה ייעודי")], tone: "violet" },
  ];

  return <div className="nexora-enter space-y-7 pb-12">
    <section className="relative overflow-hidden rounded-[28px] border border-indigo-100 bg-gradient-to-br from-white via-blue-50 to-violet-50 p-6 shadow-sm sm:p-8">
      <span className="absolute -end-12 -top-16 h-52 w-52 rounded-full border-[30px] border-blue-200/30" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="flex items-center gap-2 text-sm font-semibold text-blue-600"><Rocket size={17} /> {t("Nexora for business", "Nexora לעסקים")}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{t("A clear path from trial to production", "מסלול ברור מניסיון לעבודה אמיתית")}</h1><p className="mt-3 max-w-2xl text-slate-500">{t("Choose the plan that matches your team. Billing is shown as a product preview until a payment provider is connected.", "בחרו תוכנית שמתאימה לצוות. החיוב מוצג כהדגמת מוצר עד לחיבור ספק סליקה.")}</p></div><div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Clock3 size={20} /></span><div><p className="text-xs text-slate-500">{t("Trial status", "מצב תקופת ניסיון")}</p><p className="font-bold text-slate-900">{remaining} {t("days remaining", "ימים נותרו")}</p></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600" style={{ width: `${Math.max(4, (remaining / trialDays) * 100)}%` }} /></div></div></div>
    </section>

    <section className="grid gap-5 lg:grid-cols-3">{plans.map((plan) => <article key={plan.name} className={`relative rounded-2xl border bg-white p-6 shadow-sm ${plan.popular ? "border-blue-300 ring-4 ring-blue-50" : "border-slate-200"}`}>{plan.popular && <span className="absolute -top-3 start-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">{t("Recommended", "מומלץ")}</span>}<div className={`flex h-11 w-11 items-center justify-center rounded-xl ${plan.tone === "blue" ? "bg-blue-50 text-blue-600" : plan.tone === "violet" ? "bg-violet-50 text-violet-600" : "bg-slate-100 text-slate-600"}`}><Sparkles size={20} /></div><h2 className="mt-5 text-xl font-bold text-slate-950">{plan.name}</h2><p className="mt-1 text-sm text-slate-500">{plan.description}</p><p className="mt-5 text-3xl font-bold text-slate-950">{plan.price}{plan.price.startsWith("₪") && <span className="text-sm font-medium text-slate-400">/{t("month", "חודש")}</span>}</p><ul className="mt-5 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-slate-600"><Check size={17} className="shrink-0 text-emerald-500" />{feature}</li>)}</ul><button type="button" disabled className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold ${plan.popular ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-500"}`}>{t("Payment connection required", "נדרש חיבור לספק סליקה")}</button></article>)}</section>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Trust icon={<ShieldCheck />} title={t("Security", "אבטחה")} text={t("Signed sessions, role protection and backups", "חיבור חתום, הרשאות וגיבויים")} /><Trust icon={<LockKeyhole />} title={t("Privacy", "פרטיות")} text={t("Business data stays isolated in the workspace", "נתוני העסק נשארים מבודדים בסביבה")} /><Trust icon={<Headphones />} title={t("Support", "תמיכה")} text={t("Clear support channel and recovery flow", "ערוץ תמיכה ותהליך שחזור ברור")} /><Trust icon={<Users />} title={t("Onboarding", "הקמה") } text={t("Guided setup for managers and field teams", "הקמה מודרכת למנהלים ולעובדי שטח")} /></section>

    <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white sm:flex sm:items-center sm:justify-between"><div><p className="font-bold">{t("Ready for a production setup?", "מוכנים להקמת סביבת production?")}</p><p className="mt-1 text-sm text-slate-400">{t("Connect a domain, cloud database, email provider and billing account.", "מחברים דומיין, מסד ענן, ספק אימייל וחשבון סליקה.")}</p></div><a href="mailto:support@nexora.local?subject=Nexora%20production%20setup" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 sm:mt-0"><CreditCard size={17} /> {t("Request setup", "בקשת הקמה")}</a></section>
  </div>;
}

function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">{icon}</span><h3 className="mt-4 font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></article>; }
