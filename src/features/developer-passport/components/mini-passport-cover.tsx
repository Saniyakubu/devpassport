import { Github } from "lucide-react";

type MiniPassportCoverProps = {
  color: string;
  title: string;
  tilt: string;
};

export function MiniPassportCover({ color, title, tilt }: MiniPassportCoverProps) {
  return (
    <div
      className={`flex flex-col items-center ${tilt} cursor-default select-none transition-transform duration-500 hover:z-20 hover:-translate-y-2 hover:scale-110`}
    >
      <div
        className="relative flex h-[160px] w-[110px] flex-col items-center rounded-l-sm rounded-r-xl border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
        style={{ backgroundColor: color }}
      >
        <div className="absolute bottom-0 left-0 top-0 z-10 w-2.5 rounded-l-sm bg-gradient-to-r from-black/60 via-transparent to-black/20" />
        <div className="z-0 flex h-full w-full flex-col items-center justify-between px-2 py-4">
          <h2 className="text-center font-sans text-[9px] font-medium uppercase leading-tight tracking-[0.1em] text-[#e2c179]">
            DEVELOPER
            <br />
            PASSPORT
          </h2>
          <div className="my-auto flex h-10 w-10 items-center justify-center text-[#e2c179]">
            <Github className="h-8 w-8" strokeWidth={1} />
          </div>
          <div className="mb-1 flex h-3 w-5 flex-col items-center justify-center">
            <svg viewBox="0 0 40 30" className="h-full w-full fill-current text-[#e2c179]">
              <rect x="0" y="10" width="40" height="12" />
              <circle cx="20" cy="16" r="6" fill={color} stroke="currentColor" strokeWidth="2" />
              <rect x="15" y="0" width="10" height="10" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-900/90 px-3 py-1.5 text-center shadow-xl backdrop-blur">
        <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">
          {title}
        </p>
      </div>
    </div>
  );
}
