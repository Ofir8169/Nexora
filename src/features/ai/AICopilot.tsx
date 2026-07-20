import { useState } from "react";
import { Bot, SendHorizontal, Sparkles, CheckCircle2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { askOpsAI, type AIResult } from "./OpsAI";

export default function AICopilot() {
  const data = useApp();
  const { addTask } = data;

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Hello, I'm Nexora AI. Ask me anything about your operation."
  );
  const [pendingAction, setPendingAction] = useState<AIResult["action"] | null>(
    null
  );

  function ask(customQuestion?: string) {
    const text = customQuestion || question;
    if (!text.trim()) return;

    const result = askOpsAI(text, data);

    setAnswer(result.answer);
    setPendingAction(result.action || null);
    setQuestion("");
  }

  function approveAction() {
    if (!pendingAction) return;

    if (pendingAction.type === "create_task") {
      addTask({
        id: Date.now(),
        title: pendingAction.title,
        site: pendingAction.site,
        owner: pendingAction.owner,
        priority: "High",
        status: "Open",
        due: "Today",
        description: pendingAction.description,
        checklist: [],
      });

      setAnswer(`Done. Created task: ${pendingAction.title}`);
      setPendingAction(null);
    }
  }

  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-6 text-white shadow-2xl shadow-cyan-500/10">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20">
          <Bot className="text-cyan-300" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Nexora AI</h2>
          <p className="text-sm text-slate-400">Operational Copilot</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-slate-950 p-4">
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <Sparkles size={16} />
          AI Response
        </div>

        <p className="text-sm leading-7 text-slate-300">{answer}</p>
      </div>

      {pendingAction && (
        <div className="mt-4 rounded-2xl border border-green-400/20 bg-green-500/10 p-4">
          <p className="text-sm font-black text-green-300">
            Suggested Action
          </p>

          <p className="mt-2 text-sm text-slate-300">
            Create task: <strong>{pendingAction.title}</strong>
          </p>

          <button
            onClick={approveAction}
            className="mt-4 flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white"
          >
            <CheckCircle2 size={16} />
            Approve Action
          </button>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask Nexora..."
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />

        <button
          onClick={() => ask()}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white"
        >
          <SendHorizontal />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          "Critical vehicles",
          "Open tasks",
          "Available employees",
          "High risk sites",
          "Create maintenance task",
        ].map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}