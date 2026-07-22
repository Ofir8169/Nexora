import { CheckCircle2, Copy, ShieldCheck, UserPlus, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getAuthHeaders } from "../../lib/auth";
import { getLocale, getUserRole, localized, type UserRole } from "../../lib/preferences";

type TeamUser = { id: string; email: string; name: string; role: UserRole; active: boolean; createdAt: string };

export default function Team() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const currentRole = getUserRole();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Operator");
  const [temporaryPassword, setTemporaryPassword] = useState(() => `Nexora-${Math.random().toString(36).slice(2, 8)}!`);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users", { headers: getAuthHeaders() }).then(async (response) => {
      if (!response.ok) throw new Error((await response.json()).message ?? "Could not load users");
      return response.json() as Promise<TeamUser[]>;
    }).then((items) => { if (!cancelled) setUsers(items); }).catch((error) => toast.error(error instanceof Error ? error.message : "Could not load users")).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function invite() {
    if (!name.trim() || !email.trim() || temporaryPassword.length < 8) return toast.error(t("Complete all invitation fields", "יש למלא את כל שדות ההזמנה"));
    setSaving(true);
    try {
      const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders() }, body: JSON.stringify({ name, email, role, temporaryPassword }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Invitation failed");
      setUsers((current) => [...current, payload]);
      setName(""); setEmail("");
      toast.success(t("Team member created", "משתמש הצוות נוצר"));
    } catch (error) { toast.error(error instanceof Error ? error.message : t("Invitation failed", "ההזמנה נכשלה")); }
    finally { setSaving(false); }
  }

  async function setActive(user: TeamUser, active: boolean) {
    const response = await fetch(`/api/users/${user.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders() }, body: JSON.stringify({ active }) });
    if (!response.ok) return toast.error(t("Could not update access", "לא ניתן לעדכן גישה"));
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, active } : item));
    toast.success(active ? t("Access restored", "הגישה הופעלה") : t("Access disabled", "הגישה הושבתה"));
  }

  return <div className="nexora-enter space-y-6 pb-12">
    <header><p className="flex items-center gap-2 text-sm font-semibold text-blue-600"><ShieldCheck size={17} /> {t("Access management", "ניהול גישה")}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{t("Team and permissions", "צוות והרשאות")}</h1><p className="mt-2 max-w-2xl text-slate-500">{t("Create individual accounts, assign the minimum required role and disable access when a team member leaves.", "יוצרים חשבון אישי, נותנים את ההרשאה המינימלית הנדרשת ומשביתים גישה כאשר עובד עוזב.")}</p></header>
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><UserPlus size={19} /></span><div><h2 className="font-bold text-slate-900">{t("Invite team member", "הזמנת חבר צוות")}</h2><p className="text-xs text-slate-500">{t("Administrator only", "למנהל מערכת בלבד")}</p></div></div>
        {currentRole === "Admin" ? <div className="mt-5 space-y-4"><Field label={t("Full name", "שם מלא")} value={name} onChange={setName} /><Field label={t("Email", "אימייל")} value={email} onChange={setEmail} type="email" /><label className="block text-sm font-medium text-slate-700">{t("Role", "תפקיד")}<select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3"><option value="Operator">{t("Field operator", "עובד שטח")}</option><option value="Finance">{t("Finance", "כספים")}</option><option value="Manager">{t("Manager", "מנהל")}</option><option value="Admin">Admin</option></select></label><label className="block text-sm font-medium text-slate-700">{t("Temporary password", "סיסמה זמנית")}<div className="mt-2 flex gap-2"><input value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-3 font-mono text-sm" /><button type="button" aria-label={t("Copy password", "העתקת סיסמה")} onClick={() => void navigator.clipboard.writeText(temporaryPassword)} className="rounded-xl border border-slate-200 px-3 text-slate-500"><Copy size={17} /></button></div></label><button type="button" disabled={saving} onClick={() => void invite()} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? t("Creating…", "יוצר...") : t("Create account", "יצירת חשבון")}</button></div> : <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{t("Only an administrator can create or disable accounts.", "רק מנהל מערכת יכול ליצור או להשבית חשבונות.")}</p>}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">{t("Workspace members", "חברי סביבת העבודה")}</h2><p className="text-sm text-slate-500">{users.length} {t("invited accounts", "חשבונות שהוזמנו")}</p></div><Users className="text-blue-600" /></div>
        {loading ? <div className="p-8 text-center text-sm text-slate-500">{t("Loading team…", "טוען צוות...")}</div> : users.length ? <div className="divide-y divide-slate-100">{users.map((user) => <div key={user.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 font-bold text-blue-700">{user.name.slice(0, 1).toUpperCase()}</span><div><p className="font-semibold text-slate-900">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></div></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{user.role}</span><span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${user.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{user.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}{user.active ? t("Active", "פעיל") : t("Disabled", "מושבת")}</span>{currentRole === "Admin" && <button type="button" onClick={() => void setActive(user, !user.active)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">{user.active ? t("Disable", "השבתה") : t("Restore", "הפעלה")}</button>}</div></div>)}</div> : <div className="p-10 text-center"><Users className="mx-auto text-slate-300" /><p className="mt-3 text-sm text-slate-500">{t("No invited team members yet", "עדיין אין חברי צוות שהוזמנו")}</p></div>}
      </section>
    </div>
  </div>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-sm font-medium text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label>; }
