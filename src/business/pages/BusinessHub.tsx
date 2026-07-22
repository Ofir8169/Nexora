import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Building2,
  AlarmClock,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CheckCircle2,
  FileText,
  FolderOpen,
  GripVertical,
  LayoutDashboard,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Receipt,
  Search,
  Send,
  Trash2,
  Users,
  WalletCards,
  Workflow,
  Zap,
  X,
} from "lucide-react";
import { toast } from "sonner";

import BusinessState from "../components/BusinessState";
import { useBusiness } from "../context/business-context";
import type { Automation, BusinessDocument, BusinessTask, Customer, Invoice, TaskStatus } from "../types/business";
import { getLocale, getUserRole, localized } from "../../lib/preferences";

type View = "overview" | "customers" | "tasks" | "finance" | "documents" | "calendar" | "automations";
type CreateType = "customer" | "task" | "invoice" | "expense";

const views = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "customers" as const, label: "Customers", icon: Users },
  { id: "tasks" as const, label: "Tasks", icon: FileText },
  { id: "finance" as const, label: "Finance", icon: WalletCards },
  { id: "documents" as const, label: "Documents", icon: FolderOpen },
  { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
  { id: "automations" as const, label: "Automations", icon: Workflow },
];

export default function BusinessHub() {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const location = useLocation();
  const business = useBusiness();
  const { dashboard, loading, error, refreshAll } = business;
  const requestedCreate = location.state?.quickCreate as CreateType | undefined;
  const requestedView = location.state?.view as View | undefined;
  const requestedId = location.state?.selectedId as string | undefined;
  const requestedType = location.state?.resultType as string | undefined;
  const [view, setView] = useState<View>(() =>
    requestedView ?? (requestedCreate === "customer"
      ? "customers"
      : requestedCreate === "invoice" || requestedCreate === "expense"
        ? "finance"
        : requestedCreate === "task"
          ? "tasks"
          : "overview")
  );
  const [createType, setCreateType] = useState<CreateType | null>(
    () => requestedCreate ?? null
  );
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(() =>
    requestedType === "customer"
      ? business.customers.find((customer) => String(customer.id) === String(requestedId)) ?? null
      : null
  );
  const [documentDialog, setDocumentDialog] = useState(false);

  return (
    <BusinessState
      loading={loading}
      error={error}
      onRetry={() => void refreshAll()}
    >
      <div className="nexora-enter space-y-6 pb-12">
        <section className="relative overflow-hidden rounded-[28px] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/60 to-blue-50 p-6 shadow-sm lg:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-indigo-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {t("Business OS · Live", "העסק · נתונים חיים")}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 lg:text-4xl">
              {t("Business workspace", "סביבת העסק")}
            </h1>
            <p className="mt-2 text-slate-500">
              {t("Customers, business tasks and finance in one focused workspace.", "לקוחות, משימות עסקיות וכספים בסביבת עבודה ממוקדת אחת.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshAll()}
            className="flex w-fit items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <RefreshCw size={17} /> {t("Refresh", "רענון")}
          </button>
          </div>
          <div className="relative mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-indigo-100 pt-5">
            <HeaderMetric label={t("Active customers", "לקוחות פעילים")} value={dashboard?.customers.active ?? 0} />
            <HeaderMetric label={t("Open tasks", "משימות פתוחות")} value={dashboard?.tasks.open ?? 0} />
            <HeaderMetric label={t("Net profit", "רווח נקי")} value={formatCurrency(dashboard?.finance.profit ?? 0)} />
          </div>
        </section>

        <nav
          aria-label="Business sections"
          className="sticky top-[84px] z-30 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 shadow-lg shadow-slate-900/[0.04] backdrop-blur-xl"
        >
          {views.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setSearch("");
                }}
                className={`flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  view === item.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={17} /> {item.id === "overview" ? t("Overview", "סקירה") : item.id === "customers" ? t("Customers", "לקוחות") : item.id === "tasks" ? t("Tasks", "משימות") : item.id === "finance" ? t("Finance", "כספים") : item.id === "documents" ? t("Documents", "מסמכים") : item.id === "calendar" ? t("Calendar", "יומן") : t("Automations", "אוטומציות")}
              </button>
            );
          })}
        </nav>

        {view === "overview" && (
          <Overview
            dashboard={dashboard}
            onOpen={setView}
            onCreate={setCreateType}
            automations={business.automations}
            onRunAutomations={business.runAutomations}
            customers={business.customers}
            tasks={business.tasks}
            invoices={business.invoices}
            onCreateTask={business.createTask}
            onUpdateTask={business.updateTask}
            onUpdateInvoice={business.updateInvoice}
          />
        )}
        {view === "customers" && (
          <CustomersView
            customers={business.customers}
            search={search}
            onSearch={setSearch}
            onCreate={() => setCreateType("customer")}
            onUpdate={business.updateCustomer}
            onDelete={business.deleteCustomer}
            onSelect={setSelectedCustomer}
          />
        )}
        {view === "tasks" && (
          <TasksView
            tasks={business.tasks}
            customers={business.customers}
            search={search}
            onSearch={setSearch}
            onCreate={() => setCreateType("task")}
            onUpdate={business.updateTask}
            onDelete={business.deleteTask}
            onCreateInvoiceFromTask={business.createInvoiceFromTask}
          />
        )}
        {view === "finance" && (
          <FinanceView
            invoices={business.invoices}
            expenses={business.expenses}
            customers={business.customers}
            onCreate={setCreateType}
            onUpdateInvoice={business.updateInvoice}
            onDeleteInvoice={business.deleteInvoice}
            onDeleteExpense={business.deleteExpense}
          />
        )}
        {view === "documents" && (
          <DocumentsView
            documents={business.documents}
            customers={business.customers}
            onCreate={() => setDocumentDialog(true)}
            onDelete={business.deleteDocument}
          />
        )}
        {view === "calendar" && (
          <CalendarView
            tasks={business.tasks}
            invoices={business.invoices}
            expenses={business.expenses}
            customers={business.customers}
          />
        )}
        {view === "automations" && <AutomationsView automations={business.automations} onCreate={business.createAutomation} onUpdate={business.updateAutomation} onDelete={business.deleteAutomation} onRun={business.runAutomations} />}

        {createType && (
          <CreateDialog
            type={createType}
            customers={business.customers}
            employees={business.employees}
            onClose={() => setCreateType(null)}
            onCreateCustomer={business.createCustomer}
            onCreateTask={business.createTask}
            onCreateInvoice={business.createInvoice}
            onCreateExpense={business.createExpense}
          />
        )}
        {selectedCustomer && (
          <Customer360
            customer={selectedCustomer}
            tasks={business.tasks.filter((item) => item.customerId === selectedCustomer.id)}
            invoices={business.invoices.filter((item) => item.customerId === selectedCustomer.id)}
            documents={business.documents.filter((item) => item.customerId === selectedCustomer.id)}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
        {documentDialog && (
          <DocumentDialog
            customers={business.customers}
            onCreate={business.createDocument}
            onClose={() => setDocumentDialog(false)}
          />
        )}
      </div>
    </BusinessState>
  );
}

function Overview({
  dashboard,
  onOpen,
  onCreate,
  automations,
  onRunAutomations,
  customers,
  tasks,
  invoices,
  onCreateTask,
  onUpdateTask,
  onUpdateInvoice,
}: {
  dashboard: ReturnType<typeof useBusiness>["dashboard"];
  onOpen: (view: View) => void;
  onCreate: (type: CreateType) => void;
  automations: ReturnType<typeof useBusiness>["automations"];
  onRunAutomations: ReturnType<typeof useBusiness>["runAutomations"];
  customers: Customer[];
  tasks: BusinessTask[];
  invoices: Invoice[];
  onCreateTask: ReturnType<typeof useBusiness>["createTask"];
  onUpdateTask: ReturnType<typeof useBusiness>["updateTask"];
  onUpdateInvoice: ReturnType<typeof useBusiness>["updateInvoice"];
}) {
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    try {
      const result = await onRunAutomations();
      toast.success(`${result.ran} automations checked · ${result.created} tasks created`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Automation failed");
    } finally {
      setRunning(false);
    }
  }
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<BriefcaseBusiness size={20} />}
          title="Customers"
          value={dashboard?.customers.total ?? 0}
          note={`${dashboard?.customers.active ?? 0} active`}
          tone="blue"
        />
        <SummaryCard
          icon={<FileText size={20} />}
          title="Open tasks"
          value={dashboard?.tasks.open ?? 0}
          note={`${dashboard?.tasks.critical ?? 0} critical`}
          tone="amber"
        />
        <SummaryCard
          icon={<CircleDollarSign size={20} />}
          title="Paid revenue"
          value={formatCurrency(dashboard?.finance.paidRevenue ?? 0)}
          note={`${dashboard?.finance.overdueInvoices ?? 0} overdue`}
          tone="emerald"
        />
        <SummaryCard
          icon={<WalletCards size={20} />}
          title="Outstanding"
          value={formatCurrency(dashboard?.finance.outstandingRevenue ?? 0)}
          note={`Profit ${formatCurrency(dashboard?.finance.profit ?? 0)}`}
          tone="violet"
        />
      </section>

      <ActionCenter customers={customers} tasks={tasks} invoices={invoices} onOpen={onOpen} onUpdateTask={onUpdateTask} onUpdateInvoice={onUpdateInvoice} />

      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard
          title="Manage customers"
          text="View balances, contact details and customer status."
          action="Open CRM"
          onClick={() => onOpen("customers")}
        />
        <ActionCard
          title="Prioritize work"
          text="Manage scored business tasks and completion status."
          action="Open tasks"
          onClick={() => onOpen("tasks")}
        />
        <ActionCard
          title="Track money"
          text="Review invoices, expenses and overdue revenue."
          action="Open finance"
          onClick={() => onOpen("finance")}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Quick create</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["customer", "task", "invoice", "expense"] as CreateType[]).map(
            (type) => (
              <button
                type="button"
                key={type}
                onClick={() => onCreate(type)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold capitalize text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Plus size={16} /> {type}
              </button>
            )
          )}
        </div>
      </section>

      <WorkflowTemplates onCreateTask={onCreateTask} />

      <section className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><Workflow size={20} /></span>
          <div><h2 className="font-bold text-slate-900">Business automations</h2><p className="mt-1 text-sm text-slate-500">{automations.filter((item) => item.enabled).length} active workflows monitor overdue invoices and create follow-up work.</p></div>
        </div>
        <button type="button" disabled={running} onClick={() => void run()} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><RefreshCw className={running ? "animate-spin" : ""} size={16} /> {running ? "Running…" : "Run now"}</button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">Recent activity</h2>
          <p className="text-sm text-slate-500">Changes across connected modules</p>
        </div>
        <div className="divide-y divide-slate-100">
          {dashboard?.recentActivities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 px-5 py-4">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{activity.title}</p>
                <p className="truncate text-sm text-slate-500">{activity.description}</p>
              </div>
              <time className="shrink-0 text-xs text-slate-400">
                {new Date(activity.createdAt).toLocaleDateString()}
              </time>
            </div>
          ))}
          {!dashboard?.recentActivities.length && <Empty text="No activity yet." />}
        </div>
      </section>
    </>
  );
}

function ActionCenter({ customers, tasks, invoices, onOpen, onUpdateTask, onUpdateInvoice }: {
  customers: Customer[];
  tasks: BusinessTask[];
  invoices: Invoice[];
  onOpen: (view: View) => void;
  onUpdateTask: ReturnType<typeof useBusiness>["updateTask"];
  onUpdateInvoice: ReturnType<typeof useBusiness>["updateInvoice"];
}) {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const today = new Date().toISOString().slice(0, 10);
  const customerNames = new Map(customers.map((customer) => [customer.id, customer.name]));
  const overdueInvoices = invoices.filter((invoice) => !["Paid", "Cancelled"].includes(invoice.status) && invoice.dueDate < today);
  const overdueTasks = tasks.filter((task) => !["Done", "Cancelled"].includes(task.status) && task.dueDate && task.dueDate < today);
  const leads = customers.filter((customer) => customer.status === "Lead");
  const total = overdueInvoices.length + overdueTasks.length + leads.length;

  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${total ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{total ? <AlarmClock size={19} /> : <CheckCircle2 size={19} />}</span><div><h2 className="font-bold text-slate-900">{t("Needs attention", "דורש טיפול")}</h2><p className="text-sm text-slate-500">{total ? t(`${total} items need a decision today`, `${total} פריטים מחכים להחלטה היום`) : t("You are caught up", "הכול מטופל")}</p></div></div>
      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{t("Live priority queue", "תור עדיפויות חי")}</span>
    </div>
    {total ? <div className="divide-y divide-slate-100">
      {overdueInvoices.slice(0, 2).map((invoice) => <AttentionRow key={invoice.id} icon={<Receipt size={17} />} tone="red" title={`${invoice.documentNumber} · ${customerNames.get(invoice.customerId) ?? t("Customer", "לקוח")}`} detail={t(`Payment overdue · ${formatCurrency(invoice.total)}`, `תשלום באיחור · ${formatCurrency(invoice.total)}`)} action={t("Mark paid", "סימון כשולם")} onAction={async () => { await onUpdateInvoice(invoice.id, { status: "Paid" }); toast.success(t("Invoice marked as paid", "החשבונית סומנה כשולמה")); }} />)}
      {overdueTasks.slice(0, 2).map((task) => <AttentionRow key={task.id} icon={<AlarmClock size={17} />} tone="amber" title={task.title} detail={t(`Task overdue since ${task.dueDate}`, `המשימה באיחור מתאריך ${task.dueDate}`)} action={t("Start task", "התחלת משימה")} onAction={async () => { await onUpdateTask(task.id, { status: "In Progress" }); toast.success(t("Task started", "המשימה התחילה")); }} />)}
      {leads.slice(0, 1).map((customer) => <AttentionRow key={customer.id} icon={<Users size={17} />} tone="blue" title={customer.name} detail={t("Lead waiting for follow-up", "ליד שממתין להמשך טיפול")} action={t("Open CRM", "פתיחת CRM")} onAction={() => onOpen("customers")} />)}
    </div> : <div className="px-5 py-8 text-center text-sm text-slate-500">{t("No overdue payments, tasks or unattended leads.", "אין תשלומים באיחור, משימות שחרגו או לידים שממתינים.")}</div>}
  </section>;
}

function AttentionRow({ icon, tone, title, detail, action, onAction }: { icon: React.ReactNode; tone: "red" | "amber" | "blue"; title: string; detail: string; action: string; onAction: () => void | Promise<void> }) {
  const tones = { red: "bg-red-50 text-red-600", amber: "bg-amber-50 text-amber-600", blue: "bg-blue-50 text-blue-600" };
  return <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{title}</p><p className="mt-0.5 text-xs text-slate-500">{detail}</p></div><button type="button" onClick={() => void onAction()} className="flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">{action}<ArrowRight size={14} /></button></div>;
}

function WorkflowTemplates({ onCreateTask }: { onCreateTask: ReturnType<typeof useBusiness>["createTask"] }) {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const [creating, setCreating] = useState<string | null>(null);
  const templates = [
    { id: "service", title: t("New service follow-up", "מעקב קריאת שירות"), description: t("Confirm the customer is satisfied and close open details.", "לוודא שביעות רצון ולסגור פרטים פתוחים."), days: 1, urgency: 7, value: 7, risk: 4 },
    { id: "lead", title: t("Follow up with a lead", "חזרה לליד חדש"), description: t("Contact the lead, qualify the need and define the next step.", "ליצור קשר, להבין את הצורך ולהגדיר שלב הבא."), days: 2, urgency: 8, value: 9, risk: 5 },
    { id: "weekly", title: t("Weekly operations review", "בדיקת תפעול שבועית"), description: t("Review open work, team load and upcoming deadlines.", "לעבור על עבודה פתוחה, עומס צוות ודדליינים."), days: 7, urgency: 5, value: 8, risk: 4 },
  ];
  async function create(template: (typeof templates)[number]) {
    setCreating(template.id);
    try {
      await onCreateTask({ title: template.title, description: template.description, status: "Open", urgency: template.urgency, businessValue: template.value, risk: template.risk, customerImportance: 6, dueDate: futureDate(template.days) });
      toast.success(t("Task created from template", "המשימה נוצרה מהתבנית"));
    } catch (error) { toast.error(error instanceof Error ? error.message : t("Could not create task", "לא ניתן ליצור משימה")); }
    finally { setCreating(null); }
  }
  return <section><div className="mb-3 flex items-end justify-between"><div><h2 className="font-bold text-slate-900">{t("Work templates", "תבניות עבודה")}</h2><p className="mt-1 text-sm text-slate-500">{t("Start common processes without rebuilding them every time.", "מתחילים תהליכים קבועים בלי לבנות אותם מחדש בכל פעם.")}</p></div></div><div className="grid gap-3 md:grid-cols-3">{templates.map((template) => <button type="button" disabled={creating !== null} key={template.id} onClick={() => void create(template)} className="nexora-surface nexora-lift group rounded-2xl p-5 text-start disabled:opacity-60"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Zap size={18} /></span><h3 className="mt-4 font-bold text-slate-900">{template.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{template.description}</p><span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600">{creating === template.id ? t("Creating…", "יוצר…") : t("Use template", "שימוש בתבנית")}<ArrowRight size={15} /></span></button>)}</div></section>;
}

function CustomersView({
  customers,
  search,
  onSearch,
  onCreate,
  onUpdate,
  onDelete,
  onSelect,
}: {
  customers: Customer[];
  search: string;
  onSearch: (value: string) => void;
  onCreate: () => void;
  onUpdate: (id: string, data: Partial<Customer>) => Promise<Customer>;
  onDelete: (id: string) => Promise<void>;
  onSelect: (customer: Customer) => void;
}) {
  const filtered = customers.filter((customer) =>
    `${customer.name} ${customer.company} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <DataSection
      title="Customers"
      count={customers.length}
      search={search}
      onSearch={onSearch}
      onCreate={onCreate}
      createLabel="New customer"
    >
      <div className="divide-y divide-slate-100">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px_120px_90px] md:items-center"
          >
            <button type="button" onClick={() => onSelect(customer)} className="min-w-0 text-left">
              <p className="truncate font-semibold text-slate-900 hover:text-blue-700">{customer.name}</p>
              <p className="truncate text-sm text-slate-500">{customer.email}</p>
            </button>
            <span className="text-sm text-slate-600">{customer.company}</span>
            <button
              type="button"
              onClick={async () => {
                await onUpdate(customer.id, {
                  status: customer.status === "Active" ? "Inactive" : "Active",
                });
                toast.success("Customer status updated");
              }}
              className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
            >
              {customer.status}
            </button>
            <DeleteButton
              label={`Delete ${customer.name}`}
              onDelete={async () => {
                await onDelete(customer.id);
                toast.success("Customer deleted");
              }}
            />
          </div>
        ))}
        {!filtered.length && <Empty text="No customers found." />}
      </div>
    </DataSection>
  );
}

