import { Save, StickyNote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { getLocale, localized } from "../../lib/preferences";

export default function EntityNotes({ entityKey }: { entityKey: string }) {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const storageKey = `nexora_note_${entityKey}`;
  const [note, setNote] = useState(() => localStorage.getItem(storageKey) ?? "");
  const [savedNote, setSavedNote] = useState(note);

  function save() {
    const normalized = note.trim();
    if (normalized) localStorage.setItem(storageKey, normalized);
    else localStorage.removeItem(storageKey);
    setNote(normalized);
    setSavedNote(normalized);
    toast.success(t("Note saved", "ההערה נשמרה"));
  }

  return (
    <section className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800" htmlFor={`note-${entityKey}`}>
        <StickyNote size={17} className="text-violet-600" /> {t("Private workspace note", "הערה פרטית בסביבת העבודה")}
      </label>
      <textarea
        id={`note-${entityKey}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={t("Add context, a reminder or the next step…", "אפשר להוסיף הקשר, תזכורת או את הצעד הבא...")}
        className="mt-3 min-h-24 w-full resize-y rounded-xl border border-violet-100 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">{note === savedNote ? t("Saved on this device", "נשמר במכשיר הזה") : t("Unsaved changes", "קיימים שינויים שלא נשמרו")}</p>
        <button type="button" disabled={note === savedNote} onClick={save} className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:cursor-default disabled:opacity-40">
          <Save size={14} /> {t("Save note", "שמירת הערה")}
        </button>
      </div>
    </section>
  );
}
