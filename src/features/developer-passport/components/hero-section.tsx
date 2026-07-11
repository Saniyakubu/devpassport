import { MiniPassportCover } from "./mini-passport-cover";

export function HeroSection() {
  return (
    <div className="relative mx-auto mb-14 max-w-[800px] text-center">
      <div className="pointer-events-auto absolute -left-24 top-4 z-0 hidden lg:flex">
        <MiniPassportCover color="#061A3A" title="Standard Issue" tilt="-rotate-12" />
      </div>
      <div className="pointer-events-auto absolute -right-24 top-4 z-0 hidden lg:flex">
        <MiniPassportCover color="#6B1D25" title="Elite Tier" tilt="rotate-12" />
      </div>

      <h2 className="font-serif text-5xl font-extrabold leading-none tracking-tight text-white md:text-6xl">
        Your GitHub <span className="gold-foil">Identity</span>, Visualized
      </h2>
      <p className="mx-auto mt-4 max-w-[640px] text-base leading-relaxed text-slate-400 md:text-lg">
        Generate stunning developer passports and shareable cards from any GitHub profile.
      </p>
    </div>
  );
}
