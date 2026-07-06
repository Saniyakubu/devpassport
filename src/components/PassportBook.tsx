"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Globe, Shield, Star, Award, Calendar, Clock, 
  Code, Users, CheckCircle, ChevronLeft, ChevronRight,
  GitFork, Activity, ShieldCheck, MapPin, Github
} from "lucide-react";
import CountUp from "react-countup";

// Dynamically import react-pageflip to bypass Next.js SSR environment constraints
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

// Sound generator using Web Audio API
function playPageFlipSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.25;
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.pow(1 - i / bufferSize, 3);
      data[i] = (Math.random() * 2 - 1) * decay * 0.08;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1100;
    filter.Q.value = 1.0;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start();
  } catch (e) {}
}

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

/* ── Custom Visa Stamp Component ── */
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

export default function PassportBook({ data, currentPage, setCurrentPage }: any) {
  const flipBookRef = useRef<any>(null);
  const [isFlippedOpen, setIsFlippedOpen] = useState(false);

  useEffect(() => {
    if (flipBookRef.current && isFlippedOpen) {
      const bookInstance = flipBookRef.current.pageFlip();
      if (bookInstance && bookInstance.getCurrentPageIndex() !== currentPage) {
        bookInstance.turnToPage(currentPage);
      }
    }
  }, [currentPage, isFlippedOpen]);

  const handleOpenCover = () => {
    setIsFlippedOpen(true);
    setCurrentPage(1);
    playPageFlipSound();
  };

  const handleCloseCover = () => {
    setIsFlippedOpen(false);
    setCurrentPage(0);
    playPageFlipSound();
  };

  const passportNo = `DP-${String(data.user.id).slice(0, 4)}-${data.user.login.toUpperCase().slice(0, 4)}`;

  if (!isFlippedOpen || currentPage === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[580px] w-full py-8 select-none">
        <button
          onClick={handleOpenCover}
          className="group relative flex flex-col items-center w-[350px] h-[500px] rounded-r-2xl rounded-l-md cursor-pointer text-amber-100 uppercase transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_45px_120px_rgba(0,0,0,0.7)] text-center shadow-[0_35px_90px_rgba(0,0,0,0.55)]"
          style={{ 
            perspective: "1500px",
            background: "linear-gradient(to right, #0a1122 0%, #152238 5%, #0d162a 100%)" // Dark blue leather color from reference
          }}
        >
          {/* Spine crease */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/40 via-transparent to-black/10 z-10 rounded-l-md" />
          {/* Stitched edge */}
          <div className="absolute inset-2 border-[1.5px] border-dashed border-[#243555] rounded-md z-0 opacity-50" />

          <div className="flex flex-col items-center justify-center h-full w-full p-10 z-0">
            <h2 className="text-3xl font-serif text-[#e9b646] font-extrabold tracking-wide uppercase leading-tight mb-6">
              Developer<br />Passport
            </h2>
            
            <div className="w-24 h-24 mb-6 rounded-full border border-[#e9b646] flex items-center justify-center relative">
              <Code className="w-10 h-10 text-[#e9b646]" />
              {/* Olive branches using SVG */}
              <svg viewBox="0 0 100 100" className="absolute inset-[-10px] w-[120px] h-[120px] text-[#e9b646] fill-current opacity-80">
                <path d="M50,90 C25,90 10,65 10,40 C10,35 15,35 15,40 C15,60 28,80 50,80 C72,80 85,60 85,40 C85,35 90,35 90,40 C90,65 75,90 50,90 Z" />
              </svg>
            </div>

            <span className="text-[12px] font-sans tracking-[0.25em] text-[#e9b646] font-bold mt-10">OPEN SOURCE CITIZEN</span>
          </div>
        </button>
      </div>
    );
  }

  const PageHeader = ({ num, title, right = false }: { num: string, title: string, right?: boolean }) => (
    <div className={`flex justify-between items-center border-b border-amber-900/15 pb-1.5 mb-4 ${right ? 'flex-row-reverse' : ''}`}>
      <span className="text-[9px] font-sans tracking-widest text-amber-900/60 font-black">PAGE {num}</span>
      <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-amber-900/80">{title}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div className="flex items-center justify-center w-full max-w-[800px] mb-4 px-2">
        <button
          onClick={handleCloseCover}
          className="px-4 py-2 text-xs font-bold font-sans uppercase tracking-wider text-amber-600 border border-amber-500/20 bg-amber-950/10 hover:bg-amber-500/10 rounded-full transition"
        >
          Close Passport
        </button>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-[840px]">
        <button onClick={() => flipBookRef.current?.pageFlip().flipPrev()} className="absolute -left-12 p-3 text-slate-400 hover:text-amber-500 z-20">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button onClick={() => flipBookRef.current?.pageFlip().flipNext()} className="absolute -right-12 p-3 text-slate-400 hover:text-amber-500 z-20">
          <ChevronRight className="w-8 h-8" />
        </button>

        <div className="w-[800px] h-[520px] shadow-[0_30px_90px_rgba(0,0,0,0.6)] relative overflow-visible rounded-md bg-[#eaddc8]">
          <div className="absolute left-[50%] top-0 bottom-0 w-[40px] -translate-x-[50%] bg-gradient-to-r from-black/20 via-black/5 to-black/20 z-30 pointer-events-none" />

          <HTMLFlipBook
            width={400} height={520} size="stretch"
            minWidth={360} maxWidth={400} minHeight={480} maxHeight={520}
            showCover={false} useMouseEvents={false}
            onFlip={(e: any) => { setCurrentPage(e.data); playPageFlipSound(); }}
            ref={flipBookRef}
            className="w-full h-full rounded-md overflow-hidden"
          >
            {/* 01: IDENTITY */}
            <div className="h-full border-r border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="01" title="IDENTITY" />
              <div className="flex flex-col gap-5">
                <div className="flex gap-4 items-start">
                  <img src={data.user.avatarUrl} alt="" className="w-20 h-24 object-cover border-2 border-slate-300 rounded shadow-sm grayscale contrast-125" />
                  <div className="flex flex-col">
                    <h3 className="font-serif text-2xl font-bold text-slate-900 leading-none">{data.user.name || data.user.login}</h3>
                    <span className="font-mono text-[10px] text-amber-900/70 font-bold mb-2">@{data.user.login}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Member Since</span>
                    <span className="text-xs font-serif font-bold text-slate-800 mb-2">{new Date(data.user.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    <span className="text-xs font-serif font-bold text-slate-800">Active Developer</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-t border-amber-900/20 pt-4">
                  <MiniQr />
                  <div className="text-right">
                    <span className="font-serif text-2xl italic text-slate-800 signature-font opacity-80">{data.user.name}</span>
                    <div className="w-32 h-px bg-slate-400 mt-1" />
                    <span className="text-[7px] uppercase tracking-widest text-slate-500">Developer Signature</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 02: STATISTICS */}
            <div className="h-full border-l border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="02" title="STATISTICS" right />
              <div className="grid grid-cols-1 gap-2 mt-2">
                 {[
                   { label: "Repositories", val: data.stats.repositories, icon: <Code className="w-3 h-3" /> },
                   { label: "Total Stars", val: data.stats.stars.toLocaleString(), icon: <Star className="w-3 h-3" /> },
                   { label: "Followers", val: data.stats.followers.toLocaleString(), icon: <Users className="w-3 h-3" /> },
                   { label: "Following", val: data.stats.following.toLocaleString(), icon: <Users className="w-3 h-3" /> },
                   { label: "Forks", val: data.stats.forks.toLocaleString(), icon: <GitFork className="w-3 h-3" /> },
                   { label: "Organizations", val: data.stats.organizations, icon: <Globe className="w-3 h-3" /> },
                   { label: "Gists", val: data.stats.publicGists, icon: <Code className="w-3 h-3" /> },
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-amber-900/10 py-2">
                     <div className="flex items-center gap-2 text-slate-600">
                       {stat.icon}
                       <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                     </div>
                     <span className="text-sm font-mono font-bold text-slate-900">{stat.val}</span>
                   </div>
                 ))}
              </div>
            </div>

            {/* 03: LANGUAGES */}
            <div className="h-full border-r border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="03" title="LANGUAGES" />
              <div className="flex flex-col gap-4 mt-4">
                {data.languages.slice(0, 6).map((lang: any) => (
                  <div key={lang.name}>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                      <span className="text-slate-800">{lang.name}</span>
                      <span className="text-slate-600">{lang.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-900/10 rounded-full">
                      <div className="h-full bg-slate-800 rounded-full" style={{ width: `${lang.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 04: TECH STACK */}
            <div className="h-full border-l border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="04" title="TECH STACK" right />
              <div className="flex flex-col gap-6 mt-4">
                 {/* Group stack items */}
                 {(() => {
                   const tools = data.stack.flatMap((s: any) => s.tools);
                   const frontend = tools.filter((t: any) => ["react","vue","svelte","next.js","tailwind"].includes(t.toLowerCase())).slice(0, 3);
                   const backend = tools.filter((t: any) => ["node.js","python","go","java","express"].includes(t.toLowerCase())).slice(0, 3);
                   const db = tools.filter((t: any) => ["postgresql","mongodb","mysql","redis"].includes(t.toLowerCase())).slice(0, 3);

                   return [
                     { title: "Frontend", items: frontend.length ? frontend : ["React", "Next.js"] },
                     { title: "Backend", items: backend.length ? backend : ["Node.js", "Express"] },
                     { title: "Database", items: db.length ? db : ["PostgreSQL"] }
                   ].map(group => (
                     <div key={group.title}>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-300 block mb-2 pb-1">{group.title}</span>
                       <div className="flex flex-wrap gap-2">
                         {group.items.map((t: any) => (
                           <div key={t} className="px-2 py-1 bg-amber-900/5 border border-amber-900/20 rounded text-[9px] font-bold text-slate-800 flex items-center gap-1.5">
                              {t}
                           </div>
                         ))}
                       </div>
                     </div>
                   ));
                 })()}
              </div>
            </div>

            {/* 05: VISA STAMPS */}
            <div className="h-full border-r border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="05" title="VISA STAMPS" />
              <div className="relative w-full h-full pt-4">
                <div className="absolute top-2 left-4"><VisaStamp label="FIRST PR" date="12.04.2020" color="red" type="circle" /></div>
                <div className="absolute top-8 right-2"><VisaStamp label="100 COMMITS" date="APPROVED" color="blue" type="rect" /></div>
                <div className="absolute top-28 left-12"><VisaStamp label="HACKTOBERFEST" date="OCT 2022" color="green" type="hex" /></div>
                <div className="absolute bottom-32 left-2"><VisaStamp label="OPEN SOURCE" date="VERIFIED" color="amber" type="circle" /></div>
                <div className="absolute bottom-16 right-6"><VisaStamp label="MAINTAINER" date="LEVEL UP" color="purple" type="circle" /></div>
                <div className="absolute bottom-4 left-20"><VisaStamp label="100 STARS" date="ACHIEVED" color="red" type="rect" /></div>
              </div>
            </div>

            {/* 06: ACHIEVEMENTS */}
            <div className="h-full border-l border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="06" title="ACHIEVEMENTS" right />
              <div className="flex flex-col gap-3 mt-4">
                {data.achievements.map((ach: any) => (
                  <div key={ach.name} className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Award className="w-3 h-3 text-amber-600" /> {ach.name}
                    </span>
                    {ach.unlocked ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <span className="text-[9px] text-slate-400 font-bold">{ach.progress}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 07: DEVELOPER LEVEL */}
            <div className="h-full border-r border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc] flex flex-col items-center">
              <PageHeader num="07" title="DEVELOPER LEVEL" />
              <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                {/* Large Laurel Wreath background effect */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <Award className="w-64 h-64 text-amber-900" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Current Rank</span>
                <div className="text-6xl font-serif font-black text-amber-600 drop-shadow-sm mb-2">{Math.floor(data.level.xp / 100) || 37}</div>
                <div className="text-xl font-serif font-bold uppercase tracking-widest text-slate-900 bg-amber-500/20 px-4 py-1 rounded border border-amber-500/40 mb-8">{data.level.title}</div>
                
                <div className="w-full">
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    <span>XP: {data.level.xp.toLocaleString()}</span>
                    <span>{data.level.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-amber-900/20 rounded-full">
                    <div className="h-full bg-slate-800 rounded-full" style={{ width: `${data.level.progress}%` }} />
                  </div>
                  <div className="text-center text-[8px] font-bold uppercase tracking-wider text-slate-500 mt-2">Next Level: {data.level.next}</div>
                </div>
              </div>
            </div>

            {/* 08: TIMELINE */}
            <div className="h-full border-l border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="08" title="TIMELINE" right />
              <div className="relative pl-4 mt-4 border-l border-amber-900/20 flex flex-col gap-4">
                 {data.timeline.map((item: any, idx: number) => (
                   <div key={idx} className="relative">
                     <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-600 border-[2px] border-[#f4ebdc]" />
                     <span className="text-[9px] font-mono font-bold text-amber-700">{new Date(item.date).getFullYear()}</span>
                     <div className="text-xs font-bold text-slate-900 leading-tight mt-0.5">{item.label}</div>
                   </div>
                 ))}
              </div>
            </div>

            {/* 09: ORGANIZATIONS */}
            <div className="h-full border-r border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="09" title="ORGANIZATIONS" />
              <div className="flex flex-col gap-4 mt-4">
                {(data.organizations.length > 0 ? data.organizations : [{ login: "Open Source Contributor", description: "Independent" }]).map((org: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 border-b border-amber-900/10 pb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">@{org.login}</div>
                      <div className="text-[9px] text-slate-600 truncate max-w-[120px]">{org.description || "Member"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 10: CODING HABITS */}
            <div className="h-full border-l border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="10" title="CODING HABITS" right />
              <div className="flex flex-col gap-4 mt-4 text-xs font-bold text-slate-800">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">🛠</span>
                  <span>Highest activity recorded on {data.habits.mostActiveDay}s.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">🌙</span>
                  <span>Usually commits during {data.habits.peakCodingTime}.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">🔥</span>
                  <span>Longest uninterrupted coding streak is {data.habits.longestStreak} days.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">📈</span>
                  <span>Averages {data.habits.weeklyCommits} commits per week.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">💻</span>
                  <span>Primary archetype identified as "{data.habits.archetype}".</span>
                </div>
              </div>
            </div>

            {/* 11: FUN FACTS */}
            <div className="h-full border-r border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc]">
              <PageHeader num="11" title="FUN FACTS" />
              <div className="flex flex-col gap-4 mt-4 text-xs text-slate-800 italic leading-relaxed">
                <p>"{data.interpretation.headline}"</p>
                <p>{data.interpretation.body}</p>
                <div className="mt-4 pt-4 border-t border-amber-900/20">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">Developer DNA Breakdown</div>
                  {data.dna.slice(0, 3).map((dna: any) => (
                    <div key={dna.name} className="flex justify-between items-center mb-1 text-[10px] font-bold">
                      <span className="text-slate-700">{dna.name}</span>
                      <span className="text-slate-900">{dna.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 12: VERIFICATION */}
            <div className="h-full border-l border-amber-900/10 p-6 text-slate-800 bg-[#f4ebdc] flex flex-col items-center justify-center text-center">
              <PageHeader num="12" title="VERIFICATION" right />
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">VERIFIED BY</span>
                <Github className="w-16 h-16 text-slate-900 mb-2" />
                <span className="text-sm font-bold text-slate-900 tracking-widest">GitHub</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1 mb-8">Open Source Community</span>

                <span className="font-serif text-2xl italic text-slate-800 signature-font opacity-80 border-b border-amber-900/20 pb-1 mb-1 w-3/4">Developer Passport</span>
                <div className="flex justify-between w-3/4 mt-4">
                  <div className="text-left">
                    <span className="text-[7px] font-bold uppercase text-slate-500 block">Date Issued</span>
                    <span className="text-[9px] font-bold text-slate-900">{new Date().toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-amber-700/40 flex items-center justify-center opacity-50">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                  </div>
                </div>
              </div>
            </div>

          </HTMLFlipBook>
        </div>
      </div>
    </div>
  );
}
