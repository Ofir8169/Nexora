import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  SendHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";

import { useApp } from "../../context/app-context";
import { useBusiness } from "../../business/context/business-context";
import { askOpsAI, type AIResult } from "./OpsAI";
import { getAuthHeaders } from "../../lib/auth";
import { getLocale, localized } from "../../lib/preferences";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

export default function AICopilot() {
  const location = useLocation();
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const suggestions = locale === "he"
    ? ["סכם את היום", "מה דורש טיפול?", "צור משימת גבייה", "נסח הודעה ללקוח", "צור משימת תחזוקה"]
    : ["Summarize today", "What needs attention?", "Create collection task", "Draft message to customer", "Create maintenance task"];
  const data = useApp();
  const business = useBusiness();
  const { addTask } = data;
  const [question, setQuestion] = useState(() => {
    const prompt = (location.state as { prompt?: unknown } | null)?.prompt;
    return typeof prompt === "string" ? prompt : "";
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: t("Hi, I’m Nexora AI. I can summarize operations, identify priorities and prepare maintenance tasks for your approval.", "היי, אני Nexora AI. אני יכול לסכם את הפעילות, לזהות עדיפויות ולהכין משימות לאישור שלך."),
    },
  ]);
  const [pendingAction, setPendingAction] = useState<AIResult["action"] | null>(
    null
  );
  const [thinking, setThinking] = useState(false);

  async function ask(customQuestion?: string) {
    const text = (customQuestion ?? question).trim();
    if (!text) return;

    const aiData = {
      ...data,
      business: {
        customers: business.customers,
        invoices: business.invoices,
        expenses: business.expenses,
        tasks: business.tasks,
      },
    };
    const localResult = askOpsAI(text, aiData);
    let answer = localResult.answer;

    try {
      setThinking(true);
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          question: text,
          context: {
            operations: {
              tasks: data.tasks.length,
              openTasks: data.tasks.filter((item) => item.status !== "Done").length,
              criticalVehicles: data.fleet.filter((item) => item.status === "Critical").length,
              availableEmployees: data.employees.filter((item) => item.status === "Available").length,
              highRiskSites: data.sites.filter((item) => item.risk >= 70).length,
            },
            business: business.dashboard,
          },
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { answer: string };
        answer = payload.answer;
      }
    } catch {
      // The deterministic local response remains available offline.
    } finally {
      setThinking(false);
    }
    setMessages((current) => {
      const nextId = current.length + 1;

      return [
        ...current,
        { id: nextId, role: "user", text },
        { id: nextId + 1, role: "assistant", text: answer },
      ];
    });
    setPendingAction(localResult.action ?? null);
    setQuestion("");
  }

  async function approveAction() {
    if (!pendingAction) return;

    if (pendingAction.type === "create_business_task") {
      await business.createTask({
        title: pendingAction.title,
        description: pendingAction.description,
        customerId: pendingAction.customerId,
        status: "Open",
        urgency: 9,
        businessValue: 8,
        risk: 8,
        customerImportance: 8,
        dueDate: new Date().toISOString().slice(0, 10),
      });
    } else {
      addTask({
        id: Math.max(0, ...data.tasks.map((task) => task.id)) + 1,
        title: pendingAction.title,
        site: pendingAction.site,
        owner: pendingAction.owner,
        priority: "High",
        status: "Open",
        due: "Today",
        description: pendingAction.description,
        checklist: [],
      });
    }
    setMessages((current) => [
      ...current,
      {
        id: current.length + 1,
        role: "assistant",
        text: t(`Task created successfully: ${pendingAction.title}`, `המשימה נוצרה בהצלחה: ${pendingAction.title}`),
      },
    ]);
    setPendingAction(null);
  }

  return (
    <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Bot size={21} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-950">Nexora AI</h1>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {t("Ready", "מוכן")}
            </span>
          </div>
          <p className="text-sm text-slate-500">{t("Operational assistant", "עוזר תפעולי ועסקי")}</p>
        </div>
      </header>

      <div
        aria-live="polite"
        className="max-h-[480px] min-h-[300px] space-y-4 overflow-y-auto bg-slate-50/60 px-5 py-6 sm:px-6"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Sparkles size={15} />
              </span>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "rounded-br-md bg-blue-600 text-white"
                  : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {message.text}
            </div>
            {message.role === "user" && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                <UserRound size={15} />
              </span>
            )}
          </div>
        ))}

        {pendingAction && (
          <div className="ml-11 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">
              {t("Suggested action", "פעולה מוצעת")}
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              {t("Create", "יצירת")} “{pendingAction.title}”{pendingAction.type === "create_task" ? t(` for ${pendingAction.owner}`, ` עבור ${pendingAction.owner}`) : t(" in Business OS", " במרחב העסקי")}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void approveAction()} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                <CheckCircle2 size={16} /> {t("Approve and create", "אישור ויצירה")}
              </button>
              <button type="button" onClick={() => setPendingAction(null)} className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3.5 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100">
                <X size={16} /> {t("Dismiss", "ביטול")}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4 sm:p-5">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => void ask(suggestion)}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
          <label htmlFor="ai-question" className="sr-only">
            {t("Ask Nexora AI", "שאל את Nexora AI")}
          </label>
          <input
            id="ai-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void ask();
            }}
            placeholder={t("Ask about tasks, fleet, people or risk…", "אפשר לשאול על משימות, צי, עובדים, לקוחות או סיכונים...")}
            className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-900 outline-none"
          />
          <button
            type="button"
            aria-label={t("Send message", "שליחת הודעה")}
            disabled={!question.trim() || thinking}
            onClick={() => void ask()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {thinking ? <Sparkles className="animate-pulse" size={18} /> : <SendHorizontal size={18} />}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          {t("Actions require your approval before they change operational data.", "כל פעולה שמשנה נתונים מחייבת אישור שלך.")}
        </p>
      </div>
    </section>
  );
}
