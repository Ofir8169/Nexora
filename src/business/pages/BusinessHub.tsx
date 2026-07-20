import {
  Bot,
  BriefcaseBusiness,
  FileText,
  ReceiptText,
  RefreshCw,
  Users,
  WalletCards,
} from "lucide-react";

import BusinessState from "../components/BusinessState";
import { useBusiness } from "../context/BusinessContext";

export default function BusinessHub() {
  const {
    dashboard,
    loading,
    error,
    refreshAll,
  } = useBusiness();

  return (
    <BusinessState
      loading={loading}
      error={error}
      onRetry={() => void refreshAll()}
    >
      <div className="space-y-8 pb-12 text-white">
        <section className="relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-slate-950 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%)]" />

          <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400">
                Nexora Business OS
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight xl:text-5xl">
                Run your entire business
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                Customers, people, tasks, finance, documents,
                automations and business intelligence in one
                operating system.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refreshAll()}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white transition hover:bg-white/10"
            >
              <RefreshCw size={18} />
              Refresh Data
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<BriefcaseBusiness />}
            title="Customers"
            value={dashboard?.customers.total ?? 0}
            note={`${dashboard?.customers.active ?? 0} active`}
          />

          <SummaryCard
            icon={<Users />}
            title="Employees"
            value={dashboard?.employees.total ?? 0}
            note={`${dashboard?.employees.available ?? 0} available`}
          />

          <SummaryCard
            icon={<FileText />}
            title="Open Tasks"
            value={dashboard?.tasks.open ?? 0}
            note={`${dashboard?.tasks.critical ?? 0} critical`}
          />

          <SummaryCard
            icon={<WalletCards />}
            title="Outstanding"
            value={formatCurrency(
              dashboard?.finance.outstandingRevenue ?? 0
            )}
            note={`${dashboard?.finance.overdueInvoices ?? 0} overdue`}
          />
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ModuleCard
            icon={<BriefcaseBusiness />}
            title="CRM"
            text="Customers, contacts, balances and activity."
          />

          <ModuleCard
            icon={<Users />}
            title="People"
            text="Employees, workload, availability and assignments."
          />

          <ModuleCard
            icon={<FileText />}
            title="Smart Tasks"
            text="Automatic priority scoring and task management."
          />

          <ModuleCard
            icon={<ReceiptText />}
            title="Invoices"
            text="Invoices, receipts, quotations and payments."
          />

          <ModuleCard
            icon={<WalletCards />}
            title="Finance"
            text="Revenue, expenses, profit and outstanding debt."
          />

          <ModuleCard
            icon={<Bot />}
            title="Automations"
            text="Business rules, reminders and automatic actions."
          />
        </section>
      </div>
    </BusinessState>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
        {icon}
      </div>

      <p className="mt-6 text-sm font-bold text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function ModuleCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      className="group rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
        {icon}
      </div>

      <h2 className="mt-6 text-xl font-black text-white">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </button>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}