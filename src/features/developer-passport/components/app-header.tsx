import { Github, Shield, Star } from "lucide-react";

export function AppHeader() {
  return (
    <header className="mb-10 flex flex-col items-center justify-between gap-4 border-b border-slate-800/40 pb-6 sm:flex-row">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-lg shadow-amber-500/10">
          <Shield className="h-5 w-5 text-slate-950" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold uppercase leading-none tracking-wide text-amber-100">
            devpassport
          </h1>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-slate-500">
            GitHub Identity Visualizer
          </span>
        </div>
      </div>

      <a
        href="https://github.com/Saniyakubu/devpassport"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
      >
        <Github className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Star on GitHub
        </span>
        <Star className="h-3.5 w-3.5 text-amber-500" />
      </a>
    </header>
  );
}
