import React, { useState, useEffect } from "react";
import { Radar, Github } from "lucide-react";

const FUNNY_VERBS = [
  "SYNTHESIZING", "BREWING", "FORGING", "CONSTRUCTING", "ASSEMBLING",
  "SUMMONING", "DECRYPTING", "COMPILING", "GENERATING", "ORCHESTRATING",
  "CONJURING", "FABRICATING"
];

const LOADING_MESSAGES = [
  "Connecting to GitHub mainframes...",
  "Bribing octocats for repository access...",
  "Counting your excessive npm dependencies...",
  "Checking for pushed API keys (just kidding)...",
  "Analyzing late-night commit timestamps...",
  "Measuring your caffeine-to-code ratio...",
  "Applying gold leaf to your passport...",
];

export function LoaderScreen({ username }: { username: string }) {
  const [loadingText, setLoadingText] = useState("Initializing protocol...");
  const [verb, setVerb] = useState("SCOUTING");

  useEffect(() => {
    setVerb(FUNNY_VERBS[Math.floor(Math.random() * FUNNY_VERBS.length)]);
    
    // Pick random starting message
    let currentIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    setLoadingText(LOADING_MESSAGES[currentIndex]);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
      setLoadingText(LOADING_MESSAGES[currentIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050814] overflow-hidden select-none">
      
      {/* Background Dots Pattern (bottom area) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(74, 222, 128, 0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(74, 222, 128, 0.2) 2px, transparent 2px)`,
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(to top, black, transparent)"
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
        
        {/* Animated Icon Area */}
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
          {/* Outer glowing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping" style={{ animationDuration: '3s' }} />
          
          {/* Rotating Scanner */}
          <div className="absolute inset-0 rounded-full bg-green-500/10 blur-xl animate-pulse" />
          <Radar className="absolute inset-0 w-full h-full text-green-500/50 animate-spin" strokeWidth={1} style={{ animationDuration: '4s' }} />
          
          {/* Central Icon */}
          <div className="relative z-10 bg-slate-900 rounded-full p-4 border border-slate-700 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <Github className="w-12 h-12 text-slate-200" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-widest uppercase mb-6 flex items-center flex-wrap justify-center gap-x-3 text-center">
          {verb} <span className="text-green-400 font-mono tracking-tighter lowercase">@{username}</span>
        </h2>

        {/* Rotating Text */}
        <p className="text-slate-400 text-sm font-medium tracking-wide mb-6 h-6 transition-opacity duration-300 text-center">
          {loadingText}
        </p>

        {/* Glowing Progress Bar */}
        <div className="w-full max-w-[280px] h-[3px] bg-slate-800 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-green-400 to-green-500 rounded-full animate-[loading-bar_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
}
