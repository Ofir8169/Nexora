import { Bell, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-blue-600">Nexora Command</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Good evening, Ofir
        </h1>
        <p className="mt-2 text-slate-500">
          AI operating system for field operations.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
          <Search size={19} />
        </button>

        <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
          <Bell size={19} />
        </button>

        <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
          <User size={19} />
        </button>
      </div>
    </header>
  );
}