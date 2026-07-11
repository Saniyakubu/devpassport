"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Github, Download, Printer, Sparkles, Shield, 
  HelpCircle, Share2, Layers, RefreshCw, Star, 
  Code, Info, ChevronRight, Check, AlertCircle
} from "lucide-react";
import { Toaster, toast } from "sonner";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

import PassportBook from "@/components/PassportBook";
import ShareableCardsSection from "@/components/ShareableCardsSection";

type PassportData = {
  user: {
    login: string;
    id: number;
    avatarUrl: string;
    url: string;
    name: string;
    bio: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    publicRepos: number;
    publicGists: number;
    followers: number;
    following: number;
    createdAt: string;
    yearsCoding: number;
  };
  stats: {
    repositories: number;
    fetchedRepositories?: number;
    ownedRepositories?: number;
    sourceRepositories: number;
    followers: number;
    following: number;
    stars: number;
    forks: number;
    organizations: number;
    publicGists: number;
    commits?: number;
    commitsThisYear?: number;
    contributions: number;
    pullRequests: number;
    issues: number;
    activeDaysThisYear?: number;
    topRepoStars?: number;
  };
  scouting: {
    label: string;
    value: number;
    detail: string;
    score: number;
    source: string;
  }[];
  playstyles: string[];
  languages: { name: string; value: number; percent: number }[];
  stack: { name: string; strength: number; tools: string[] }[];
  level: { title: string; progress: number; next: string; xp: number };
  habits: {
    mostActiveDay: string;
    peakCodingTime: string;
    preferredTime: string;
    longestStreak: number;
    weeklyCommits: number;
    commitsThisYear: number;
    consistency: number;
    archetype: string;
  };
  dna: { name: string; value: number }[];
  achievements: { name: string; unlocked: boolean; progress: number }[];
  organizations: { login: string; avatarUrl: string; description: string | null }[];
  repositories: {
    name: string;
    description: string | null;
    stars: number;
    forks: number;
    language: string | null;
    url: string;
  }[];
  timeline: { label: string; date: string; detail: string }[];
  interpretation: { headline: string; body: string };
  dataSources?: Record<string, string | string[]>;
  generatedAt: string;
};

type ThemeName =
  | "Classic Passport"
  | "Cyberpunk"
  | "Glass"
  | "Terminal"
  | "Minimal"
  | "Retro"
  | "GitHub Dark"
  | "GitHub Light";

