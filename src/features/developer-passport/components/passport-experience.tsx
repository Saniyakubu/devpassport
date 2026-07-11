import { Camera, Download } from "lucide-react";

import PassportBook from "@/components/PassportBook";
import ShareableCardsSection from "@/components/ShareableCardsSection";

import type { PassportData } from "../types/passport";

type PassportExperienceProps = {
  currentPage: number;
  data: PassportData;
  handleExportCard: (index: number) => Promise<void>;
  handleExportPdf: () => void;
  handleScreenshot: () => void;
  setCurrentPage: (page: number) => void;
};

export function PassportExperience({
  currentPage,
  data,
  handleExportCard,
  handleExportPdf,
  handleScreenshot,
  setCurrentPage,
}: PassportExperienceProps) {
  return (
    <>
      <div aria-hidden="true">
        <PassportBook data={data} exportMode />
      </div>

      <div className="mb-20">
        <div className="mb-6 text-center">
          <h3 className="font-serif text-2xl font-bold uppercase tracking-wide text-slate-200">
            Digital Passport Booklet
          </h3>
          <span className="font-mono text-xs tracking-wider text-slate-500">
            Draggable corners, sound feedback, page indexing
          </span>
        </div>

        <div className="flex w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-900 bg-slate-950/40 p-2 shadow-3xl md:p-6">
          <div
            id="passport-stage-container"
            className="flex h-[260px] min-w-[850px] origin-top scale-[0.42] justify-center min-[400px]:h-[300px] min-[400px]:scale-[0.5] sm:h-[450px] sm:scale-75 md:h-[500px] md:scale-90 lg:h-auto lg:origin-center lg:scale-100"
          >
            <PassportBook
              data={data}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleScreenshot}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <Camera className="h-4 w-4" /> Take a Screenshot
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <Download className="h-4 w-4" /> Download PDF Spread
          </button>
        </div>
      </div>

      <ShareableCardsSection data={data} handleExportCard={handleExportCard} />
    </>
  );
}
