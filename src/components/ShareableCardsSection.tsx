"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Clock,
  Github,
  Star,
  GitFork,
  ChevronLeft,
  ChevronRight,
  Download,
  Activity,
  Calendar,
  GitCommit,
  Flame,
  Code,
  Award,
  ShieldCheck,
  TrendingUp,
  Boxes,
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import {
  SiPython,
  SiGo,
  SiRust,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiPostgresql,
  SiVuedotjs,
  SiSvelte,
  SiDocker,
  SiRuby,
  SiPhp,
  SiSwift,
  SiKotlin,
  SiDart,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiFirebase,
  SiAngular,
  SiTailwindcss,
  SiNextdotjs,
  SiC,
  SiCplusplus,
  SiHtml5,
  SiCss,
} from "react-icons/si";
import { FaAws, FaJava } from "react-icons/fa";
import { TbBrandCSharp } from "react-icons/tb";
import { trackPassportExported } from "@/features/developer-passport/utils/analytics";

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
    sourceRepositories: number;
    followers: number;
    following: number;
    stars: number;
    forks: number;
    organizations: number;
    publicGists: number;
    contributions: number;
    pullRequests: number;
    issues: number;
  };
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
  scouting: {
    label: string;
    value: number;
    detail: string;
    score: number;
    source: string;
  }[];
  playstyles: string[];
  dna: { name: string; value: number }[];
  achievements: { name: string; unlocked: boolean; progress: number }[];
  organizations: {
    login: string;
    avatarUrl: string;
    description: string | null;
  }[];
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
  generatedAt: string;
};

const LANG_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  TypeScript: { icon: SiTypescript, color: "#3178c6" },
  JavaScript: { icon: SiJavascript, color: "#f1e05a" },
  Python: { icon: SiPython, color: "#ffc107" },
  Go: { icon: SiGo, color: "#00ADD8" },
  Rust: { icon: SiRust, color: "#dea584" },
  Java: { icon: FaJava, color: "#b07219" },
  "C#": { icon: TbBrandCSharp, color: "#178600" },
  "C++": { icon: SiCplusplus, color: "#f34b7d" },
  C: { icon: SiC, color: "#555555" },
  Ruby: { icon: SiRuby, color: "#701516" },
  PHP: { icon: SiPhp, color: "#4F5D95" },
  Swift: { icon: SiSwift, color: "#F05138" },
  Kotlin: { icon: SiKotlin, color: "#A97BFF" },
  Dart: { icon: SiDart, color: "#00B4AB" },
  CSS: { icon: SiCss, color: "#563d7c" },
  HTML: { icon: SiHtml5, color: "#e34c26" },
  Docker: { icon: SiDocker, color: "#2496ed" },
  AWS: { icon: FaAws, color: "#FF9900" },
  React: { icon: SiReact, color: "#61DAFB" },
  Node: { icon: SiNodedotjs, color: "#339933" },
  "Node.js": { icon: SiNodedotjs, color: "#339933" },
  Postgres: { icon: SiPostgresql, color: "#336791" },
  PostgreSQL: { icon: SiPostgresql, color: "#336791" },
  MySQL: { icon: SiMysql, color: "#4479A1" },
  MongoDB: { icon: SiMongodb, color: "#47A248" },
  Redis: { icon: SiRedis, color: "#DC382D" },
  Firebase: { icon: SiFirebase, color: "#FFCA28" },
  Angular: { icon: SiAngular, color: "#DD0031" },
  Vue: { icon: SiVuedotjs, color: "#4FC08D" },
  Svelte: { icon: SiSvelte, color: "#FF3E00" },
  NextJS: { icon: SiNextdotjs, color: "#ffffff" },
  "Next.js": { icon: SiNextdotjs, color: "#ffffff" },
  Tailwind: { icon: SiTailwindcss, color: "#06B6D4" },
  "Tailwind CSS": { icon: SiTailwindcss, color: "#06B6D4" },
};

