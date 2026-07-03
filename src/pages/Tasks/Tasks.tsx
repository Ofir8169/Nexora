import { useState } from "react";
import {
  Search,
  Plus,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
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

  const filteredTasks = tasks.filter((task) =>
    `${task.title} ${task.site} ${task.owner}`
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
    if (editingTaskId) {
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

  function handleDelete() {
    if (!selectedTask) return;

    deleteTask(selectedTask.id);
    const remaining = tasks.filter((task) => task.id !== selectedTask.id);
    setSelectedTask(remaining[0]);
  }

  function handleComplete() {
    if (!selectedTask) return;

    completeTask(selectedTask.id);
    setSelectedTask({ ...selectedTask, status: "Done" });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Operations</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Tasks</h1>
          <p className="mt-2 text-slate-500">
            Manage field work, owners, priorities and status.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          {filteredTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="grid w-full grid-cols-5 items-center border-b border-slate-100 px-6 py-5 text-left hover:bg-slate-50"
            >
              <div className="col-span-2">
                <p className="font-semibold text-slate-950">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500">{task.site}</p>
              </div>

              <p className="text-sm text-slate-700">{task.owner}</p>
              <p className="text-sm text-slate-700">{task.priority}</p>

              <span className="flex items-center gap-2 text-sm text-slate-700">
                {task.status === "Done" ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : task.status === "In Progress" ? (
                  <Clock size={16} className="text-orange-500" />
                ) : (
                  <AlertTriangle size={16} className="text-red-500" />
                )}
                {task.status}
              </span>
            </button>
          ))}
        </div>

        {selectedTask ? (
          <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-blue-600">Task Details</p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {selectedTask.title}
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {selectedTask.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Info label="Owner" value={selectedTask.owner} />
              <Info label="Site" value={selectedTask.site} />
              <Info label="Priority" value={selectedTask.priority} />
              <Info label="Status" value={selectedTask.status} />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white"
              >
                <CheckCircle2 size={16} />
                Complete
              </button>

              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <Edit size={16} />
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </aside>
        ) : (
          <aside className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            No task selected.
          </aside>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  {editingTaskId ? "Edit Task" : "New Task"}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {editingTaskId ? "Update field task" : "Create field task"}
                </h2>
              </div>

              <button
                onClick={resetForm}
                className="rounded-xl bg-slate-100 p-2 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Task name"
              />

              <input
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Site"
              />

              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Owner"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-28 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Description"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTask}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}