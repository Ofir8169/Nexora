import {
  AlertTriangle,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

interface BusinessStateProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}

export default function BusinessState({
  loading,
  error,
  onRetry,
  children,
}: BusinessStateProps) {
  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-8">
          <LoaderCircle className="h-9 w-9 animate-spin text-cyan-400" />

          <div className="text-center">
            <p className="font-black text-white">
              Loading Business OS
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Connecting to the local Nexora server
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="max-w-xl rounded-3xl border border-red-400/20 bg-red-500/10 p-8">
          <AlertTriangle className="h-10 w-10 text-red-300" />

          <h2 className="mt-5 text-xl font-black text-white">
            Business server is unavailable
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            {error}
          </p>

          <p className="mt-3 text-sm text-slate-400">
            Make sure the backend is running on port 4000.
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-100"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}