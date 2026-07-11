import type { FormEvent } from "react";
import { AlertCircle, Github, RefreshCw } from "lucide-react";

type UsernameFormProps = {
  error: string;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setUsername: (username: string) => void;
  username: string;
};

export function UsernameForm({
  error,
  loading,
  onSubmit,
  setUsername,
  username,
}: UsernameFormProps) {
  return (
    <div className="mx-auto mb-16 max-w-[500px]">
      <form
        onSubmit={onSubmit}
        className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-2 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <div className="pl-3 text-slate-500">
            <Github className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter GitHub Username..."
            className="w-full border-0 bg-transparent py-2.5 font-sans text-base text-slate-100 outline-0 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-lg transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/10 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Generate"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-rose-400">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