const sampleData: PassportData = {
  user: {
    login: "octocat",
    id: 583231,
    avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
    url: "https://github.com/octocat",
    name: "The Octocat",
    bio: "Building public tools, shipping code, and advocating open-source culture.",
    company: "@github",
    blog: "github.blog",
    location: "San Francisco, CA",
    publicRepos: 42,
    publicGists: 8,
    followers: 8400,
    following: 9,
    createdAt: "2011-01-25T18:44:36Z",
    yearsCoding: 15,
  },
  stats: {
    repositories: 42,
    fetchedRepositories: 42,
    ownedRepositories: 42,
    sourceRepositories: 31,
    followers: 8400,
    following: 9,
    stars: 12870,
    forks: 4200,
    organizations: 4,
    publicGists: 8,
    commits: 1400,
    commitsThisYear: 1400,
    contributions: 384,
    pullRequests: 12,
    issues: 7,
    activeDaysThisYear: 184,
    topRepoStars: 8210,
  },
  scouting: [
    { label: "Commits", value: 1400, detail: "1,400 commits", score: 84, source: "rest-search" },
    { label: "Stars earned", value: 12870, detail: "12,870 stars", score: 99, source: "rest-repositories" },
    { label: "Top repo reach", value: 8210, detail: "8,210 stars", score: 99, source: "rest-repositories" },
    { label: "Pull requests", value: 12, detail: "12 PRs", score: 14, source: "rest-search" },
    { label: "Followers", value: 8400, detail: "8,400 followers", score: 99, source: "rest-user" },
    { label: "Languages", value: 5, detail: "5 languages", score: 50, source: "rest-languages" },
    { label: "Contributions", value: 384, detail: "384 contributions", score: 15, source: "github-calendar-scrape" },
    { label: "Account age", value: 15, detail: "15 yrs", score: 99, source: "rest-user" },
  ],
  playstyles: ["184 active days this year.", "Workhorse", "Polyglot"],
  languages: [
    { name: "TypeScript", value: 44, percent: 44 },
    { name: "Go", value: 19, percent: 19 },
    { name: "Python", value: 17, percent: 17 },
    { name: "CSS", value: 11, percent: 11 },
    { name: "HTML", value: 9, percent: 9 },
  ],
  stack: [
    { name: "Frontend", strength: 92, tools: ["TypeScript", "React", "Next.js"] },
    { name: "Backend", strength: 78, tools: ["Go", "Node.js", "Express"] },
    { name: "Database", strength: 52, tools: ["PostgreSQL", "SQLite"] },
    { name: "Cloud / DevOps", strength: 66, tools: ["Docker", "GitHub Actions"] },
  ],
  level: { title: "Legend", progress: 94, next: "Hall of Fame", xp: 155420 },
  habits: {
    mostActiveDay: "Tuesday",
    peakCodingTime: "21:00 UTC",
    preferredTime: "Late night",
    longestStreak: 18,
    weeklyCommits: 54,
    commitsThisYear: 1400,
    consistency: 91,
    archetype: "Night Owl",
  },
  dna: [
    { name: "Builder", value: 94 },
    { name: "Maintainer", value: 88 },
    { name: "Collaborator", value: 72 },
    { name: "Explorer", value: 79 },
    { name: "Debugger", value: 68 },
    { name: "Teacher", value: 81 },
    { name: "Innovator", value: 86 },
  ],
  achievements: [
    { name: "First Repository", unlocked: true, progress: 100 },
    { name: "100 Commits", unlocked: true, progress: 100 },
    { name: "100 Stars", unlocked: true, progress: 100 },
    { name: "Maintainer", unlocked: true, progress: 100 },
    { name: "Open Source", unlocked: true, progress: 100 },
    { name: "Full Stack", unlocked: true, progress: 100 },
    { name: "AI Builder", unlocked: true, progress: 72 },
    { name: "Bug Hunter", unlocked: false, progress: 62 },
  ],
  organizations: [
    { login: "github", avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4", description: "Open source citizenship" },
    { login: "vercel", avatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4", description: "Deployment guild" },
    { login: "openai", avatarUrl: "https://avatars.githubusercontent.com/u/14957082?v=4", description: "AI builders" },
  ],
  repositories: [
    { name: "developer-passport", description: "A premium identity artifact for developers.", stars: 8210, forks: 920, language: "TypeScript", url: "#" },
    { name: "passport-renderer", description: "Turns public activity into collectible visas.", stars: 2860, forks: 312, language: "Go", url: "#" },
    { name: "stack-atlas", description: "Maps repositories into useful stack signals.", stars: 1800, forks: 221, language: "Python", url: "#" },
  ],
  timeline: [
    { label: "Joined GitHub", date: "2011-01-25T18:44:36Z", detail: "Passport issued" },
    { label: "First Repository", date: "2011-02-03T12:00:00Z", detail: "hello-world" },
    { label: "100 Stars", date: "2014-09-12T12:00:00Z", detail: "Open-source traction" },
    { label: "Passport Generated", date: new Date().toISOString(), detail: "Developer Passport v1.0" },
  ],
  interpretation: {
    headline: "Original-project energy with a strong shipping bias.",
    body: "This passport blends public repositories, languages, stars, organizations, and recent activity into a readable developer identity.",
  },
  generatedAt: new Date().toISOString(),
};

const themes: ThemeName[] = [
  "Classic Passport",
  "Cyberpunk",
  "Glass",
  "Terminal",
  "Minimal",
  "Retro",
  "GitHub Dark",
  "GitHub Light",
];

async function fetchPassportData(username: string): Promise<PassportData> {
  const response = await fetch(`/api/github/${encodeURIComponent(username)}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? "Could not generate passport.");
  }

  return payload as PassportData;
}



const MiniPassportCover = ({ color, title, label, tilt }: { color: string, title: string, label: string, tilt: string }) => (
  <div className={`flex flex-col items-center ${tilt} transition-transform duration-500 hover:scale-110 hover:-translate-y-2 hover:z-20 cursor-default select-none`}>
    <div 
      className="relative flex flex-col items-center w-[110px] h-[160px] rounded-r-xl rounded-l-sm shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-white/10"
      style={{ backgroundColor: color }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/60 via-transparent to-black/20 rounded-l-sm z-10" />
      <div className="flex flex-col items-center justify-between h-full w-full py-4 px-2 z-0">
        <h2 className="text-[9px] font-sans tracking-[0.1em] text-[#e2c179] font-medium uppercase text-center leading-tight">
          DEVELOPER<br/>PASSPORT
        </h2>
        <div className="w-10 h-10 flex items-center justify-center text-[#e2c179] my-auto">
          <Github className="w-8 h-8" strokeWidth={1} />
        </div>
        <div className="w-5 h-3 flex flex-col items-center justify-center mb-1">
           <svg viewBox="0 0 40 30" className="w-full h-full text-[#e2c179] fill-current">
              <rect x="0" y="10" width="40" height="12" />
              <circle cx="20" cy="16" r="6" fill={color} stroke="currentColor" strokeWidth="2" />
              <rect x="15" y="0" width="10" height="10" />
           </svg>
        </div>
      </div>
    </div>
    <div className="mt-4 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg px-3 py-1.5 text-center shadow-xl">
      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{title}</p>
      <p className="text-[8px] text-slate-400 mt-0.5">{label}</p>
    </div>
  </div>
);


export default function DeveloperPassportApp() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("octocat");
  const [data, setData] = useState<PassportData>(sampleData);
  const [theme, setTheme] = useState<ThemeName>("Classic Passport");
  const [currentPage, setCurrentPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#b9922c", "#f0d98c", "#1e3a8a", "#0f172a"]
    });
  };

  async function generatePassport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, "");
    if (!cleanUsername) return;

    setLoading(true);
    setError("");
    const loadToast = toast.loading(`Analyzing GitHub profile for @${cleanUsername}...`);
    
    try {
      const payload = await queryClient.fetchQuery({
        queryKey: ["github-passport", cleanUsername.toLowerCase()],
        queryFn: () => fetchPassportData(cleanUsername),
      });

      setData(payload);
      setCurrentPage(0); // Reset book to cover
      toast.success("Passport data loaded successfully!", { id: loadToast });
      triggerConfetti();
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not generate passport.");
      toast.error(fetchError instanceof Error ? fetchError.message : "GitHub fetch failed", { id: loadToast });
    } finally {
      setLoading(false);
    }
  }

  // Export Shareable Card as PNG using html-to-image
  const handleExportCard = async (index: number) => {
    const CARD_NAMES = ["identity","achievement","habits","techstack","opensource","minimal","terminal","stamps","dna"];
    const CARD_LABELS = ["Identity Card","Achievement Card","Coding Habits Card","Tech Stack Card","Open Source Card","Minimal Card","Retro Terminal Card","Passport Stamp Card","Developer DNA Card"];
    const cardElementId = `share-card-${index}`;
    const cardName = CARD_NAMES[index] || "card";
    const loadToast = toast.loading(`Generating high-res card: ${CARD_LABELS[index] || "Card"}...`);

    try {
      // Small timeout to allow styling transitions to settle
      await new Promise((r) => setTimeout(r, 200));
      const el = document.getElementById(cardElementId);
      if (!el) throw new Error("Card element not found.");

      const dataUrl = await toPng(el, {
        quality: 0.98,
        pixelRatio: 2, // Retinal high resolution
        backgroundColor: "transparent",
      });

      const link = document.createElement("a");
      link.download = `${data.user.login}-${cardName}-card.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded successfully!", { id: loadToast });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate image. Please try again.", { id: loadToast });
    }
  };

  // Export Open Passport spreads as PDF
  const handleExportPdf = async () => {
    const loadToast = toast.loading("Building PDF passport spreads...");
    try {
      const el = document.getElementById("passport-stage-container");
      if (!el) throw new Error("Passport container not found.");

      const dataUrl = await toPng(el, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [840, 560]
      });

      pdf.addImage(dataUrl, "PNG", 20, 20, 800, 520);
      pdf.save(`${data.user.login}-developer-passport.pdf`);
      toast.success("PDF saved successfully!", { id: loadToast });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.", { id: loadToast });
    }
  };

  // Switch styles depending on theme state
  const getThemeClass = () => {
    switch (theme) {
      case "Cyberpunk": return "bg-black text-cyan-400 border-cyan-800";
      case "Glass": return "bg-slate-900/30 backdrop-blur-xl border-white/10 text-white";
      case "Terminal": return "bg-black text-green-500 border-green-800 font-mono";
      case "Minimal": return "bg-white text-slate-900 border-slate-200 shadow-md";
      case "Retro": return "bg-[#2a1b15] text-[#e0cfbe] border-[#4e2f20]";
      case "GitHub Dark": return "bg-[#0d1117] text-[#c9d1d9] border-[#30363d]";
      case "GitHub Light": return "bg-[#ffffff] text-[#24292f] border-[#d0d7de] shadow-sm";
      default: return "bg-passport-navy-dark text-slate-200 border-slate-800"; // Classic
    }
  };

  return (
    <main className={`relative min-h-screen overflow-x-hidden ${
      theme === "GitHub Light" 
        ? "bg-slate-50 text-slate-900" 
        : "bg-[#030611] text-slate-100"
    }`}>
      <Toaster position="bottom-right" theme={theme.toLowerCase().includes("light") ? "light" : "dark"} />
      
      {/* Background grids */}
      <div className="absolute inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black, transparent 80%)"
        }}
      />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 py-8">
        {/* Top Navbar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-serif tracking-wide text-amber-100 font-bold uppercase leading-none">Developer Passport</h1>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mt-1 block">GitHub Activity Ledger</span>
            </div>
          </div>

          {/* Theme switcher */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-900/60 border border-slate-800/80 rounded-full max-w-full overflow-x-auto">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  toast.info(`Theme switched to ${t}`);
                }}
                className={`px-3 py-1 text-[11px] font-sans font-bold uppercase tracking-wider rounded-full transition-all whitespace-nowrap ${
                  t === theme
                    ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.replace(" Passport", "")}
              </button>
            ))}
          </div>
        </header>

        {/* Hero Copy */}
        <div className="relative text-center mb-14 max-w-[800px] mx-auto">
          {/* Floating Example Passports */}
          <div className="hidden lg:flex absolute -left-24 top-4 z-0 pointer-events-auto">
            <MiniPassportCover 
              color="#061A3A" 
              title="Standard Issue" 
              label="For Active Developers" 
              tilt="-rotate-12"
            />
          </div>
          <div className="hidden lg:flex absolute -right-24 top-4 z-0 pointer-events-auto">
            <MiniPassportCover 
              color="#6B1D25" 
              title="Elite Tier" 
              label="Level 50+ / 5,000 XP" 
              tilt="rotate-12"
            />
          </div>

          <span className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-sans tracking-widest text-amber-500 uppercase font-black mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Premium Build Prompt v2
          </span>
          <h2 className="text-5xl md:text-6xl font-serif text-white tracking-tight font-extrabold leading-none">
            Your GitHub Journey, <span className="gold-foil">Beautifully Documented</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base md:text-lg leading-relaxed max-w-[640px] mx-auto">
            A handcrafted digital identity artifact. No mesh gradients, no generic layouts — just physical leather, paper weights, and gold leaf stamps.
          </p>
        </div>

        {/* Search Input bar */}
        <div className="max-w-[500px] mx-auto mb-16">
          <form onSubmit={generatePassport} className="p-2 border border-slate-800 rounded-2xl bg-slate-900/70 shadow-2xl relative">
            <div className="flex items-center gap-2">
              <div className="pl-3 text-slate-500">
                <Github className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub Username..."
                className="w-full bg-transparent border-0 outline-0 py-2.5 text-base text-slate-100 placeholder-slate-500 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 border border-amber-500/30 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 active:scale-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Generate"}
              </button>
            </div>
          </form>
          {error && (
            <p className="mt-2 text-xs text-rose-400 font-medium text-center flex items-center gap-1.5 justify-center">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </div>

        <section className="mb-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-800/70 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/80">
                  Scouting Metrics
                </p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-white">
                  REST activity ledger
                </h3>
              </div>
              <Info className="h-5 w-5 text-slate-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {data.scouting.map((metric) => (
                <div key={metric.label} className="group">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-200">{metric.label}</span>
                    <span className="font-mono text-[11px] text-slate-500">{metric.detail}</span>
                  </div>
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-300 shadow-[0_0_18px_rgba(240,217,140,0.35)]"
                      style={{ width: `${Math.max(2, metric.score)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                      {metric.source}
                    </span>
                    <span className="font-mono text-sm font-black text-amber-100">{metric.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="mb-5 border-b border-slate-800/70 pb-3">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/80">
                Playstyles
              </p>
              <h3 className="mt-1 font-serif text-2xl font-bold text-white">
                Activity readout
              </h3>
            </div>

            <div className="space-y-3">
              {data.playstyles.map((style) => (
                <div
                  key={style}
                  className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/50 px-4 py-3"
                >
                  <Check className="h-4 w-4 text-amber-300" />
                  <span className="text-sm font-semibold text-slate-200">{style}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              GitHub does not expose every badge-like label as a native field. The labels here are derived, but the evidence comes from REST search, repositories, events, organizations, languages, and the public contribution calendar.
            </p>
          </div>
        </section>

        {/* The Booklet Spread Container */}
        <div className="mb-20">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-serif text-slate-200 font-bold uppercase tracking-wide">
              Digital Passport Booklet
            </h3>
            <span className="text-xs text-slate-500 tracking-wider font-mono">
              Draggable corners, sound feedback, page indexing
            </span>
          </div>

          <div 
            id="passport-stage-container" 
            className="flex items-center justify-center p-8 bg-slate-950/40 rounded-3xl border border-slate-900 shadow-3xl"
          >
            <PassportBook 
              data={data} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <button
              onClick={handleExportPdf}
              className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Download PDF Spread
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Print Booklet
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────── */}
        {/* SHAREABLE CARDS — Full Carousel Redesign              */}
        {/* ─────────────────────────────────────────────────────── */}
        <ShareableCardsSection data={data} handleExportCard={handleExportCard} />

        {/* Informative Step Workflow */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-950/20 border border-slate-900/60">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-serif font-black text-lg mb-4">
              1
            </div>
            <h4 className="text-lg font-serif text-white font-bold">Fetch Data</h4>
            <p className="mt-2 text-slate-400 text-xs leading-relaxed">
              We query the GitHub REST APIs to fetch your repos, stars, commit event cycles, and organizational metadata.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/20 border border-slate-900/60">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-serif font-black text-lg mb-4">
              2
            </div>
            <h4 className="text-lg font-serif text-white font-bold">Interpret DNA</h4>
            <p className="mt-2 text-slate-400 text-xs leading-relaxed">
              Our analyzer interprets commits and repository language data to compute level points, coding streaks, and personas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/20 border border-slate-900/60">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-serif font-black text-lg mb-4">
              3
            </div>
            <h4 className="text-lg font-serif text-white font-bold">Stamps & Badges</h4>
            <p className="mt-2 text-slate-400 text-xs leading-relaxed">
              Milestone clearing issues visa-style collector stamps directly onto page sheets. Perfect to print, export, or share.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-10 border-t border-slate-800/40 text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 Developer Passport. Handcrafted luxury identity tool.</p>
          <p className="font-mono opacity-70">DP-APP v2.0 - Verified Secure Session</p>
        </footer>
      </div>
    </main>
  );
}
