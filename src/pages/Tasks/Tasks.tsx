import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ClipboardList,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useApp } from "../../context/app-context";
import { useLocation } from "react-router-dom";
import { getLocale, localized } from "../../lib/preferences";
import EntityActivity from "../../components/ui-v2/EntityActivity";
import EntityNotes from "../../components/ui-v2/EntityNotes";
import EmptyState from "../../components/ui-v2/EmptyState";

export default function Tasks() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const location = useLocation();
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useApp();

  const [selectedTask, setSelectedTask] = useState(() => {
    const selectedId = Number((location.state as { selectedId?: unknown } | null)?.selectedId);
    return tasks.find((task) => task.id === selectedId) ?? tasks[0];
  });
  const [isModalOpen, setIsModalOpen] = useState(
    () => location.state?.quickCreate === "task"
  );
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [site, setSite] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");

  const completed = tasks.filter((task) => task.status === "Done").length;
  const open = tasks.filter((task) => task.status === "Open").length;
  const inProgress = tasks.filter((task) => task.status === "In Progress").length;

  const filteredTasks = tasks.filter((task) =>
    `${task.title} ${task.site} ${task.owner} ${task.status} ${task.priority}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function resetForm() {
    setTitle("");
    setSite("");
    setOwner("");
    setDescription("");
    setEditingTaskId(null);
    setIsModalOpen(false);
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal() {
    if (!selectedTask) return;

    setEditingTaskId(selectedTask.id);
    setTitle(selectedTask.title);
    setSite(selectedTask.site);
    setOwner(selectedTask.owner);
    setDescription(selectedTask.description);
    setIsModalOpen(true);
  }

  function handleSaveTask() {
    if (editingTaskId && selectedTask) {
      const updatedTask = {
        ...selectedTask,
        title: title || "Untitled Task",
        site: site || "No site",
        owner: owner || "Unassigned",
        description: description || "No description",
      };

      updateTask(updatedTask);
      setSelectedTask(updatedTask);
      resetForm();
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title || "Untitled Task",
      site: site || "No site",
      owner: owner || "Unassigned",
      priority: "Medium",
      status: "Open",
      due: "Today",
      description: description || "No description",
      checklist: [],
    };

    addTask(newTask);
    setSelectedTask(newTask);
    resetForm();
  }

  function handleDeleteTask() {
    if (!selectedTask) return;

    deleteTask(selectedTask.id);
    const remaining = tasks.filter((task) => task.id !== selectedTask.id);
    setSelectedTask(remaining[0]);
  }

  function handleCompleteTask() {
    if (!selectedTask) return;

    completeTask(selectedTask.id);
    setSelectedTask({ ...selectedTask, status: "Done" });
  }

  return (
    <div className="nexora-enter pb-10">
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            {t("Task Operations", "ניהול משימות")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            {t("Tasks Command", "מרכז המשימות")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {t("Manage operational tasks, owners, priorities and mission status.", "ניהול משימות, אחראים, עדיפויות ומצב הביצוע במקום אחד.")}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          {t("New Task", "משימה חדשה")}
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <TaskKPI icon={<ClipboardList />} title={t("Total Tasks", "סך משימות")} value={tasks.length} note={t("Tracked tasks", "משימות במעקב")} color="blue" />
        <TaskKPI icon={<Clock />} title={t("Open", "פתוחות")} value={open} note={t("Waiting action", "ממתינות לטיפול")} color="orange" />
        <TaskKPI icon={<AlertTriangle />} title={t("In Progress", "בביצוע")} value={inProgress} note={t("Active work", "עבודה פעילה")} color="purple" />
        <TaskKPI icon={<CheckCircle2 />} title={t("Completed", "הושלמו")} value={completed} note={t("Mission done", "הביצוע הסתיים")} color="green" />
      </div>

      <label className="my-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search tasks, owners, sites or status...", "חיפוש לפי משימה, אחראי, אתר או סטטוס...")}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      </label>
      <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <Panel title={t("Mission Tasks", "משימות פעילות")}>
          {filteredTasks.length === 0 ? (
            <EmptyState icon={<Search size={21} />} title={t("No matching tasks", "לא נמצאו משימות מתאימות")} description={t("Try another phrase or clear the current search.", "אפשר לנסות ביטוי אחר או לנקות את החיפוש הנוכחי.")} action={<button type="button" onClick={() => setSearch("")} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{t("Clear search", "ניקוי החיפוש")}</button>} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`rounded-2xl border p-5 text-start transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${selectedTask?.id === task.id ? "border-blue-300 bg-blue-50/60 ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        {task.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {task.owner}
                      </p>
                    </div>

                    <StatusBadge status={task.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniMetric
                      icon={<ClipboardList size={15} />}
                      label={t("Priority", "עדיפות")}
                      value={task.priority}
                    />

                    <MiniMetric
                      icon={<Clock size={15} />}
                      label={t("Due", "מועד")}
                      value={task.due}
                    />

                    <MiniMetric
                      icon={<AlertTriangle size={15} />}
                      label={t("Site", "אתר")}
                      value={task.site}
                    />

                    <MiniMetric
                      icon={<CheckCircle2 size={15} />}
                      label={t("Owner", "אחראי")}
                      value={task.owner}
                    />
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t("Description", "תיאור")}
                    </p>

                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">
                      {task.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {selectedTask ? (
          <Panel title={t("Task Details", "פרטי משימה")}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              {t("Selected Mission", "משימה שנבחרה")}
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {selectedTask.title}
            </h2>

            <div className="mt-5">
              <StatusBadge status={selectedTask.status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <InfoDark label={t("Owner", "אחראי")} value={selectedTask.owner} />
              <InfoDark label={t("Site", "אתר")} value={selectedTask.site} />
              <InfoDark label={t("Priority", "עדיפות")} value={selectedTask.priority} />
              <InfoDark label={t("Due", "מועד")} value={selectedTask.due} />
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-700">
                {t("AI Mission Brief", "סיכום משימה חכם")}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedTask.status === "Done"
                  ? t("Mission completed successfully.", "המשימה הושלמה בהצלחה.")
                  : selectedTask.status === "In Progress"
                  ? t("Mission currently running. Monitor execution.", "המשימה נמצאת בביצוע וכדאי לעקוב אחר ההתקדמות.")
                  : t("Mission is waiting for deployment.", "המשימה ממתינה להתחלת ביצוע.")}
              </p>
            </div>

            <EntityActivity createdLabel={t("Task added to the workspace", "המשימה נוספה למערכת")} updatedLabel={t(`Current status: ${selectedTask.status}`, `סטטוס נוכחי: ${selectedTask.status}`)} />
            <EntityNotes key={`task_${selectedTask.id}`} entityKey={`task_${selectedTask.id}`} />

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={handleCompleteTask}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {t("Complete", "סיום משימה")}
              </button>

              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Edit size={16} />
                {t("Edit", "עריכה")}
              </button>

              <button
                onClick={handleDeleteTask}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 size={16} />
                {t("Delete", "מחיקה")}
              </button>
            </div>
          </Panel>
        ) : (
          <Panel title={t("Task Details", "פרטי משימה")}>
            <p className="text-slate-500">{t("No task selected.", "לא נבחרה משימה.")}</p>
          </Panel>
        )}
      </div>
      {isModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  {editingTaskId ? t("Edit task", "עריכת משימה") : t("New task", "משימה חדשה")}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {editingTaskId ? t("Update task details", "עדכון פרטי המשימה") : t("Create a focused task", "יצירת משימה ממוקדת")}
                </h2>
              </div>

              <button
                onClick={resetForm}
                aria-label={t("Close", "סגירה")}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <DarkInput value={title} onChange={setTitle} placeholder="Task title" />
              <DarkInput value={site} onChange={setSite} placeholder="Site" />
              <DarkInput value={owner} onChange={setOwner} placeholder="Owner" />

              <textarea
                aria-label={t("Task description", "תיאור המשימה")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-28 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                placeholder="Description"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t("Cancel", "ביטול")}
              </button>

              <button
                onClick={handleSaveTask}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingTaskId ? t("Save changes", "שמירת שינויים") : t("Create task", "יצירת משימה")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="nexora-surface rounded-2xl p-5 sm:p-6">
      <h2 className="mb-5 text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function TaskKPI({
  icon,
  title,
  value,
  note,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  note: string;
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-amber-50 text-amber-600",
    purple: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="nexora-surface nexora-lift rounded-2xl p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">{note}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Done"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : status === "In Progress"
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : "border-blue-100 bg-blue-50 text-blue-700";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="mb-2 text-blue-600">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function InfoDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function DarkInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      aria-label={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      placeholder={placeholder}
    />
  );
}