function TasksView({
  tasks,
  customers,
  search,
  onSearch,
  onCreate,
  onUpdate,
  onDelete,
  onCreateInvoiceFromTask,
}: {
  tasks: BusinessTask[];
  customers: Customer[];
  search: string;
  onSearch: (value: string) => void;
  onCreate: () => void;
  onUpdate: (id: string, data: Partial<BusinessTask>) => Promise<BusinessTask>;
  onDelete: (id: string) => Promise<void>;
  onCreateInvoiceFromTask: ReturnType<typeof useBusiness>["createInvoiceFromTask"];
}) {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const [invoiceTask, setInvoiceTask] = useState<BusinessTask | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [converting, setConverting] = useState(false);
  const customerNames = new Map(customers.map((item) => [item.id, item.name]));
  const filtered = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DataSection
      title="Business tasks"
      count={tasks.length}
      search={search}
      onSearch={onSearch}
      onCreate={onCreate}
      createLabel="New task"
    >
      {filtered.length ? (
        <div className="grid gap-3 overflow-x-auto bg-slate-50/70 p-4 lg:grid-cols-4">
          {(["Open", "In Progress", "Waiting", "Done"] as TaskStatus[]).map((status) => {
            const columnTasks = filtered.filter((task) => task.status === status);
            return (
              <div
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const taskId = event.dataTransfer.getData("text/task-id");
                  if (taskId) void onUpdate(taskId, { status }).then(() => toast.success(`Task moved to ${status}`));
                }}
                className="min-w-[250px] rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-slate-800">{status}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{columnTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <article
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("text/task-id", task.id)}
                      key={task.id}
                      className="group cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md active:cursor-grabbing"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={16} className="mt-0.5 shrink-0 text-slate-300" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{customerNames.get(task.customerId ?? "") ?? "Internal"}</p>
                        </div>
                        <DeleteButton label={`Delete ${task.title}`} onDelete={async () => { await onDelete(task.id); toast.success("Task deleted"); }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${task.priorityScore >= 80 ? "bg-red-50 text-red-600" : task.priorityScore >= 60 ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                          Score {task.priorityScore}
                        </span>
                        <time className="text-[11px] text-slate-400">{task.dueDate || "No date"}</time>
                      </div>
                      {task.status === "Done" && <div className="mt-3 border-t border-slate-100 pt-3">{task.invoiceId ? <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle2 size={14} />{t("Invoice created", "נוצרה חשבונית")}</span> : <button type="button" onClick={() => { setInvoiceTask(task); setInvoiceAmount(""); }} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"><Receipt size={14} />{t("Create invoice from task", "יצירת חשבונית מהמשימה")}</button>}</div>}
                    </article>
                  ))}
                  {!columnTasks.length && <div className="rounded-xl border border-dashed border-slate-200 px-3 py-7 text-center text-xs text-slate-400">Drop tasks here</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : <Empty text="No business tasks found." />}
      {invoiceTask && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="invoice-task-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-blue-600">{t("Completed work", "עבודה שהושלמה")}</p><h2 id="invoice-task-title" className="mt-1 text-xl font-bold text-slate-950">{t("Create invoice", "יצירת חשבונית")}</h2><p className="mt-2 text-sm text-slate-500">{invoiceTask.title}</p></div><button type="button" aria-label={t("Close", "סגירה")} onClick={() => setInvoiceTask(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><label className="mt-6 block text-sm font-medium text-slate-700">{t("Amount before VAT", "סכום לפני מע״מ")}<input autoFocus inputMode="decimal" type="number" min="0" step="0.01" value={invoiceAmount} onChange={(event) => setInvoiceAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-lg font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label><p className="mt-2 text-xs leading-5 text-slate-500">{t("A draft invoice with a 14-day due date will be linked to this task.", "חשבונית טיוטה לתשלום בתוך 14 יום תקושר למשימה הזו.")}</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setInvoiceTask(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">{t("Cancel", "ביטול")}</button><button type="button" disabled={converting || Number(invoiceAmount) <= 0} onClick={async () => { setConverting(true); try { const invoice = await onCreateInvoiceFromTask(invoiceTask.id, Number(invoiceAmount)); toast.success(t(`Invoice ${invoice.documentNumber} created`, `החשבונית ${invoice.documentNumber} נוצרה`)); setInvoiceTask(null); } catch (error) { toast.error(error instanceof Error ? error.message : t("Could not create invoice", "לא ניתן ליצור חשבונית")); } finally { setConverting(false); } }} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{converting ? t("Creating…", "יוצר…") : t("Create draft", "יצירת טיוטה")}</button></div></div></div>}
    </DataSection>
  );
}

function FinanceView({
  invoices,
  expenses,
  customers,
  onCreate,
  onUpdateInvoice,
  onDeleteInvoice,
  onDeleteExpense,
}: {
  invoices: Invoice[];
  expenses: ReturnType<typeof useBusiness>["expenses"];
  customers: Customer[];
  onCreate: (type: CreateType) => void;
  onUpdateInvoice: (id: string, data: Partial<Invoice>) => Promise<Invoice>;
  onDeleteInvoice: (id: string) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}) {
  const customerNames = new Map(customers.map((item) => [item.id, item.name]));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <FinancePanel title="Invoices" onCreate={() => onCreate("invoice")}>
        {invoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center gap-3 border-t border-slate-100 px-5 py-4 first:border-0">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{invoice.documentNumber}</p>
              <p className="truncate text-sm text-slate-500">
                {customerNames.get(invoice.customerId) ?? "Unknown customer"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">{formatCurrency(invoice.total)}</p>
              <button
                type="button"
                disabled={invoice.status === "Paid"}
                onClick={async () => {
                  await onUpdateInvoice(invoice.id, { status: "Paid" });
                  toast.success("Invoice marked as paid");
                }}
                className="text-xs font-semibold text-blue-600 disabled:text-emerald-600"
              >
                {invoice.status}
              </button>
            </div>
            <DeleteButton
              label={`Delete ${invoice.documentNumber}`}
              onDelete={async () => {
                await onDeleteInvoice(invoice.id);
                toast.success("Invoice deleted");
              }}
            />
          </div>
        ))}
        {!invoices.length && <Empty text="No invoices yet." />}
      </FinancePanel>

      <FinancePanel title="Expenses" onCreate={() => onCreate("expense")}>
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center gap-3 border-t border-slate-100 px-5 py-4 first:border-0">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{expense.supplier}</p>
              <p className="truncate text-sm text-slate-500">{expense.description}</p>
            </div>
            <p className="font-semibold text-slate-900">{formatCurrency(expense.total)}</p>
            <DeleteButton
              label={`Delete ${expense.supplier}`}
              onDelete={async () => {
                await onDeleteExpense(expense.id);
                toast.success("Expense deleted");
              }}
            />
          </div>
        ))}
        {!expenses.length && <Empty text="No expenses yet." />}
      </FinancePanel>
    </div>
  );
}

function DocumentsView({ documents, customers, onCreate, onDelete }: {
  documents: BusinessDocument[];
  customers: Customer[];
  onCreate: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const customerNames = new Map(customers.map((item) => [item.id, item.name]));
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div><h2 className="font-bold text-slate-900">Document center</h2><p className="mt-1 text-sm text-slate-500">Files connected to customers and business records.</p></div>
        <button type="button" onClick={onCreate} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={16} /> Upload document</button>
      </div>
      {documents.length ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <article key={document.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FileText size={20} /></span>
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{document.name}</p><p className="mt-0.5 text-xs text-slate-500">{document.type} · {customerNames.get(document.customerId ?? "") ?? "General"}</p></div>
                <DeleteButton label={`Delete ${document.name}`} onDelete={async () => { await onDelete(document.id); toast.success("Document deleted"); }} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <time className="text-xs text-slate-400">{new Date(document.createdAt).toLocaleDateString()}</time>
                {document.fileUrl ? <a href={document.fileUrl} download={document.fileName} className="text-xs font-semibold text-blue-600">Download</a> : <span className="text-xs text-slate-400">Metadata only</span>}
              </div>
            </article>
          ))}
        </div>
      ) : <Empty text="No documents yet. Upload a contract, invoice or receipt to get started." />}
    </section>
  );
}

const automationTemplates = [
  { trigger: "INVOICE_OVERDUE", name: "Overdue payment follow-up", description: "Create a critical collection task when an invoice becomes overdue." },
  { trigger: "CUSTOMER_LEAD", name: "New lead follow-up", description: "Create a follow-up task for every lead that still needs attention." },
  { trigger: "TASK_CRITICAL", name: "Critical task escalation", description: "Create a management review when an open task reaches a critical score." },
  { trigger: "INVOICE_DUE_SOON", name: "Upcoming payment reminder", description: "Create a reminder task three days before a sent invoice is due." },
] as const;

function AutomationsView({ automations, onCreate, onUpdate, onDelete, onRun }: {
  automations: Automation[];
  onCreate: ReturnType<typeof useBusiness>["createAutomation"];
  onUpdate: ReturnType<typeof useBusiness>["updateAutomation"];
  onDelete: ReturnType<typeof useBusiness>["deleteAutomation"];
  onRun: ReturnType<typeof useBusiness>["runAutomations"];
}) {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const [busy, setBusy] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const active = automations.filter((item) => item.enabled).length;
  const canManage = ["Admin", "Manager"].includes(getUserRole());

  async function install(template: (typeof automationTemplates)[number]) {
    setBusy(template.trigger);
    try {
      await onCreate({ name: template.name, description: template.description, trigger: template.trigger, action: "CREATE_TASK", enabled: true, lastRun: null });
      toast.success(t("Automation activated", "האוטומציה הופעלה"));
    } catch (error) { toast.error(error instanceof Error ? error.message : t("Could not activate automation", "לא ניתן להפעיל את האוטומציה")); }
    finally { setBusy(null); }
  }

  async function runAll() {
    setRunning(true);
    try {
      const result = await onRun();
      toast.success(t(`${result.ran} workflows checked · ${result.created} tasks created`, `${result.ran} תהליכים נבדקו · נוצרו ${result.created} משימות`));
    } catch (error) { toast.error(error instanceof Error ? error.message : t("Automation run failed", "הרצת האוטומציות נכשלה")); }
    finally { setRunning(false); }
  }

  if (!canManage) {
    return <section className="nexora-surface rounded-2xl p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Lock size={19} /></span><h2 className="mt-4 text-xl font-bold text-slate-950">{t("Automation access is read-only", "הגישה לאוטומציות היא לקריאה בלבד")}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{t("An administrator or manager can install, pause and run workflows.", "מנהל מערכת או מנהל עסק יכול להתקין, להשהות ולהריץ תהליכים.")}</p><div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">{automations.map((automation) => <div key={automation.id} className="flex items-center justify-between gap-3 px-4 py-3"><span className="text-sm font-semibold text-slate-800">{automationName(automation.trigger, locale, automation.name)}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${automation.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{automation.enabled ? t("Active", "פעילה") : t("Paused", "מושהית")}</span></div>)}</div></section>;
  }

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-blue-50 p-6 shadow-sm sm:p-7">
      <span className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-semibold text-violet-600"><Zap size={16} />{t("Workflow engine", "מנוע תהליכים")}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{t("Let Nexora handle the routine", "נותנים ל־Nexora לטפל בשגרה")}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{t("Automations check live business data and create trackable work—never silent actions.", "האוטומציות בודקות נתונים חיים ויוצרות עבודה שאפשר לעקוב אחריה—בלי פעולות נסתרות.")}</p></div><button type="button" disabled={running || !active} onClick={() => void runAll()} className="flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/15 hover:bg-violet-700 disabled:opacity-50"><Play size={17} />{running ? t("Running…", "מריץ…") : t("Run active now", "הרצת הפעילות עכשיו")}</button></div>
      <div className="relative mt-6 flex gap-6 border-t border-violet-100 pt-5"><HeaderMetric label={t("Active", "פעילות")} value={active} /><HeaderMetric label={t("Available templates", "תבניות זמינות")} value={automationTemplates.length} /><HeaderMetric label={t("Last tasks created", "משימות שנוצרו לאחרונה")} value={automations.reduce((sum, item) => sum + (item.lastResult?.createdTasks ?? 0), 0)} /></div>
    </section>

    <section><div className="mb-3"><h2 className="font-bold text-slate-900">{t("Ready-to-use templates", "תבניות מוכנות")}</h2><p className="mt-1 text-sm text-slate-500">{t("Activate a safe workflow in one click.", "מפעילים תהליך בטוח בלחיצה אחת.")}</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{automationTemplates.map((template) => { const installed = automations.some((item) => item.trigger === template.trigger && item.action === "CREATE_TASK"); return <article key={template.trigger} className="nexora-surface rounded-2xl p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Workflow size={18} /></span><h3 className="mt-4 font-bold text-slate-900">{automationName(template.trigger, locale)}</h3><p className="mt-2 min-h-16 text-sm leading-6 text-slate-500">{automationDescription(template.trigger, locale)}</p><button type="button" disabled={installed || busy !== null} onClick={() => void install(template)} className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${installed ? "text-emerald-600" : "text-blue-600 hover:text-blue-700"}`}>{installed ? <><CheckCircle2 size={16} />{t("Installed", "מותקנת")}</> : <><Plus size={16} />{busy === template.trigger ? t("Activating…", "מפעיל…") : t("Activate", "הפעלה")}</>}</button></article>; })}</div></section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">{t("Your workflows", "התהליכים שלך")}</h2><p className="mt-1 text-sm text-slate-500">{t("Every run is visible and can be paused instantly.", "כל הרצה גלויה וניתנת לעצירה מיידית.")}</p></div>{automations.length ? <div className="divide-y divide-slate-100">{automations.map((automation) => <div key={automation.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_180px_150px_auto] lg:items-center"><div className="flex min-w-0 gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${automation.enabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}><Zap size={18} /></span><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{automationName(automation.trigger, locale, automation.name)}</p><p className="mt-0.5 truncate text-sm text-slate-500">{automationDescription(automation.trigger, locale, automation.description)}</p></div></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("Last run", "הרצה אחרונה")}</p><p className="mt-1 text-xs font-medium text-slate-600">{automation.lastRun ? new Date(automation.lastRun).toLocaleString(locale === "he" ? "he-IL" : "en-US") : t("Not run yet", "טרם הופעלה")}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("Last result", "תוצאה אחרונה")}</p><p className="mt-1 text-xs font-medium text-slate-600">{t(`${automation.lastResult?.createdTasks ?? 0} tasks created`, `נוצרו ${automation.lastResult?.createdTasks ?? 0} משימות`)}</p></div><div className="flex items-center gap-2"><button type="button" aria-pressed={automation.enabled} aria-label={automation.enabled ? t("Pause automation", "השהיית אוטומציה") : t("Enable automation", "הפעלת אוטומציה")} disabled={busy !== null} onClick={async () => { setBusy(automation.id); try { await onUpdate(automation.id, { enabled: !automation.enabled }); toast.success(automation.enabled ? t("Automation paused", "האוטומציה הושהתה") : t("Automation enabled", "האוטומציה הופעלה")); } finally { setBusy(null); } }} className={`flex h-9 w-14 items-center rounded-full p-1 transition ${automation.enabled ? "justify-end bg-emerald-500" : "justify-start bg-slate-200"}`}><span className="h-7 w-7 rounded-full bg-white shadow-sm" /></button><button type="button" aria-label={t("Delete automation", "מחיקת אוטומציה")} onClick={() => { if (window.confirm(t("Delete this automation?", "למחוק את האוטומציה?"))) void onDelete(automation.id).then(() => toast.success(t("Automation deleted", "האוטומציה נמחקה"))); }} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div></div>)}</div> : <Empty text={t("No automations installed yet.", "עדיין לא הותקנו אוטומציות.")} />}</section>

    <section><div className="mb-3"><h2 className="font-bold text-slate-900">{t("Connected channels", "ערוצים מחוברים")}</h2><p className="mt-1 text-sm text-slate-500">{t("Messaging actions unlock only after a real provider is configured.", "פעולות הודעה ייפתחו רק לאחר חיבור ספק אמיתי.")}</p></div><div className="grid gap-3 sm:grid-cols-2"><LockedConnector icon={<MessageCircle size={19} />} title="WhatsApp Business" description={t("Send appointment reminders and payment follow-ups.", "שליחת תזכורות לפגישות ולתשלומים.")} /><LockedConnector icon={<Send size={19} />} title={t("Email & SMS", "אימייל ו־SMS")} description={t("Send approved templates and service updates.", "שליחת תבניות מאושרות ועדכוני שירות.")} /></div></section>
  </div>;
}

function LockedConnector({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  return <div className="flex gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">{icon}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-800">{title}</h3><span className="flex items-center gap-1 rounded-full bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600"><Lock size={11} />{t("Not connected", "לא מחובר")}</span></div><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>;
}

function automationName(trigger: string, locale: "en" | "he", fallback = "Automation") {
  const names: Record<string, [string, string]> = { INVOICE_OVERDUE: ["Overdue payment follow-up", "טיפול בתשלום באיחור"], CUSTOMER_LEAD: ["New lead follow-up", "חזרה לליד חדש"], TASK_CRITICAL: ["Critical task escalation", "הסלמת משימה קריטית"], INVOICE_DUE_SOON: ["Upcoming payment reminder", "תזכורת לתשלום קרוב"] };
  const value = names[trigger];
  return value ? value[locale === "he" ? 1 : 0] : fallback;
}

function automationDescription(trigger: string, locale: "en" | "he", fallback = "Automated business workflow") {
  const descriptions: Record<string, [string, string]> = { INVOICE_OVERDUE: ["Create a critical collection task when an invoice becomes overdue.", "יצירת משימת גבייה קריטית כאשר חשבונית עוברת את מועד התשלום."], CUSTOMER_LEAD: ["Create a follow-up task for every lead that needs attention.", "יצירת משימת המשך לכל ליד שממתין לטיפול."], TASK_CRITICAL: ["Escalate critical open work for management review.", "הסלמת עבודה קריטית פתוחה לבדיקת מנהל."], INVOICE_DUE_SOON: ["Create a reminder three days before a sent invoice is due.", "יצירת תזכורת שלושה ימים לפני מועד תשלום חשבונית."] };
  const value = descriptions[trigger];
  return value ? value[locale === "he" ? 1 : 0] : fallback;
}

function CalendarView({ tasks, invoices, expenses, customers }: {
  tasks: BusinessTask[];
  invoices: Invoice[];
  expenses: ReturnType<typeof useBusiness>["expenses"];
  customers: Customer[];
}) {
  const [month, setMonth] = useState(() => new Date());
  const customerNames = new Map(customers.map((item) => [item.id, item.name]));
  const events = [
    ...tasks.filter((item) => item.dueDate).map((item) => ({ id: `t-${item.id}`, date: item.dueDate, title: item.title, tone: "bg-blue-100 text-blue-700" })),
    ...invoices.filter((item) => item.dueDate).map((item) => ({ id: `i-${item.id}`, date: item.dueDate, title: `${item.documentNumber} · ${customerNames.get(item.customerId) ?? "Customer"}`, tone: item.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-violet-100 text-violet-700" })),
    ...expenses.filter((item) => item.date).map((item) => ({ id: `e-${item.id}`, date: item.date, title: item.supplier, tone: "bg-amber-100 text-amber-700" })),
  ];
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekday + days }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-bold text-slate-900">Business calendar</h2><p className="mt-1 text-sm text-slate-500">Tasks, invoice deadlines and expenses.</p></div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><ChevronLeft size={17} /></button>
          <p className="min-w-32 text-center text-sm font-semibold text-slate-800">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className="overflow-x-auto p-4"><div className="min-w-[720px]">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-2">{day}</div>)}</div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
          {cells.map((day, index) => {
            const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day ?? 0).padStart(2, "0")}`;
            const dayEvents = day ? events.filter((item) => item.date.slice(0, 10) === key) : [];
            return <div key={`${key}-${index}`} className="min-h-28 bg-white p-2">{day && <><span className="text-xs font-semibold text-slate-500">{day}</span><div className="mt-2 space-y-1">{dayEvents.slice(0, 3).map((event) => <div key={event.id} title={event.title} className={`truncate rounded-md px-1.5 py-1 text-[10px] font-semibold ${event.tone}`}>{event.title}</div>)}</div></>}</div>;
          })}
        </div>
      </div></div>
    </section>
  );
}

function Customer360({ customer, tasks, invoices, documents, onClose }: {
  customer: Customer;
  tasks: BusinessTask[];
  invoices: Invoice[];
  documents: BusinessDocument[];
  onClose: () => void;
}) {
  const outstanding = invoices.filter((item) => item.status !== "Paid").reduce((sum, item) => sum + item.total, 0);
  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/30 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-label={`${customer.name} customer overview`} className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">{customer.name.charAt(0)}</span>
            <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Customer 360°</p><h2 className="mt-1 text-2xl font-bold text-slate-950">{customer.name}</h2><p className="text-sm text-slate-500">{customer.company}</p></div>
          </div>
          <button type="button" aria-label="Close customer overview" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <MiniMetric label="Open tasks" value={tasks.filter((item) => item.status !== "Done").length} />
          <MiniMetric label="Invoices" value={invoices.length} />
          <MiniMetric label="Outstanding" value={formatCurrency(outstanding)} />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ContactRow icon={<Mail size={17} />} label="Email" value={customer.email || "Not provided"} />
          <ContactRow icon={<Phone size={17} />} label="Phone" value={customer.phone || "Not provided"} />
          <ContactRow icon={<Building2 size={17} />} label="Company" value={customer.company} />
          <ContactRow icon={<BriefcaseBusiness size={17} />} label="Status" value={`${customer.status} · ${customer.priority}`} />
        </div>
        <RelatedList title="Tasks" empty="No customer tasks" items={tasks.map((item) => ({ id: item.id, title: item.title, detail: `${item.status} · ${item.dueDate}` }))} />
        <RelatedList title="Invoices" empty="No customer invoices" items={invoices.map((item) => ({ id: item.id, title: item.documentNumber, detail: `${item.status} · ${formatCurrency(item.total)}` }))} />
        <RelatedList title="Documents" empty="No customer documents" items={documents.map((item) => ({ id: item.id, title: item.name, detail: item.type }))} />
        {customer.notes && <div className="mt-6 rounded-2xl bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Notes</p><p className="mt-2 text-sm leading-6 text-slate-700">{customer.notes}</p></div>}
      </aside>
    </div>
  );
}

function DocumentDialog({ customers, onCreate, onClose }: {
  customers: Customer[];
  onCreate: (data: Partial<BusinessDocument>) => Promise<BusinessDocument>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<BusinessDocument["type"]>("Contract");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return toast.error("Enter a document name");
    if (file && file.size > 5_000_000) return toast.error("File must be smaller than 5 MB");
    setSaving(true);
    try {
      const fileUrl = file ? await readFile(file) : undefined;
      await onCreate({ name, type, customerId: customerId || undefined, fileName: file?.name, fileUrl });
      toast.success("Document uploaded");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
    <div role="dialog" aria-modal="true" aria-labelledby="document-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-blue-600">Document center</p><h2 id="document-title" className="mt-1 text-xl font-bold text-slate-950">Upload document</h2></div><button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></button></div>
      <div className="mt-6 space-y-4">
        <Field label="Document name" value={name} onChange={setName} />
        <label className="block text-sm font-medium text-slate-700">Type<select value={type} onChange={(event) => setType(event.target.value as BusinessDocument["type"])} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3">{["Invoice", "Receipt", "Quotation", "Contract", "Expense", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block text-sm font-medium text-slate-700">Customer<select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"><option value="">General</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-5 text-center text-sm text-slate-500 hover:border-blue-300"><FolderOpen className="mx-auto mb-2 text-blue-500" size={24} />{file?.name ?? "Choose a file (up to 5 MB)"}<input type="file" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
      </div>
      <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Uploading…" : "Upload"}</button></div>
    </div>
  </div>;
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex gap-3 rounded-xl border border-slate-200 p-3"><span className="text-blue-600">{icon}</span><div className="min-w-0"><p className="text-xs text-slate-400">{label}</p><p className="truncate text-sm font-medium text-slate-700">{value}</p></div></div>;
}

function RelatedList({ title, items, empty }: { title: string; items: { id: string; title: string; detail: string }[]; empty: string }) {
  return <section className="mt-7"><h3 className="font-semibold text-slate-900">{title}</h3><div className="mt-3 overflow-hidden rounded-xl border border-slate-200">{items.length ? items.map((item) => <div key={item.id} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"><span className="text-sm font-medium text-slate-800">{item.title}</span><span className="text-xs text-slate-500">{item.detail}</span></div>) : <p className="p-4 text-sm text-slate-400">{empty}</p>}</div></section>;
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

function CreateDialog({
  type,
  customers,
  employees,
  onClose,
  onCreateCustomer,
  onCreateTask,
  onCreateInvoice,
  onCreateExpense,
}: {
  type: CreateType;
  customers: Customer[];
  employees: ReturnType<typeof useBusiness>["employees"];
  onClose: () => void;
  onCreateCustomer: ReturnType<typeof useBusiness>["createCustomer"];
  onCreateTask: ReturnType<typeof useBusiness>["createTask"];
  onCreateInvoice: ReturnType<typeof useBusiness>["createInvoice"];
  onCreateExpense: ReturnType<typeof useBusiness>["createExpense"];
}) {
  const [name, setName] = useState("");
  const [secondary, setSecondary] = useState("");
  const [amount, setAmount] = useState("");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) {
      toast.error("Please enter a name or title");
      return;
    }

    try {
      setSaving(true);

      if (type === "customer") {
        await onCreateCustomer({
          name,
          company: secondary || name,
          email: "",
          phone: "",
          status: "Active",
          priority: "Medium",
          balance: 0,
          notes: "",
        });
      } else if (type === "task") {
        await onCreateTask({
          title: name,
          description: secondary,
          customerId: customerId || undefined,
          assigneeId: employees[0]?.id,
          status: "Open",
          urgency: 7,
          businessValue: 7,
          risk: 5,
          customerImportance: 7,
          dueDate: new Date().toISOString().slice(0, 10),
        });
      } else if (type === "invoice") {
        const invoiceAmount = Number(amount);
        await onCreateInvoice({
          type: "Invoice",
          customerId,
          status: "Draft",
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
          items: [{ description: name, quantity: 1, unitPrice: invoiceAmount }],
        });
      } else {
        const baseAmount = Number(amount);
        const vat = baseAmount * 0.18;
        await onCreateExpense({
          supplier: name,
          description: secondary,
          category: "General",
          amount: baseAmount,
          vat,
          total: baseAmount + vat,
          date: new Date().toISOString().slice(0, 10),
          status: "Pending",
        });
      }

      toast.success(`${capitalize(type)} created`);
      onClose();
    } catch (caughtError) {
      toast.error(
        caughtError instanceof Error ? caughtError.message : "Unable to save"
      );
    } finally {
      setSaving(false);
    }
  }

  const needsCustomer = type === "task" || type === "invoice";
  const needsAmount = type === "invoice" || type === "expense";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="create-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Business OS</p>
            <h2 id="create-title" className="mt-1 text-xl font-bold capitalize text-slate-950">
              New {type}
            </h2>
          </div>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={19} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <Field
            label={type === "task" ? "Title" : type === "invoice" ? "Description" : type === "expense" ? "Supplier" : "Customer name"}
            value={name}
            onChange={setName}
          />
          {(type === "customer" || type === "task" || type === "expense") && (
            <Field
              label={type === "customer" ? "Company" : "Description"}
              value={secondary}
              onChange={setSecondary}
            />
          )}
          {needsCustomer && (
            <label className="block text-sm font-medium text-slate-700">
              Customer
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3">
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>
          )}
          {needsAmount && (
            <Field label="Amount before VAT" value={amount} onChange={setAmount} type="number" />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving…" : `Create ${type}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function DataSection({ title, count, search, onSearch, onCreate, createLabel, children }: {
  title: string;
  count: number;
  search: string;
  onSearch: (value: string) => void;
  onCreate: () => void;
  createLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{count} records</p>
        </div>
        <div className="flex gap-2">
          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <span className="sr-only">Search {title}</span>
            <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search…" className="min-w-0 bg-transparent text-sm outline-none" />
          </label>
          <button type="button" onClick={onCreate} className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus size={16} /> <span className="hidden sm:inline">{createLabel}</span>
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

function FinancePanel({ title, onCreate, children }: { title: string; onCreate: () => void; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">{title}</h2>
        <button type="button" onClick={onCreate} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
          <Plus size={16} /> New
        </button>
      </div>
      {children}
    </section>
  );
}

function DeleteButton({ label, onDelete }: { label: string; onDelete: () => Promise<void> }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        if (window.confirm("Delete this record? This cannot be undone.")) {
          void onDelete();
        }
      }}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 size={17} />
    </button>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-blue-400" />
    </label>
  );
}

function SummaryCard({ icon, title, value, note, tone }: { icon: React.ReactNode; title: string; value: string | number; note: string; tone: "blue" | "amber" | "emerald" | "violet" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="nexora-surface nexora-lift rounded-2xl p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function ActionCard({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="nexora-surface nexora-lift group rounded-2xl p-5 text-left">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-blue-600 transition group-hover:translate-x-0.5">{action} →</span>
    </button>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="px-5 py-10 text-center text-sm text-slate-500">{text}</div>;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
