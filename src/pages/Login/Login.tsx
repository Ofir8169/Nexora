import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, CheckCircle2, Eye, EyeOff, Layers3, Lock, Mail, ShieldCheck, Sparkles, Wifi, WifiOff } from "lucide-react";

import { applyLocale, getLocale, localized, type Locale, type UserRole } from "../../lib/preferences";

export default function Login() {
  const [email, setEmail] = useState("ofir@nexora.ai");
  const [password, setPassword] = useState("nexora-demo");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState<Locale>(() => getLocale());
  const t = (en: string, he: string) => localized(en, he, locale);
  const [error, setError] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recovering, setRecovering] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health", { signal: AbortSignal.timeout(2500) })
      .then((response) => setServerOnline(response.ok))
      .catch(() => setServerOnline(false));
  }, []);

  async function handleLogin(credentials?: { email: string; password: string }) {
    const loginEmail = credentials?.email ?? email;
    const loginPassword = credentials?.password ?? password;
    if (!loginEmail.trim() || !loginPassword) return setError(t("Enter your email and password.", "יש להזין אימייל וסיסמה."));
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      const payload = (await response.json()) as { token?: string; message?: string; role?: UserRole };
      if (!response.ok || !payload.token) throw new Error(payload.message ?? t("Unable to sign in.", "לא ניתן להתחבר."));
      localStorage.setItem("nexora_auth_token", payload.token);
      localStorage.setItem("nexora_logged_in", "true");
      localStorage.setItem("nexora_user", loginEmail);
      localStorage.setItem("nexora_remember", String(remember));
      localStorage.setItem("nexora_role", payload.role ?? "Operator");
      localStorage.setItem("nexora_locale", locale);
      applyLocale(locale);
      window.location.href = "/";
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : t("Unable to sign in.", "לא ניתן להתחבר.");
      setError(message === "Failed to fetch" ? t("Cannot reach the Nexora server. Run npm run dev and try again.", "לא ניתן להגיע לשרת Nexora. יש להריץ npm run dev ולנסות שוב.") : message);
    } finally { setLoading(false); }
  }

  async function requestRecovery() {
    if (!email.trim()) return setError(t("Enter your email first.", "יש להזין תחילה כתובת אימייל."));
    setRecovering(true);
    setError("");
    setRecoveryMessage("");
    try {
      const response = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? t("Recovery request failed.", "בקשת השחזור נכשלה."));
      setRecoveryMessage(t("Recovery request received. The workspace administrator can now rotate the local password.", "בקשת השחזור התקבלה. מנהל סביבת העבודה יכול כעת להחליף את הסיסמה המקומית."));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t("Recovery request failed.", "בקשת השחזור נכשלה."));
    } finally {
      setRecovering(false);
    }
  }

  return (
    <main className="nexora-light min-h-screen bg-white text-slate-900 lg:grid lg:grid-cols-[minmax(430px,0.82fr)_minmax(560px,1.18fr)]">
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"><Sparkles size={20} /></span>
            <div><p className="text-lg font-bold tracking-tight text-slate-950">Nexora</p><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Operations & Business OS</p></div>
          </div>

          <div className="mt-12">
            <p className="text-sm font-semibold text-blue-600">{t("Welcome back", "ברוכים הבאים")}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-slate-950">{t("Run your entire operation from one place.", "כל העסק והתפעול במקום אחד.")}</h1>
            <p className="mt-4 text-base leading-7 text-slate-500">{t("Sign in to see priorities, customers, finance and AI recommendations in real time.", "התחברו כדי לראות עדיפויות, לקוחות, כספים והמלצות AI בזמן אמת.")}</p>
          </div>

          <div className={`mt-6 flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${serverOnline === false ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
            {serverOnline === false ? <WifiOff size={14} /> : <Wifi size={14} />}
            {serverOnline === null ? t("Checking connection…", "בודק חיבור...") : serverOnline ? t("All systems operational", "כל המערכות פעילות") : t("Server is offline", "השרת אינו מחובר")}
          </div>

          <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); void handleLogin(); }}>
            <FieldLabel label={t("Email address", "כתובת אימייל")}>
              <Mail size={17} className="text-slate-400" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="username" className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none" />
            </FieldLabel>
            <FieldLabel label={t("Password", "סיסמה")}>
              <Lock size={17} className="text-slate-400" />
              <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} required autoComplete="current-password" className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none" />
              <button type="button" aria-label={showPassword ? t("Hide password", "הסתרת סיסמה") : t("Show password", "הצגת סיסמה")} onClick={() => setShowPassword((value) => !value)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </FieldLabel>

            <div>
              <label className="text-xs font-semibold text-slate-600">{t("Language", "שפה")}<select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="en">English</option><option value="he">עברית</option></select></label>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-500"><input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" /> {t("Keep me signed in", "להשאיר אותי מחובר")}</label>

            <button type="button" disabled={recovering} onClick={() => void requestRecovery()} className="text-start text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50">
              {recovering ? t("Sending recovery request…", "שולח בקשת שחזור...") : t("Forgot your password?", "שכחת את הסיסמה?")}
            </button>

            <button type="submit" disabled={loading || serverOnline === false} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-50">{loading ? t("Connecting…", "מתחבר...") : t("Enter workspace", "כניסה למערכת")}<ArrowRight size={17} className="transition group-hover:translate-x-0.5" /></button>
            <button type="button" disabled={loading || serverOnline === false} onClick={() => void handleLogin({ email: "ofir@nexora.ai", password: "nexora-demo" })} className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"><ShieldCheck size={17} /> {t("Quick demo access", "כניסה מהירה לדמו")}</button>
            {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
            {recoveryMessage && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">{recoveryMessage}</p>}
          </form>
          <p className="mt-7 text-center text-xs text-slate-400">{t("Secure 12-hour server session · Local workspace", "חיבור מאובטח ל־12 שעות · סביבת עבודה מקומית")}</p>
        </div>
      </section>

      <ProductPreview />
    </main>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-600">{label}<span className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">{children}</span></label>;
}

function ProductPreview() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-[#0b1220] p-10 lg:flex lg:items-center lg:justify-center xl:p-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative w-full max-w-3xl">
        <div className="mb-8 max-w-xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-200"><Sparkles size={14} /> {t("Built for teams that move fast", "נבנה לצוותים שעובדים מהר")}</span><h2 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-white xl:text-5xl">{t("Clarity for every decision.", "בהירות בכל החלטה.")}</h2><p className="mt-4 text-base leading-7 text-slate-400">{t("One elegant workspace connecting operations, customers, finance and intelligent automation.", "סביבת עבודה אחת שמחברת תפעול, לקוחות, כספים ואוטומציה חכמה.")}</p></div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="overflow-hidden rounded-2xl bg-[#f7f9fc] p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-blue-600">LIVE OVERVIEW</p><h3 className="mt-1 text-xl font-bold text-slate-950">Good morning, Ofir</h3></div><div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div></div>
            <div className="mt-5 grid grid-cols-3 gap-3"><PreviewMetric icon={<CheckCircle2 size={16} />} label="Readiness" value="92%" tone="emerald" /><PreviewMetric icon={<Layers3 size={16} />} label="Open tasks" value="12" tone="blue" /><PreviewMetric icon={<BarChart3 size={16} />} label="Revenue" value="₪48K" tone="violet" /></div>
            <div className="mt-3 grid grid-cols-[1.35fr_0.65fr] gap-3"><div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-end gap-2 h-28">{[36,58,44,72,63,88,78,96].map((height, index) => <span key={index} className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-blue-400" style={{ height: `${height}%`, opacity: .55 + index * .05 }} />)}</div><div className="mt-3 flex justify-between text-[9px] text-slate-400"><span>MON</span><span>WED</span><span>FRI</span><span>TODAY</span></div></div><div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white"><Sparkles size={17} /><p className="mt-7 text-xs font-semibold">Nexora AI</p><p className="mt-1 text-[10px] leading-4 text-blue-100">Your operation is stable. One invoice needs attention.</p></div></div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-6 text-xs font-medium text-slate-400"><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> Live data</span><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-blue-400" /> Secure access</span><span className="flex items-center gap-2"><Sparkles size={15} className="text-violet-400" /> AI assisted</span></div>
      </div>
    </section>
  );
}

function PreviewMetric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "emerald" | "blue" | "violet" }) {
  const colors = { emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600" };
  return <div className="rounded-xl border border-slate-200 bg-white p-3"><span className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors[tone]}`}>{icon}</span><p className="mt-3 text-[10px] text-slate-400">{label}</p><p className="text-base font-bold text-slate-900">{value}</p></div>;
}
