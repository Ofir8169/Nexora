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
import { useApp } from "../../context/AppContext";

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useApp();

  const [selectedTask, setSelectedTask] = useState(tasks[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [site, setSite] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");

  const completed = tasks.filter((task) => task.status === "Done").length;
  const open = tasks.filter((task) => task.status === "Open").length;
  const inProgress = tasks.filter((task) => task.status === "In Progress").length;
  const active = tasks.filter((task) => task.status !== "Done").length;

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
    <div className="pb-10 text-white">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Task Operations
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            Tasks Command
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            Manage operational tasks, owners, priorities and mission status.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/20"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <TaskKPI icon={<ClipboardList />} title="Total Tasks" value={tasks.length} note="Tracked tasks" color="blue" />
        <TaskKPI icon={<Clock />} title="Open" value={open} note="Waiting action" color="orange" />
        <TaskKPI icon={<AlertTriangle />} title="In Progress" value={inProgress} note="Active work" color="purple" />
        <TaskKPI icon={<CheckCircle2 />} title="Completed" value={completed} note="Mission done" color="green" />
      </div>

      <div className="my-6 flex items-center gap-3 rounded-3xl border border-blue-400/30 bg-slate-900/95 px-5 py-4 shadow-2xl shadow-blue-500/10">
        <Search size={18} className="text-cyan-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks, owners, sites or status..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <Panel title="Mission Tasks">
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-slate-400">No tasks found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-left transition hover:border-cyan-400/40 hover:bg-slate-900"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-black text-white">
                        {task.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {task.owner}
                      </p>
                    </div>

                    <StatusBadge status={task.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniMetric
                      icon={<ClipboardList size={15} />}
                      label="Priority"
                      value={task.priority}
                    />

                    <MiniMetric
                      icon={<Clock size={15} />}
                      label="Due"
                      value={task.due}
                    />

                    <MiniMetric
                      icon={<AlertTriangle size={15} />}
                      label="Site"
                      value={task.site}
                    />

                    <MiniMetric
                      icon={<CheckCircle2 size={15} />}
                      label="Owner"
                      value={task.owner}
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900 p-4">
                    <p className="text-xs font-black uppercase text-slate-500">
                      Description
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                      {task.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {selectedTask ? (
          <Panel title="Task Details">
            <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
              Selected Mission
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              {selectedTask.title}
            </h2>

            <div className="mt-5">
              <StatusBadge status={selectedTask.status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <InfoDark label="Owner" value={selectedTask.owner} />
              <InfoDark label="Site" value={selectedTask.site} />
              <InfoDark label="Priority" value={selectedTask.priority} />
              <InfoDark label="Due" value={selectedTask.due} />
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
              <p className="text-sm font-black text-cyan-300">
                AI Mission Brief
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {selectedTask.status === "Done"
                  ? "Mission completed successfully."
                  : selectedTask.status === "In Progress"
                  ? "Mission currently running. Monitor execution."
                  : "Mission is waiting for deployment."}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={handleCompleteTask}
                className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white"
              >
                Complete
              </button>

              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-black text-white"
              >
                <Edit size={16} />
                Edit
              </button>

              <button
                onClick={handleDeleteTask}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </Panel>
        ) : (
          <Panel title="Task Details">
            <p className="text-slate-400">No task selected.</p>
          </Panel>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-blue-400/30 bg-slate-900 p-6 shadow-2xl shadow-blue-500/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
                  {editingTaskId ? "Edit Task" : "New Task"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {editingTaskId ? "Update mission task" : "Create mission task"}
                </h2>
              </div>

              <button
                onClick={resetForm}
                className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <DarkInput value={title} onChange={setTitle} placeholder="Task title" />
              <DarkInput value={site} onChange={setSite} placeholder="Site" />
              <DarkInput value={owner} onChange={setOwner} placeholder="Owner" />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-28 resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Description"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-black text-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTask}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-black text-white"
              >
                {editingTaskId ? "Save Changes" : "Create Task"}
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
    <div className="rounded-3xl border border-blue-400/30 bg-slate-900/95 p-6 shadow-2xl shadow-blue-500/20">
      <h2 className="mb-5 text-2xl font-black text-white">{title}</h2>
      {children}
    </div>
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
    blue: "border-blue-400/50 text-blue-300",
    green: "border-green-400/50 text-green-300",
    orange: "border-orange-400/50 text-orange-300",
    purple: "border-purple-400/50 text-purple-300",
  };

  return (
    <div className={`rounded-3xl border bg-slate-900/95 p-6 shadow-xl ${colors[color]}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>

      <p className="text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-5xl font-black text-white">{value}</p>
      <p className="mt-2 font-black">{note}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Done"
      ? "border-green-400/40 bg-green-500/20 text-green-300"
      : status === "In Progress"
      ? "border-orange-400/40 bg-orange-500/20 text-orange-300"
      : "border-blue-400/40 bg-blue-500/20 text-blue-300";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${color}`}>
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
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
      <div className="mb-2 text-cyan-300">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-black text-white">{value}</p>
    </div>
  );
}

function InfoDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
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
      onChange={(e) => onChange(e.target.value)}
      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
      placeholder={placeholder}
    />
  );
}