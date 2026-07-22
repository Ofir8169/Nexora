import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";

type State = { error: Error | null };

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Nexora render error", error, info.componentStack);
    void fetch("/api/diagnostics/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        path: window.location.pathname,
      }),
    }).catch(() => undefined);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><AlertTriangle size={26} /></span>
          <p className="mt-5 text-sm font-semibold text-blue-600">Nexora recovery</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">The workspace could not finish loading</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Your server data is safe. Reload the interface or reset only local display preferences.</p>
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-left text-xs text-slate-500">{this.state.error.message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"><RefreshCw size={16} /> Reload Nexora</button>
            <button type="button" onClick={() => { localStorage.removeItem("nexora_dashboard_widgets"); localStorage.removeItem("nexora_read_alerts"); window.location.reload(); }} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"><RotateCcw size={16} /> Reset display</button>
          </div>
        </section>
      </main>
    );
  }
}
