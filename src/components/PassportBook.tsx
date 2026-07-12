"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Globe, Shield, Star, Award, Calendar, Clock, 
  Code, Users, CheckCircle, ChevronLeft, ChevronRight,
  GitFork, Activity, ShieldCheck, MapPin, Github
} from "lucide-react";

import { playPageFlipSound } from "@/features/developer-passport/utils/page-flip-sound";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] flex items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif tracking-wide text-lg text-amber-500/80">Opening Passport...</p>
      </div>
    </div>
  )
});

function MiniQr() {
  const cells = Array.from({ length: 121 }, (_, i) => {
    const row = Math.floor(i / 11);
    const col = i % 11;
    const isFinder = (row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3);
    if (isFinder) return !((row === 1 && col === 1) || (row === 1 && col === 9) || (row === 9 && col === 1));
    return Math.random() > 0.5;
  });

  return (
    <div className="grid grid-cols-11 gap-[1.5px] p-1.5 bg-amber-50/50 rounded border border-amber-900/10">
      {cells.map((active, idx) => (
        <span key={idx} className={`w-[5px] h-[5px] ${active ? "bg-slate-900" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

function VisaStamp({ label, date, color, type }: { label: string, date: string, color: string, type: 'circle' | 'rect' | 'hex' }) {
  const getStyle = () => {
    switch (color) {
      case 'red': return 'border-red-600 text-red-600';
      case 'blue': return 'border-blue-600 text-blue-600';
      case 'green': return 'border-green-600 text-green-600';
      case 'purple': return 'border-purple-600 text-purple-600';
      case 'amber': return 'border-amber-600 text-amber-600';
      default: return 'border-slate-600 text-slate-600';
    }
  };

  const getShape = () => {
    if (type === 'circle') return `rounded-full border-[2px] w-16 h-16 flex flex-col items-center justify-center p-1`;
    if (type === 'rect') return `rounded border-[2px] px-3 py-1.5 flex flex-col items-center justify-center`;
    return `rounded-xl border-[2px] px-3 py-2 flex flex-col items-center justify-center`; // hex approx
  };

  const rot = Math.floor(Math.random() * 40) - 20;

  return (
    <div 
      className={`relative inline-flex opacity-80 mix-blend-multiply ${getStyle()} ${getShape()}`}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <div className={`absolute inset-[2px] border border-dashed ${getStyle()} rounded-inherit opacity-40 pointer-events-none`} />
      <span className="font-serif font-black text-[9px] uppercase leading-tight text-center tracking-tighter">
        {label}
      </span>
      <span className="font-mono text-[6px] font-bold mt-1 opacity-70">
        {date}
      </span>
    </div>
  );
}

const GuillocheBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center mix-blend-multiply opacity-50">
    <div className="w-full h-full absolute" style={{
      background: 'radial-gradient(circle at 50% 50%, #f9ebf5 0%, #e1e9f4 50%, #d0d6e2 100%)'
    }} />
    <svg viewBox="0 0 400 600" className="absolute w-full h-full opacity-60">
       <g stroke="#91a1c1" strokeWidth="0.5" fill="none">
          {Array.from({length: 36}).map((_, i) => (
             <ellipse key={`e1-${i}`} cx="200" cy="200" rx="160" ry="40" transform={`rotate(${i * 10} 200 200)`} />
          ))}
       </g>
       <g stroke="#cf9fb7" strokeWidth="0.5" fill="none">
          {Array.from({length: 72}).map((_, i) => (
             <circle key={`c1-${i}`} cx={200 + Math.cos(i * 5 * Math.PI / 180) * 120} cy={450 + Math.sin(i * 5 * Math.PI / 180) * 120} r="70" />
          ))}
       </g>
       <g stroke="#91a1c1" strokeWidth="0.5" fill="none">
          {Array.from({length: 24}).map((_, i) => (
             <ellipse key={`e2-${i}`} cx="200" cy="450" rx="90" ry="20" transform={`rotate(${i * 15} 200 450)`} />
          ))}
       </g>
    </svg>
    <div className="absolute inset-0" style={{
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(145, 161, 193, 0.15) 3px, rgba(145, 161, 193, 0.15) 4px)'
    }} />
  </div>
);

const PageHeader = ({ num, title, right = false }: { num: string, title: string, right?: boolean }) => (
  <div className={`flex justify-between items-center border-b border-amber-900/15 pb-1.5 mb-4 ${right ? 'flex-row-reverse' : ''}`}>
    <span className="text-[9px] font-sans tracking-widest text-amber-900/60 font-black">PAGE {num}</span>
    <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-amber-900/80">{title}</span>
  </div>
);

const FlipWrapper = ({ 
  children, exportMode, isMobile, currentPage, setCurrentPage, playPageFlipSound, flipBookRef 
}: any) => {
  if (exportMode) {
    const pages = React.Children.toArray(children);
    const spreads = [];
    for(let i=0; i<pages.length; i+=2) {
       spreads.push(
          <div key={i} className="passport-export-spread flex w-[800px] h-[520px] bg-[#eef1f6]">
             <div className="w-[400px] h-[520px]">{pages[i]}</div>
             <div className="w-[400px] h-[520px]">{pages[i+1]}</div>
          </div>
       );
    }
    return (
      <div id="passport-export-container" className="absolute opacity-0 pointer-events-none -left-[9999px]">
        {spreads}
      </div>
    );
  }
  return (
    <HTMLFlipBook
      width={400} height={520} size="stretch"
      minWidth={360} maxWidth={400} minHeight={480} maxHeight={520}
      showCover={false} useMouseEvents={!isMobile}
      startPage={currentPage}
      onFlip={(e: any) => { setCurrentPage(e.data); playPageFlipSound(); }}
      ref={flipBookRef}
      className="w-full h-full rounded-md overflow-hidden"
    >
      {children}
    </HTMLFlipBook>
  );
};

export default function PassportBook({ data, currentPage, setCurrentPage, exportMode = false }: any) {
  const flipBookRef = useRef<any>(null);
  const [coverState, setCoverState] = useState<'front' | 'open' | 'back'>('front');
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (flipBookRef.current && coverState === 'open') {
      const bookInstance = flipBookRef.current.pageFlip();
      if (bookInstance && bookInstance.getCurrentPageIndex() !== currentPage) {
        bookInstance.turnToPage(currentPage);
      }
    }
  }, [currentPage, coverState]);

  const handleOpenCover = () => {
    setCoverState('open');
    setCurrentPage(0);
    playPageFlipSound();
  };

  const handleCloseCover = () => {
    setCoverState('front');
    setCurrentPage(0);
    playPageFlipSound();
  };

  const isHighLevel = data.level.xp >= 5000 || Math.floor(data.level.xp / 100) >= 50;
  const coverColor = isHighLevel ? "#6B1D25" : "#061A3A";
  const passportNo = `DP-${String(data.user.id).slice(0, 4)}-${data.user.login.toUpperCase().slice(0, 4)}`;

  if (coverState === 'front' && !exportMode) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[580px] w-full py-8 select-none">
        
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-amber-500/80 z-20 pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest font-bold font-sans bg-slate-900/90 px-3 py-1.5 rounded-full border border-amber-500/30 shadow-xl backdrop-blur-sm">Click to open passport</span>
          <div className="w-px h-8 bg-gradient-to-b from-amber-500/50 to-transparent mt-1" />
        </div>

        <button
          onClick={handleOpenCover}
          className="group relative flex flex-col items-center w-[350px] h-[500px] rounded-r-3xl rounded-l-md cursor-pointer text-[#e2c179] transition-all duration-700 text-center animate-[passport-hint_4s_ease-in-out_infinite]"
          style={{ 
            perspective: "1500px",
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
            backgroundColor: coverColor,
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes passport-hint {
              0%, 100% { transform: rotateY(0deg) scale(1); box-shadow: 0 25px 60px rgba(0,0,0,0.6); }
              5% { transform: rotateY(-12deg) scale(1.02); box-shadow: 20px 35px 80px rgba(0,0,0,0.7); }
              15% { transform: rotateY(0deg) scale(1); box-shadow: 0 25px 60px rgba(0,0,0,0.6); }
            }
            .group:hover { animation: none; transform: translateY(-16px); box-shadow: 0 45px 120px rgba(0,0,0,0.7); }
          `}} />
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/50 via-transparent to-black/20 z-10 rounded-l-md" />

          <div className="flex flex-col items-center justify-between h-full w-full py-16 px-10 z-0">
            <h2 className="text-[2rem] font-sans tracking-[0.12em] text-[#e2c179] font-medium uppercase mt-2 leading-tight">
              DEVELOPER<br/>PASSPORT
            </h2>
            
            <div className="w-40 h-40 flex items-center justify-center relative my-auto">
               <Github className="w-32 h-32 text-[#e2c179]" strokeWidth={1} />
            </div>

            <div className="mb-2 w-11 h-7 flex flex-col items-center justify-center relative">
               <svg viewBox="0 0 40 30" className="w-full h-full text-[#e2c179] fill-current">
                  <rect x="0" y="10" width="40" height="12" />
                  <circle cx="20" cy="16" r="6" fill={coverColor} stroke="currentColor" strokeWidth="2" />
                  <rect x="15" y="0" width="10" height="10" />
               </svg>
            </div>
          </div>
        </button>
      </div>
    );
  }

  if (coverState === 'back' && !exportMode) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[580px] w-full py-8 select-none">
        <button
          onClick={() => { setCoverState('open'); setCurrentPage(10); playPageFlipSound(); }}
          className="group relative flex flex-col items-center w-[350px] h-[500px] rounded-l-3xl rounded-r-md cursor-pointer text-[#e2c179] transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_45px_120px_rgba(0,0,0,0.7)] text-center shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
          style={{ 
            perspective: "1500px",
            backgroundColor: coverColor,
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/50 via-transparent to-black/20 z-10 rounded-r-md" />

          <div className="flex flex-col items-center justify-center h-full w-full py-16 px-10 z-0 opacity-70">
            <Github className="w-16 h-16 text-[#e2c179]" strokeWidth={1.5} />
            <div className="mt-8 text-[10px] font-sans tracking-[0.2em] text-[#e2c179] font-medium uppercase">
              Open Source Community
            </div>
          </div>
        </button>
      </div>
    );
  }



  return (
    <div className={`flex flex-col items-center w-full select-none ${exportMode ? 'h-fit' : ''}`}>
      {!exportMode && (
        <div className="flex items-center justify-center w-full max-w-[800px] mb-4 px-2">
          <button
            onClick={handleCloseCover}
            className="px-4 py-2 text-xs font-bold font-sans uppercase tracking-wider text-amber-600 border border-amber-500/20 bg-amber-950/10 hover:bg-amber-500/10 rounded-full transition"
          >
            Close Passport
          </button>
        </div>
      )}

      <div 
        className={`relative flex items-center justify-center ${exportMode ? 'w-[800px]' : 'w-full max-w-[840px]'}`}
        onTouchStart={(e) => setTouchStartPos({ x: e.changedTouches[0].screenX, y: e.changedTouches[0].screenY })}
        onTouchEnd={(e) => {
          if (!isMobile || exportMode) return;
          const dx = touchStartPos.x - e.changedTouches[0].screenX;
          const dy = Math.abs(touchStartPos.y - e.changedTouches[0].screenY);
          if (Math.abs(dx) > 40 && dy < 60) {
            if (dx > 0) {
              if (currentPage >= 10) { setCoverState('back'); playPageFlipSound(); }
              else flipBookRef.current?.pageFlip().flipNext();
            } else {
              if (currentPage === 0) { setCoverState('front'); playPageFlipSound(); }
              else flipBookRef.current?.pageFlip().flipPrev();
            }
          }
        }}
      >
        {!exportMode && (
          <>
            <button onClick={() => {
              if (currentPage === 0) {
                setCoverState('front');
                playPageFlipSound();
              } else {
                flipBookRef.current?.pageFlip().flipPrev();
              }
            }} className="absolute -left-12 p-3 text-slate-400 hover:text-amber-500 z-20">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={() => {
              if (currentPage >= 10) {
                setCoverState('back');
                playPageFlipSound();
              } else {
                flipBookRef.current?.pageFlip().flipNext();
              }
            }} className="absolute -right-12 p-3 text-slate-400 hover:text-amber-500 z-20">
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        <div className={`relative overflow-visible rounded-md bg-[#eef1f6] ${exportMode ? 'w-[800px] h-fit' : 'w-[800px] h-[520px] shadow-[0_30px_90px_rgba(0,0,0,0.6)]'}`}>
          {!exportMode && (
            <>
              <div className="absolute left-[50%] top-0 bottom-0 w-[4px] -translate-x-[50%] bg-slate-500/30 shadow-[0_0_15px_3px_rgba(0,0,0,0.25)] z-30 pointer-events-none" />
              <div className="absolute left-[50%] top-0 bottom-0 w-[1px] -translate-x-[50%] bg-slate-400/80 z-30 pointer-events-none" />
            </>
          )}

          <FlipWrapper 
            exportMode={exportMode} 
            isMobile={isMobile} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            playPageFlipSound={playPageFlipSound} 
            flipBookRef={flipBookRef}
          >
            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden flex flex-col">
              <GuillocheBg />
              
              <div className="flex h-full relative z-10 p-5 pl-[3rem]">
                 <div className="absolute left-2 top-0 bottom-0 w-8 flex items-center justify-center">
                    <div className="transform -rotate-90 whitespace-nowrap text-[22px] font-sans tracking-[0.2em] text-slate-600 font-normal mix-blend-multiply opacity-70">
                       AC {data.user.id.toString().padStart(10, '0')}
                    </div>
                 </div>

                 <div className="flex flex-col w-full h-full justify-between pt-1">
                   <div className="flex flex-col items-center w-full border-b-[1.5px] border-slate-400 pb-1.5 mb-2">
                     <h2 className="text-[20px] font-sans tracking-tighter text-slate-700 font-bold transform scale-y-[1.15]">DEVELOPER PASSPORT</h2>
                     <div className="flex justify-between w-full text-[7px] font-bold text-slate-500 px-4 mt-2">
                        <div className="flex flex-col items-center gap-0.5"><span>TYPE</span><span className="text-[10px] text-slate-800 font-serif">P</span></div>
                        <div className="flex flex-col items-center gap-0.5"><span>COUNTRY CODE</span><span className="text-[10px] text-slate-800 font-serif">{data.user.location ? data.user.location.slice(0,3).toUpperCase() : 'DEV'}</span></div>
                        <div className="flex flex-col items-center gap-0.5"><span>PASSPORT NO.</span><span className="text-[10px] text-slate-800 font-serif">AC{data.user.id.toString().slice(0,8)}</span></div>
                     </div>
                   </div>

                   <div className="flex gap-4 items-stretch flex-1">
                     <div className="w-[32%] flex flex-col items-center gap-2 relative mt-1">
                        <div className="w-full aspect-[3/4] bg-white p-1 shadow-sm border border-slate-200">
                          <img src={data.user.avatarUrl} alt="" className="w-full h-full object-cover grayscale opacity-90 brightness-110" />
                        </div>
                     </div>
                     <div className="w-[68%] grid grid-cols-2 gap-x-2 gap-y-1 text-[7px] uppercase tracking-wider text-slate-600 font-bold mt-1">
                        <div className="col-span-2">
                           <div>Surname</div>
                           <div className="text-[10px] font-serif text-slate-900 tracking-tight">{data.user.login}</div>
                        </div>
                        <div className="col-span-2">
                           <div>Given Names</div>
                           <div className="text-[10px] font-serif text-slate-900 tracking-tight">{data.user.name || data.user.login}</div>
                        </div>
                        <div className="col-span-2">
                           <div>Nationality</div>
                           <div className="text-[10px] font-serif text-slate-900 tracking-tight">{data.user.location || 'GLOBAL CITIZEN'}</div>
                        </div>
                        <div>
                           <div>Date of Birth</div>
                           <div className="text-[10px] font-serif text-slate-900 tracking-tight">{new Date(data.user.createdAt).toLocaleDateString("en", { month: "2-digit", day: "2-digit", year: "numeric" })}</div>
                        </div>
                        <div>
                           <div>Sex</div>
                           <div className="text-[10px] font-serif text-slate-900 tracking-tight">M/F/X</div>
                        </div>
                        <div className="col-span-2">
                           <div>Place of Birth</div>
                           <div className="text-[10px] font-serif text-slate-900 tracking-tight">GITHUB.COM</div>
                        </div>
                        <div>
                           <div>Date of Issue</div>
                           <div className="text-[10px] font-serif text-slate-900 tracking-tight">{new Date().toLocaleDateString("en", { month: "2-digit", day: "2-digit", year: "numeric" })}</div>
                        </div>
                        <div>
                           <div>Authority</div>
                           <div className="text-[10px] font-serif text-slate-900 tracking-tight">OPEN SOURCE</div>
                        </div>
                        <div className="col-span-2 flex justify-end mt-1 pr-4">
                           <div className="text-center relative">
                              <span className="font-serif text-[18px] italic text-slate-700 opacity-80 mix-blend-multiply px-2">{data.user.name || data.user.login}</span>
                              <div className="text-[6px] absolute -bottom-0.5 left-0 right-0 border-t border-slate-400 pt-0.5">SIGNATURE</div>
                           </div>
                        </div>
                     </div>
                   </div>
                   
                   <div className="w-full mt-3 font-mono text-[10px] tracking-[0.14em] text-slate-700 font-bold leading-tight break-all border-t-[1.5px] border-slate-400 pt-2 pb-1">
                     {'P<DEV' + (data.user.name || data.user.login).toUpperCase().replace(/[^A-Z]/g, '<').padEnd(34, '<')}
                     <br />
                     {'AC' + data.user.id.toString().slice(0,8) + '5DEV<<<<<<<<<<<<<<02'}
                   </div>
                 </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">STATISTICS LEDGER</span>
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 02</span>
                </div>
                <div className="flex flex-col gap-0 flex-1 justify-center">
                   {[
                     { label: "REPOSITORIES", val: data.stats.repositories },
                     { label: "TOTAL STARS", val: data.stats.stars },
                     { label: "FOLLOWERS", val: data.stats.followers },
                     { label: "FOLLOWING", val: data.stats.following },
                     { label: "FORKS", val: data.stats.forks },
                     { label: "ORGANIZATIONS", val: data.stats.organizations },
                     { label: "PUBLIC GISTS", val: data.stats.publicGists },
                     { label: "CONTRIBUTIONS", val: data.stats.contributions },
                   ].map((stat, i) => (
                     <div key={i} className="flex items-center justify-between border-b border-slate-300/60 py-2.5">
                       <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">{stat.label}</span>
                       <span className="text-[13px] font-mono font-bold text-slate-900 tracking-wider">{(stat.val || 0).toLocaleString()}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 03</span>
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">LANGUAGES</span>
                </div>
                <div className="flex flex-col gap-4 mt-2 flex-1 justify-center">
                  {data.languages.slice(0, 6).map((lang: any, idx: number) => (
                    <div key={lang.name}>
                      <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5">
                        <span className="text-slate-800">{lang.name}</span>
                        <span className="text-slate-600">{lang.percent}%</span>
                      </div>
                      <div className="w-full h-[5px] bg-slate-300/50 rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm"
                          style={{
                            width: `${lang.percent}%`,
                            background: idx === 0 ? 'linear-gradient(90deg, #4a6fa5, #6b8cbf)' : 'linear-gradient(90deg, #8a7fb5, #a89dd1)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t-[1.5px] border-slate-400 pt-2 mt-2 flex justify-between text-[7px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Primary: {data.languages[0]?.name || '—'}</span>
                  <span>Secondary: {data.languages[1]?.name || '—'}</span>
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">TECH STACK</span>
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 04</span>
                </div>
                <div className="flex flex-col gap-5 mt-2 flex-1 justify-center">
                   {data.stack.slice(0, 5).map((item: any) => (
                     <div key={item.name} className="flex items-center justify-between border-b border-slate-300/60 pb-2">
                       <div>
                         <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{item.name}</div>
                         <div className="text-[8px] text-slate-500 font-bold truncate max-w-[200px]">{item.tools.slice(0, 4).join(' · ')}</div>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-16 h-[4px] bg-slate-300/50 rounded-sm overflow-hidden">
                           <div className="h-full bg-slate-700 rounded-sm" style={{ width: `${item.strength}%` }} />
                         </div>
                         <span className="text-[9px] font-mono font-bold text-slate-700">{item.strength}%</span>
                       </div>
                     </div>
                   ))}
                </div>
                <div className="text-[7px] text-slate-500 text-center mt-2 font-bold uppercase tracking-widest">
                  Verified via repository analysis · commit signatures
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 05</span>
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">VISA STAMPS</span>
                </div>
                <div className="relative flex-1">
                  <div className="absolute top-4 left-6"><VisaStamp label="FIRST PR" date="APPROVED" color="red" type="circle" /></div>
                  <div className="absolute top-4 right-8"><VisaStamp label="100 COMMITS" date="VERIFIED" color="blue" type="rect" /></div>
                  <div className="absolute top-[35%] left-[25%]"><VisaStamp label="HACKTOBERFEST" date="OCT 2023" color="green" type="hex" /></div>
                  <div className="absolute top-[45%] right-[10%]"><VisaStamp label="OPEN SOURCE" date="CLEARED" color="amber" type="circle" /></div>
                  <div className="absolute bottom-[25%] left-4"><VisaStamp label="MAINTAINER" date="LEVEL UP" color="purple" type="circle" /></div>
                  <div className="absolute bottom-[10%] right-[20%]"><VisaStamp label="100 STARS" date="ACHIEVED" color="red" type="rect" /></div>
                </div>
                <div className="text-[7px] text-slate-500 text-center font-bold uppercase tracking-widest">
                  * stamps applied upon milestone verification
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">ACHIEVEMENTS</span>
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 06</span>
                </div>
                <div className="flex flex-col gap-0 flex-1 justify-center">
                  {data.achievements.map((ach: any) => (
                    <div key={ach.name} className="flex items-center justify-between border-b border-slate-300/60 py-2.5">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-slate-600" /> {ach.name}
                      </span>
                      {ach.unlocked ? (
                        <span className="text-[8px] font-mono font-bold text-green-700 bg-green-100/60 px-2 py-0.5 rounded-sm border border-green-300/40">CLEARED</span>
                      ) : (
                        <span className="text-[8px] font-mono font-bold text-slate-500">{ach.progress}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col items-center">
                <div className="flex items-center justify-between w-full border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 07</span>
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">DEVELOPER RANK</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">CURRENT CLASSIFICATION</span>
                  
                  <div className="w-32 h-32 rounded-full border-[3px] border-slate-400 flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-[6px] rounded-full border border-dashed border-slate-400/50" />
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-serif font-black text-slate-800">{Math.floor(data.level.xp / 100) || 37}</span>
                    </div>
                  </div>
                  
                  <div className="text-[16px] font-sans font-bold uppercase tracking-[0.15em] text-slate-800 border border-slate-400 px-5 py-1.5 mb-6">{data.level.title}</div>
                  
                  <div className="w-full max-w-[260px]">
                    <div className="flex justify-between text-[7px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      <span>XP: {data.level.xp.toLocaleString()}</span>
                      <span>{data.level.progress}%</span>
                    </div>
                    <div className="w-full h-[4px] bg-slate-300/50 rounded-sm overflow-hidden">
                      <div className="h-full bg-slate-700 rounded-sm" style={{ width: `${data.level.progress}%` }} />
                    </div>
                    <div className="text-center text-[7px] font-bold uppercase tracking-wider text-slate-500 mt-2">Next: {data.level.next}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">TIMELINE</span>
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 08</span>
                </div>
                <div className="relative pl-5 mt-2 border-l-[2px] border-slate-400 flex flex-col gap-5 flex-1 justify-center">
                   {data.timeline.map((item: any, idx: number) => (
                     <div key={idx} className="relative">
                       <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-slate-500 border-[2.5px] border-[#eef1f6]" />
                       <span className="text-[8px] font-mono font-bold text-slate-500 tracking-wider">{new Date(item.date).getFullYear()}</span>
                       <div className="text-[10px] font-bold text-slate-900 leading-tight mt-0.5 uppercase tracking-wider">{item.label}</div>
                       <div className="text-[8px] text-slate-600 mt-0.5">{item.detail}</div>
                     </div>
                   ))}
                </div>
                <div className="text-[7px] text-slate-500 text-center font-mono font-bold uppercase tracking-widest border-t-[1.5px] border-slate-400 pt-2">
                  Official GitHub timeline record
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 09</span>
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">ORGANIZATIONS</span>
                </div>
                <div className="flex flex-col gap-0 flex-1 justify-center">
                  {(data.organizations.length > 0 ? data.organizations : [{ login: "independent", description: "Independent Developer" }]).map((org: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 border-b border-slate-300/60 py-3">
                      {org.avatarUrl ? (
                        <img src={org.avatarUrl} alt="" className="w-8 h-8 rounded-full grayscale border border-slate-300" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-400/20 border border-slate-300 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">@{org.login}</div>
                        <div className="text-[8px] text-slate-600 font-bold truncate max-w-[180px]">{org.description || "Member"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">CODING HABITS</span>
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 10</span>
                </div>
                <div className="flex flex-col gap-0 flex-1 justify-center">
                  {[
                    { label: "MOST ACTIVE DAY", value: data.habits.mostActiveDay },
                    { label: "PEAK CODING TIME", value: data.habits.peakCodingTime },
                    { label: "PREFERRED TIME", value: data.habits.preferredTime },
                    { label: "LONGEST STREAK", value: `${data.habits.longestStreak} days` },
                    { label: "WEEKLY COMMITS", value: data.habits.weeklyCommits },
                    { label: "COMMITS THIS YEAR", value: data.habits.commitsThisYear },
                    { label: "CONSISTENCY", value: `${data.habits.consistency}%` },
                    { label: "ARCHETYPE", value: data.habits.archetype },
                  ].map((habit, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-300/60 py-2.5">
                      <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">{habit.label}</span>
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{habit.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 11</span>
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">DEVELOPER DNA</span>
                </div>
                <div className="flex flex-col gap-4 mt-2 flex-1 justify-center">
                  <div className="text-[10px] text-slate-700 italic leading-relaxed border-l-[2px] border-slate-400 pl-3 mb-2">
                    &ldquo;{data.interpretation.headline}&rdquo;
                  </div>
                  <div className="text-[9px] text-slate-600 leading-relaxed mb-4">
                    {data.interpretation.body}
                  </div>
                  <div className="border-t-[1.5px] border-slate-400 pt-3">
                    <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-3">DNA COMPOSITION</div>
                    {data.dna.map((dna: any) => (
                      <div key={dna.name} className="mb-2">
                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider mb-1">
                          <span className="text-slate-700">{dna.name}</span>
                          <span className="text-slate-900">{dna.value}%</span>
                        </div>
                        <div className="w-full h-[4px] bg-slate-300/50 rounded-sm overflow-hidden">
                          <div className="h-full bg-slate-600 rounded-sm" style={{ width: `${dna.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full relative p-0 text-slate-800 bg-[#eef1f6] overflow-hidden">
              <GuillocheBg />
              <div className="relative z-10 p-6 h-full flex flex-col items-center text-center">
                <div className="flex items-center justify-between w-full border-b-[1.5px] border-slate-400 pb-1.5 mb-3">
                  <span className="text-[18px] font-sans tracking-tight text-slate-700 font-bold">VERIFICATION</span>
                  <span className="text-[8px] font-sans tracking-widest text-slate-500 font-black">PAGE 12</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">VERIFIED BY</span>
                  
                  <div className="w-20 h-20 rounded-full border-[2px] border-slate-400 flex items-center justify-center mb-3">
                    <Github className="w-10 h-10 text-slate-700" />
                  </div>
                  <span className="text-[14px] font-sans font-bold text-slate-800 tracking-[0.15em] uppercase">GitHub</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1 mb-8">Open Source Community</span>

                  <div className="w-3/4 border-t border-slate-400 pt-4">
                    <span className="font-serif text-[20px] italic text-slate-700 opacity-70">Developer Passport</span>
                    <div className="w-full h-px bg-slate-400 mt-2 mb-1" />
                    <span className="text-[6px] font-bold uppercase tracking-widest text-slate-500">OFFICIAL SEAL</span>
                  </div>
                  
                  <div className="flex justify-between w-3/4 mt-6">
                    <div className="text-left">
                      <span className="text-[7px] font-bold uppercase text-slate-500 block tracking-wider">Date Issued</span>
                      <span className="text-[9px] font-bold text-slate-900">{new Date().toLocaleDateString("en", { month: "2-digit", day: "2-digit", year: "numeric" })}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-[2px] border-slate-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div className="w-full font-mono text-[8px] tracking-[0.12em] text-slate-600 font-bold leading-tight break-all border-t-[1.5px] border-slate-400 pt-2 mt-3">
                  {'V<GITHUB<VERIFIED<<<' + (data.user.login).toUpperCase().padEnd(20, '<')}
                </div>
              </div>
            </div>

          </FlipWrapper>
        </div>
      </div>
    </div>
  );
}
