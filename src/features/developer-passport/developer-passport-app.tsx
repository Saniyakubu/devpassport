"use client";

import { useState } from "react";
import { Toaster } from "sonner";

import { LoaderScreen } from "@/components/LoaderScreen";

import { AppFooter } from "./components/app-footer";
import { AppHeader } from "./components/app-header";
import { HeroSection } from "./components/hero-section";
import { PassportExperience } from "./components/passport-experience";
import { UsernameForm } from "./components/username-form";
import { usePassportExports } from "./hooks/use-passport-exports";
import { usePassportGenerator } from "./hooks/use-passport-generator";

export default function DeveloperPassportApp() {
  const [currentPage, setCurrentPage] = useState(0);
  const { data, error, generatePassport, loading, setUsername, username } =
    usePassportGenerator();
  const { handleExportCard, handleExportPdf, handleScreenshot } =
    usePassportExports(data);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030611] text-slate-100">
      <Toaster position="bottom-right" theme="dark" />

      {loading && <LoaderScreen username={username} />}

      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black, transparent 80%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-8">
        <AppHeader />
        <HeroSection />
        <UsernameForm
          error={error}
          loading={loading}
          onSubmit={generatePassport}
          setUsername={setUsername}
          username={username}
        />

        {data && (
          <PassportExperience
            currentPage={currentPage}
            data={data}
            handleExportCard={handleExportCard}
            handleExportPdf={handleExportPdf}
            handleScreenshot={handleScreenshot}
            setCurrentPage={setCurrentPage}
          />
        )}

        <AppFooter />
      </div>
    </main>
  );
}
