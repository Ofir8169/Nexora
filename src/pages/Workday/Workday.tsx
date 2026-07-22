import { AlertCircle, Camera, CheckCircle2, Clock3, MapPinned, Navigation, PenLine, Play, Share2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useApp } from "../../context/app-context";
import { getAuthHeaders } from "../../lib/auth";
import { getLocale, localized } from "../../lib/preferences";

type QueueFilter = "today" | "open" | "progress" | "done";

export default function Workday() {
  const { tasks, updateTask, completeTask } = useApp();
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const [filter, setFilter] = useState<QueueFilter>("today");
  const [selectedId, setSelectedId] = useState<number | null>(tasks[0]?.id ?? null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [signature, setSignature] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);

  const filtered = useMemo(() => tasks.filter((task) => {
    if (filter === "today") return task.due === "Today" || task.status === "In Progress";
    if (filter === "open") return task.status === "Open";
    if (filter === "progress") return task.status === "In Progress";
    return task.status === "Done";
  }), [filter, tasks]);
  const selected = tasks.find((task) => task.id === selectedId) ?? filtered[0] ?? null;

  function startTask() {
    if (!selected) return;
    updateTask({ ...selected, status: "In Progress" });
    toast.success(t("Work started", "העבודה התחילה"), { description: selected.title });
  }

  async function finishTask() {
    if (!selected) return;
    if (!signature.trim()) {
      toast.error(t("Add the performer name before completing the job.", "יש להזין את שם המבצע לפני סיום העבודה."));
      return;
    }
    setIsFinishing(true);
    try {
      let evidence = null;
      if (proofFile) {
        const dataUrl = await fileToDataUrl(proofFile);
        const upload = await fetch(`/api/ops/tasks/${selected.id}/evidence`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ fileName: proofFile.name, dataUrl, signedBy: signature.trim() }),
        });
        const payload = await upload.json();
        if (!upload.ok) throw new Error(payload.message || t("Could not upload the evidence.", "לא ניתן היה להעלות את התיעוד."));
        evidence = payload;
      }
      const proof = { taskId: selected.id, fileName: proofFile?.name ?? null, signedBy: signature.trim(), completedAt: new Date().toISOString(), evidence };
      localStorage.setItem(`nexora_completion_${selected.id}`, JSON.stringify(proof));
      completeTask(selected.id);
      setProofFile(null);
      setSignature("");
      toast.success(t("Job completed and proof saved", "העבודה הסתיימה ואישור הביצוע נשמר"));
    } catch (error) {
      toast.error(t("The job was not completed", "העבודה לא הושלמה"), { description: error instanceof Error ? error.message : t("Please try again.", "נא לנסות שוב.") });
    } finally {
      setIsFinishing(false);
    }
  }

  function openNavigation() {
    if (!selected) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.site)}`, "_blank", "noopener,noreferrer");
  }

  async function shareTask() {
    if (!selected) return;
    const text = `${selected.title} · ${selected.site} · ${selected.status}`;
    if (navigator.share) await navigator.share({ title: selected.title, text });
    else {
      await navigator.clipboard.writeText(text);
      toast.success(t("Task copied", "פרטי המשימה הועתקו"));
    }
  }

  return (
    <div className="nexora-enter space-y-6 pb-12">
      <header className="service-hero relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
        <span className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[28px] border-white/10" />
        <span className="absolute bottom-5 right-1/3 h-16 w-16 rotate-12 rounded-2xl bg-cyan-300/15" />
        <div className="relative">
          <p className="flex items-center gap-2 text-sm font-semibold text-blue-100"><Clock3 size={16} /> {t("Daily field workspace", "סביבת העבודה היומית")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t("My workday", "היום שלי")}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">{t("See what is next, document the visit and finish the job without navigating through the full system.", "רואים מה המשימה הבאה, מתעדים את הביקור ומסיימים עבודה בלי לעבור בין מסכים.")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Signal value={tasks.filter((item) => item.status !== "Done").length} label={t("Open", "פתוחות")} />
            <Signal value={tasks.filter((item) => item.status === "In Progress").length} label={t("In progress", "בביצוע")} />
            <Signal value={tasks.filter((item) => item.status === "Done").length} label={t("Completed", "הושלמו")} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {([
              ["today", t("Today", "היום")], ["open", t("Open", "פתוחות")],
              ["progress", t("In progress", "בביצוע")], ["done", t("Done", "הושלמו")],
            ] as [QueueFilter, string][]).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold ${filter === id ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{label}</button>
            ))}
          </div>
          <div className="mt-2 space-y-2">
            {filtered.length ? filtered.map((task) => (
              <button key={task.id} type="button" onClick={() => setSelectedId(task.id)} className={`w-full rounded-2xl border p-4 text-start transition ${selected?.id === task.id ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{task.title}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPinned size={14} /> {task.site}</p></div><Status status={task.status} /></div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-1.5"><UserRound size={14} /> {task.owner}</span><span>{task.due}</span></div>
              </button>
            )) : <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center"><CheckCircle2 className="mx-auto text-emerald-500" /><p className="mt-3 text-sm font-semibold text-slate-700">{t("Nothing in this view", "אין משימות בתצוגה הזו")}</p></div>}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selected ? <>
            <div className="border-b border-slate-100 p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">{t("Current service call", "קריאת שירות נוכחית")}</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{selected.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{selected.description}</p></div><Status status={selected.status} /></div>
              <div className="mt-5 grid grid-cols-2 gap-3"><Info label={t("Customer / site", "לקוח / אתר")} value={selected.site} /><Info label={t("Assigned to", "אחראי")} value={selected.owner} /><Info label={t("Priority", "עדיפות")} value={selected.priority} /><Info label={t("Due", "מועד")} value={selected.due} /></div>
              <div className="mt-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("Service workflow", "שלבי קריאת השירות")}</p><div className="mt-2 flex gap-2 overflow-x-auto pb-1">{[
                ["Open", t("New", "חדש")], ["Scheduled", t("Scheduled", "מתוזמן")], ["On the Way", t("On the way", "בדרך")],
                ["In Progress", t("Working", "בעבודה")], ["Waiting Customer", t("Waiting for customer", "ממתין ללקוח")], ["Done", t("Completed", "הושלם")],
              ].map(([value, label]) => <button type="button" key={value} onClick={() => updateTask({ ...selected, status: value })} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${selected.status === value ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>{label}</button>)}</div></div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Action icon={<Play size={18} />} label={t("Start", "התחלה")} onClick={startTask} tone="blue" />
                <Action icon={<Navigation size={18} />} label={t("Navigate", "ניווט")} onClick={openNavigation} />
                <Action icon={<Share2 size={18} />} label={t("Share", "שיתוף")} onClick={() => void shareTask()} />
                <Action icon={<CheckCircle2 size={18} />} label={isFinishing ? t("Saving…", "שומר…") : t("Complete", "סיום")} onClick={() => void finishTask()} tone="green" disabled={isFinishing} />
              </div>
            </div>
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
              <label className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center"><Camera className="mx-auto text-blue-600" /><span className="mt-2 block text-sm font-semibold text-slate-800">{t("Add completion photo", "הוספת תמונת ביצוע")}</span><span className="mt-1 block truncate text-xs text-slate-500">{proofFile?.name ?? t("Camera or photo library", "מצלמה או ספריית תמונות")}</span><input type="file" accept="image/*" capture="environment" onChange={(event) => setProofFile(event.target.files?.[0] ?? null)} className="mt-3 block w-full text-xs text-slate-500 file:me-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:font-semibold file:text-white" /></label>
              <label className="rounded-2xl border border-slate-200 p-5"><span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><PenLine size={17} className="text-violet-600" /> {t("Performer confirmation", "אישור מבצע")}</span><input value={signature} onChange={(event) => setSignature(event.target.value)} placeholder={t("Full name", "שם מלא")} className="mt-4 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50" /><p className="mt-2 text-xs leading-5 text-slate-400">{t("The name and completion time are saved with the job proof.", "השם ושעת הסיום נשמרים יחד עם אישור הביצוע.")}</p></label>
            </div>
          </> : <div className="p-12 text-center"><AlertCircle className="mx-auto text-slate-300" /><p className="mt-3 text-sm text-slate-500">{t("Select a service call", "יש לבחור קריאת שירות")}</p></div>}
        </section>
      </div>
    </div>
  );
}

function Signal({ value, label }: { value: number; label: string }) { return <div className="min-w-24 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"><p className="text-xl font-bold">{value}</p><p className="text-xs text-blue-100">{label}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{value}</p></div>; }
function Status({ status }: { status: string }) { const locale = getLocale(); const labels: Record<string, string> = locale === "he" ? { Open: "חדש", Scheduled: "מתוזמן", "On the Way": "בדרך", "In Progress": "בעבודה", "Waiting Customer": "ממתין ללקוח", Done: "הושלם" } : {}; const tone = status === "Done" ? "bg-emerald-50 text-emerald-700" : status === "In Progress" || status === "On the Way" ? "bg-amber-50 text-amber-700" : status === "Waiting Customer" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"; return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{labels[status] ?? status}</span>; }
function Action({ icon, label, onClick, tone = "neutral", disabled = false }: { icon: React.ReactNode; label: string; onClick: () => void; tone?: "neutral" | "blue" | "green"; disabled?: boolean }) { const style = tone === "blue" ? "bg-blue-600 text-white" : tone === "green" ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"; return <button type="button" onClick={onClick} disabled={disabled} className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold shadow-sm transition active:scale-95 disabled:cursor-wait disabled:opacity-60 ${style}`}>{icon}{label}</button>; }

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid file."));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}
