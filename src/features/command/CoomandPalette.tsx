import { Search } from "lucide-react";

export default function CommandPalette() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
        <Search size={18} className="text-slate-400" />

        <input
          className="w-full outline-none"
          placeholder="Search anything or ask AI..."
        />

        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">
          Ctrl K
        </span>
      </div>

      <div className="mt-6 space-y-3">

        <Command text="Create Task" />

        <Command text="Open Fleet" />

        <Command text="Go to Site North" />

        <Command text="Show Critical Vehicles" />

        <Command text="Generate Daily Report" />

      </div>
    </div>
  );
}

function Command({ text }: { text: string }) {
  return (
    <button className="flex w-full justify-between rounded-2xl px-4 py-3 text-left hover:bg-slate-50">
      <span>{text}</span>

      <span className="text-slate-400">↵</span>
    </button>
  );
}