function getTechData(name: string) {
  const lowerName = name.toLowerCase();
  const exactMatch = Object.keys(LANG_MAP).find(
    (k) => k.toLowerCase() === lowerName,
  );
  if (exactMatch) return LANG_MAP[exactMatch];

  const partialMatch = Object.keys(LANG_MAP).find(
    (k) => k.length > 2 && lowerName.includes(k.toLowerCase()),
  );
  if (partialMatch) return LANG_MAP[partialMatch];

  return { icon: CodeIconFallback, color: "#8b949e" };
}

function CodeIconFallback(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  );
}

function QRCodePlaceholder() {
  return (
    <div className="w-10 h-10 bg-white p-1 rounded-sm">
      <svg
        viewBox="0 0 100 100"
        fill="black"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 0h20v20H40zM40 40h20v20H40zM80 40h20v20H80zM0 40h20v20H0zM40 80h20v20H40zM70 70h30v30H70z" />
      </svg>
    </div>
  );
}

function GoldSeal({
  name,
  icon: Icon,
  unlocked,
  desc,
}: {
  name: string;
  icon: any;
  unlocked: boolean;
  desc?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center text-center transition-all ${unlocked ? "opacity-100" : "opacity-30 grayscale"}`}
    >
      <div className="relative w-12 h-12 mb-1.5 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          <path
            fill="url(#goldGradient)"
            d="M50 0 l4.8 5.6 l7.3 -1.2 l2.7 7 l6.7 3.3 l-0.3 7.4 l5.2 5.2 l-3.3 6.7 l3.3 6.7 l-5.2 5.2 l0.3 7.4 l-6.7 3.3 l-2.7 7 l-7.3 -1.2 l-4.8 5.6 l-4.8 -5.6 l-7.3 1.2 l-2.7 -7 l-6.7 -3.3 l0.3 -7.4 l-5.2 -5.2 l3.3 -6.7 l-3.3 -6.7 l5.2 -5.2 l-0.3 -7.4 l6.7 -3.3 l2.7 -7 l7.3 1.2 Z"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#2c1a05"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="1"
          />

          <defs>
            <linearGradient
              id="goldGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f9d976" />
              <stop offset="30%" stopColor="#e9b646" />
              <stop offset="50%" stopColor="#fff3b0" />
              <stop offset="70%" stopColor="#e9b646" />
              <stop offset="100%" stopColor="#b47d2b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative z-10 text-[#3d2a09]">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <span className="text-[8px] font-bold text-[#c09a5c] tracking-wide leading-tight px-1">
        {name}
      </span>
      {desc && (
        <span className="text-[7px] text-[#816b47] mt-0.5 max-w-[60px] truncate">
          {desc}
        </span>
      )}
    </div>
  );
}

function ProgressRing({
  percent,
  color,
  label,
  icon: Icon,
}: {
  percent: number;
  color: string;
  label: string;
  icon?: any;
}) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {Icon && (
        <div className="mb-2">
          <Icon
            className="w-8 h-8"
            style={{ color, filter: `drop-shadow(0 0 8px ${color}90)` }}
          />
        </div>
      )}
      <div className="relative w-16 h-16 flex items-center justify-center mb-2">
        <svg
          className="w-full h-full transform -rotate-90 absolute inset-0"
          viewBox="0 0 60 60"
        >
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke="#1b253b"
            strokeWidth="4"
          />
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        </svg>
        <span className="text-white font-bold text-xs z-10">{percent}%</span>
      </div>
      <span className="text-xs font-semibold text-[#c09a5c] tracking-wider">
        {label}
      </span>
    </div>
  );
}

function CardShell({
  data,
  id,
  children,
}: {
  data: PassportData;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="w-[400px] h-[580px] rounded-2xl bg-[#0a0f1a] relative overflow-hidden select-none shadow-2xl border border-white/10 flex flex-col font-sans"
    >
      <div className="px-6 pt-6 pb-5 flex items-center gap-4 bg-[#0d1524] border-b border-white/5 relative z-10">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-b from-[#e9b646] to-[#b47d2b] shadow-lg">
            <img
              src={data.user.avatarUrl}
              alt=""
              crossOrigin="anonymous"
              className="w-full h-full rounded-full object-cover bg-[#0a0f1a]"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-white text-xl font-serif font-bold tracking-wide truncate">
              {data.user.name || data.user.login}
            </h2>
            <ShieldCheck className="w-4 h-4 text-[#e9b646] shrink-0" />
          </div>
          <div className="text-[#a1b0cb] text-[10px] font-mono mt-0.5 truncate">
            @{data.user.login}
          </div>
          {data.user.url && (
            <div className="text-[#a1b0cb]/60 text-[8px] font-mono mt-0.5 truncate">
              {data.user.url.replace("https://", "")}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-6 py-5 overflow-hidden bg-[#0a0f1a]">
        {children}
      </div>

      <div className="px-6 py-4 bg-[#0d1524] border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-[#e9b646]" />
          <span className="text-[#a1b0cb] text-[9px] font-mono tracking-wider">
            devpassport • {new Date().getFullYear()}
          </span>
        </div>
        <span className="text-[#e9b646] text-[9px] font-mono tracking-wider">
          GID-{String(data.user.id).slice(0, 5)}
        </span>
      </div>

      <div className="absolute top-[30%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[300px] h-[300px] bg-[#e9b646]/5 rounded-full blur-[80px] pointer-events-none z-0" />
    </div>
  );
}

function IdentityCard({ data }: { data: PassportData }) {
  const primaryLang = data.languages[0]?.name || "Software";
  const levelNum = Math.floor(data.level.xp / 100) || 1;

  const parseDetail = (detail: string) => {
    const parts = detail.split(" ");
    const num = parts[0];
    const text = parts.slice(1).join(" ");
    return { num, text };
  };

  return (
    <div className="flex flex-col h-full z-10">
      <div className="flex justify-between items-center mb-4">
        <div className="px-3 py-1 rounded border border-[#e9b646]/30 bg-[#e9b646]/10 flex items-center gap-2">
          <span className="text-[#e9b646] text-[9px] font-black uppercase tracking-wider">
            Level {levelNum}
          </span>
          <span className="text-white text-[10px] font-semibold uppercase">
            {data.level.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#a1b0cb] text-[8px] font-mono uppercase tracking-wider">
            Primary
          </span>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/10">
            {React.createElement(getTechData(primaryLang).icon, {
              className: "w-3 h-3",
              style: { color: getTechData(primaryLang).color },
            })}
            <span className="text-white font-bold text-[9px] uppercase tracking-wide">
              {primaryLang}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3 flex-1 content-start">
        {data.scouting.slice(0, 8).map((metric) => {
          const { num, text } = parseDetail(metric.detail);
          return (
            <div
              key={metric.label}
              className="flex flex-col p-2 bg-white/[0.03] rounded-lg border border-white/5 shadow-inner"
            >
              <div className="text-[#a1b0cb]/80 text-[8px] font-mono uppercase tracking-widest mb-0.5 truncate">
                {metric.label}
              </div>
              <div className="flex items-baseline gap-1.5 overflow-hidden">
                <span className="text-white font-bold text-[15px] leading-none truncate">
                  {num}
                </span>
                <span className="text-[#e9b646] text-[7px] font-mono uppercase tracking-wider truncate">
                  {text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto bg-black/20 rounded-lg p-2.5 border border-white/5">
        <div className="text-[#a1b0cb] text-[8px] font-mono uppercase tracking-widest mb-1.5 flex items-center gap-2">
          <Activity className="w-3 h-3 text-[#e9b646]" /> Playstyles
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.playstyles.slice(0, 3).map((style) => (
            <div
              key={style}
              className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5"
            >
              <div className="w-1 h-1 rounded-full bg-[#e9b646]" />
              <span className="text-slate-200 text-[8.5px] font-medium uppercase tracking-wide">
                {style}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AchievementsCard({ data }: { data: PassportData }) {
  const levelNum = Math.floor(data.level.xp / 100) || 1;
  const mappedBadges = data.achievements.slice(0, 6);
  const fallbackIcons = [Star, Github, Clock, GitFork, ChevronRight, Download];

  const unlocked = data.achievements.filter((a) => a.unlocked).length;
  const total = data.achievements.length;

  return (
    <>
      <div className="flex justify-center mb-5">
        <div className="px-3 py-1 rounded border border-[#e9b646]/30 bg-[#e9b646]/10 flex items-center gap-2">
          <span className="text-[#e9b646] text-[9px] font-black uppercase tracking-wider">
            Level {levelNum}
          </span>
          <span className="text-white text-[10px] font-semibold uppercase">
            {data.level.title}
          </span>
        </div>
      </div>

      <h3 className="text-center text-[#c09a5c] text-[9px] font-bold tracking-[0.1em] uppercase mb-4">
        Achievements Unlocked
      </h3>

      <div className="grid grid-cols-3 gap-y-4 gap-x-2 mb-4">
        {mappedBadges.map((ach, idx) => (
          <GoldSeal
            key={idx}
            name={ach.name}
            icon={fallbackIcons[idx % fallbackIcons.length]}
            unlocked={ach.unlocked}
            desc={ach.unlocked ? "Verified" : "Locked"}
          />
        ))}
      </div>

      <div className="mt-auto mb-2 px-2">
        <div className="flex justify-between text-[9px] text-[#c09a5c] font-bold uppercase tracking-wider mb-1.5">
          <span>Next Achievement</span>
          <span>
            {unlocked} / {total}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#1b2944] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e9b646] rounded-full"
            style={{ width: `${(unlocked / total) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}

function HabitsCard({ data }: { data: PassportData }) {
  return (
    <>
      <h3 className="text-center text-[#c09a5c] text-[10px] font-bold tracking-[0.1em] uppercase mb-6">
        Coding Habits
      </h3>

      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-[#1b2944] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#e9b646]" />
          </div>
          <div>
            <div className="text-[#a1b0cb] text-[9px] uppercase tracking-wider">
              Most Active Day
            </div>
            <div className="text-white text-sm font-bold">
              {data.habits.mostActiveDay}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-[#1b2944] flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#e9b646]" />
          </div>
          <div>
            <div className="text-[#a1b0cb] text-[9px] uppercase tracking-wider">
              Peak Coding Time
            </div>
            <div className="text-white text-sm font-bold">
              {data.habits.peakCodingTime}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-[#1b2944] flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#e9b646]" />
          </div>
          <div>
            <div className="text-[#a1b0cb] text-[9px] uppercase tracking-wider">
              Longest Streak
            </div>
            <div className="text-white text-sm font-bold">
              {data.habits.longestStreak} Days
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-[#1b2944] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#e9b646]" />
          </div>
          <div>
            <div className="text-[#a1b0cb] text-[9px] uppercase tracking-wider">
              Avg Weekly Commits
            </div>
            <div className="text-white text-sm font-bold">
              {data.habits.weeklyCommits}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-[#1b2944] flex items-center justify-center">
            <Code className="w-4 h-4 text-[#e9b646]" />
          </div>
          <div>
            <div className="text-[#a1b0cb] text-[9px] uppercase tracking-wider">
              This Year
            </div>
            <div className="text-white text-sm font-bold">
              {data.habits.commitsThisYear.toLocaleString()} Commits
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StackCard({ data }: { data: PassportData }) {
  const renderSection = (title: string, tools: string[]) => {
    if (!tools || tools.length === 0) return null;
    return (
      <div className="mb-6 flex flex-col items-center">
        <div className="text-[#c09a5c] text-[10px] font-bold tracking-wider uppercase mb-3 text-center">
          {title}
        </div>
        <div className="flex justify-center gap-6">
          {tools.slice(0, 4).map((tool) => {
            const tech = getTechData(tool);
            return (
              <div key={tool} className="flex flex-col items-center">
                {React.createElement(tech.icon, {
                  className: "w-8 h-8 mb-2",
                  style: {
                    color: tech.color,
                    filter: `drop-shadow(0 0 5px ${tech.color}90)`,
                  },
                })}
                <span className="text-white text-[9px] font-medium text-center">
                  {tool}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <h3 className="text-center text-[#c09a5c] text-[10px] font-bold tracking-[0.1em] uppercase mb-4">
        Tech Stack
      </h3>
      <div className="flex-1 flex flex-col justify-center">
        {data.stack && data.stack.length > 0 ? (
          data.stack
            .slice(0, 4)
            .map((section, idx) => (
              <React.Fragment key={idx}>
                {renderSection(section.name, section.tools)}
              </React.Fragment>
            ))
        ) : (
          <>
            {renderSection("Frontend", ["React", "Next.js", "Tailwind CSS"])}
            {renderSection("Backend", ["Node.js", "Express", "FastAPI"])}
            {renderSection("Database", ["PostgreSQL", "MongoDB"])}
          </>
        )}
      </div>
    </>
  );
}

function OpenSourceCard({ data }: { data: PassportData }) {
  return (
    <>
      <h3 className="text-center text-[#c09a5c] text-[10px] font-bold tracking-[0.1em] uppercase mb-6">
        Open Source Activity
      </h3>

      <div className="space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <Code className="w-4 h-4 text-[#2ea043]" />
            </div>
            <span className="text-white text-xs font-bold">Repositories</span>
          </div>
          <span className="text-white text-sm font-mono">
            {data.stats.repositories}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <Star className="w-4 h-4 text-[#e3b341]" />
            </div>
            <span className="text-white text-xs font-bold">Stars</span>
          </div>
          <span className="text-white text-sm font-mono">
            {data.stats.stars.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <GitFork className="w-4 h-4 text-[#238636]" />
            </div>
            <span className="text-white text-xs font-bold">Forks</span>
          </div>
          <span className="text-white text-sm font-mono">
            {data.stats.forks.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <GitCommit className="w-4 h-4 text-[#a371f7]" />
            </div>
            <span className="text-white text-xs font-bold">Pull Requests</span>
          </div>
          <span className="text-white text-sm font-mono">
            {data.stats.pullRequests}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#3fb950]" />
            </div>
            <span className="text-white text-xs font-bold">Issues</span>
          </div>
          <span className="text-white text-sm font-mono">
            {data.stats.issues}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-[#8b949e]" />
            </div>
            <span className="text-white text-xs font-bold">Organizations</span>
          </div>
          <span className="text-white text-sm font-mono">
            {data.stats.organizations}
          </span>
        </div>
      </div>
    </>
  );
}

function MinimalCard({ data }: { data: PassportData }) {
  const primaryLang = data.languages[0]?.name || "Software";
  const jobTitle = `${primaryLang} Developer`;
  const levelNum = Math.floor(data.level.xp / 100) || 1;

  return (
    <div className="flex-1 flex flex-col justify-center text-center">
      <div className="mb-8">
        <Award className="w-8 h-8 text-[#e9b646] mx-auto mb-2" />
        <div className="text-[#a1b0cb] text-[10px] font-bold uppercase tracking-wider">
          Level {levelNum}
        </div>
        <div className="text-[#e9b646] text-2xl font-serif font-bold tracking-wide mt-1">
          {data.level.title}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 border-y border-[#1b2944] py-4">
        <div>
          <div className="text-white font-bold text-lg">
            {data.stats.stars.toLocaleString()}
          </div>
          <div className="text-[#a1b0cb] text-[9px] uppercase tracking-wider">
            Stars
          </div>
        </div>
        <div>
          <div className="text-white font-bold text-lg">
            {data.stats.repositories}
          </div>
          <div className="text-[#a1b0cb] text-[9px] uppercase tracking-wider">
            Repos
          </div>
        </div>
        <div>
          <div className="text-white font-bold text-lg">
            {data.stats.contributions.toLocaleString()}
          </div>
          <div className="text-[#a1b0cb] text-[9px] uppercase tracking-wider">
            Contribs
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#1b2944] rounded">
            {React.createElement(getTechData(primaryLang).icon, {
              className: "w-4 h-4",
              style: { color: getTechData(primaryLang).color },
            })}
          </div>
          <span className="text-white text-xs font-bold">{jobTitle}</span>
        </div>
        <QRCodePlaceholder />
      </div>
    </div>
  );
}

function LanguageCard({ data }: { data: PassportData }) {
  const topLangs = data.languages.slice(0, 3);
  while (topLangs.length < 3)
    topLangs.push({ name: "Unknown", value: 0, percent: 0 });

  return (
    <>
      <h3 className="text-center text-[#c09a5c] text-[10px] font-bold tracking-[0.2em] uppercase mb-12">
        Language Statistics
      </h3>
      <div className="flex justify-evenly items-end px-2 mt-auto mb-10 w-full">
        {topLangs.map((lang, idx) => {
          const tech = getTechData(lang.name);
          return (
            <ProgressRing
              key={idx}
              percent={lang.percent}
              color={tech.color}
              label={lang.name}
              icon={tech.icon}
            />
          );
        })}
      </div>
    </>
  );
}

const CARDS = [
  { id: "identity", label: "Identity Card", Component: IdentityCard },
  { id: "achievement", label: "Achievement Card", Component: AchievementsCard },
  { id: "habits", label: "Coding Habits Card", Component: HabitsCard },
  { id: "stack", label: "Tech Stack Card", Component: StackCard },
  { id: "opensource", label: "Open Source Card", Component: OpenSourceCard },
  { id: "minimal", label: "Minimal Card", Component: MinimalCard },
];

export default function ShareableCardsSection({
  data,
  handleExportCard,
}: {
  data: PassportData;
  handleExportCard: (idx: number) => Promise<void>;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    containScroll: false,
    slidesToScroll: 1,
  });
  const [selectedIdx, setSelectedIdx] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Overriding parent export function for these custom cards
  const exportCardLocal = async (index: number) => {
    const cardElementId = `share-card-v2-${index}`;
    const cardName = CARDS[index].id;
    const loadToast = toast.loading(
      `Generating high-res card: ${CARDS[index].label}...`,
    );

    try {
      await new Promise((r) => setTimeout(r, 200));
      const el = document.getElementById(cardElementId);
      if (!el) throw new Error("Card element not found.");

      const dataUrl = await toPng(el, {
        quality: 1.0,
        pixelRatio: 3, // Ultra HD export for these premium cards
        backgroundColor: "transparent",
      });

      const link = document.createElement("a");
      link.download = `${data.user.login}-${cardName}-card.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded successfully!", { id: loadToast });
      trackPassportExported("card_png", data, cardName);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate image.", { id: loadToast });
    }
  };

  return (
    <section className="mb-20">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-serif text-white tracking-tight font-extrabold uppercase">
          Premium Shareable Cards
        </h3>
        <p className="mt-2 text-slate-400 text-sm max-w-[500px] mx-auto leading-relaxed">
          Export handcrafted, leather-textured cards complete with dynamic
          icons, real achievements, and live data from your GitHub profile.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {CARDS.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition ${
              idx === selectedIdx
                ? "bg-[#e9b646]/20 border border-[#e9b646]/50 text-[#e9b646]"
                : "bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-400"
            }`}
          >
            {card.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-5xl mx-auto">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#1b2944] border border-[#243555] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#1b2944] border border-[#243555] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="overflow-hidden px-4 py-8" ref={emblaRef}>
          <div className="flex items-center">
            {CARDS.map((CardItem, idx) => (
              <div
                key={CardItem.id}
                className="flex-shrink-0 flex justify-center items-start"
                style={{ flex: "0 0 auto", width: "clamp(280px, 85vw, 400px)" }}
              >
                <div
                  className={`transition-all duration-500 origin-top ${
                    idx === selectedIdx
                      ? "scale-[0.75] h-[435px] sm:scale-[0.85] sm:h-[493px] md:scale-100 md:h-[580px] opacity-100 z-10"
                      : "scale-[0.65] h-[377px] sm:scale-[0.75] sm:h-[435px] md:scale-[0.85] md:h-[493px] opacity-50 blur-[1px]"
                  }`}
                >
                  <CardShell data={data} id={`share-card-v2-${idx}`}>
                    <CardItem.Component data={data} />
                  </CardShell>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[360px] mx-auto text-center mt-6">
        <button
          onClick={() => exportCardLocal(selectedIdx)}
          className="w-full py-4 bg-gradient-to-r from-[#e9b646] to-[#b47d2b] hover:from-[#f9d976] hover:to-[#e9b646] text-[#3d2a09] text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_20px_rgba(233,182,70,0.3)] active:scale-95 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Export {CARDS[selectedIdx].label}
        </button>
      </div>
    </section>
  );
}
