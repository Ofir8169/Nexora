import { AlertTriangle, RefreshCw } from "lucide-react";
import WorkspaceSkeleton from "../../components/ui-v2/WorkspaceSkeleton";

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
    return <WorkspaceSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div role="alert" className="nexora-surface max-w-xl rounded-3xl p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle size={22} /></span>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Business server is unavailable
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            {error}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Restart the workspace with npm run dev and try again.
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
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
