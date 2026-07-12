"use client";

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

import type { PassportData } from "../types/passport";
import { trackPassportExported } from "../utils/analytics";

const CARD_NAMES = [
  "identity",
  "achievement",
  "habits",
  "techstack",
  "opensource",
  "minimal",
  "terminal",
  "stamps",
  "dna",
];

const CARD_LABELS = [
  "Identity Card",
  "Achievement Card",
  "Coding Habits Card",
  "Tech Stack Card",
  "Open Source Card",
  "Minimal Card",
  "Retro Terminal Card",
  "Passport Stamp Card",
  "Developer DNA Card",
];

export function usePassportExports(data: PassportData | null) {
  async function handleExportCard(index: number) {
    if (!data) return;

    const cardElementId = `share-card-${index}`;
    const cardName = CARD_NAMES[index] || "card";
    const loadToast = toast.loading(
      `Generating high-res card: ${CARD_LABELS[index] || "Card"}...`,
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const element = document.getElementById(cardElementId);
      if (!element) throw new Error("Card element not found.");

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });

      const link = document.createElement("a");
      link.download = `${data.user.login}-${cardName}-card.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded successfully!", { id: loadToast });
      trackPassportExported("card_png", data, cardName);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate image. Please try again.", { id: loadToast });
    }
  }

  async function handleExportPdf() {
    if (!data) return;

    const loadToast = toast.loading("Building PDF passport spreads...");
    try {
      const spreads = document.querySelectorAll(".passport-export-spread");
      if (!spreads.length) throw new Error("Passport spreads not found");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [840, 560],
      });

      for (let index = 0; index < spreads.length; index += 1) {
        const dataUrl = await toPng(spreads[index] as HTMLElement, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: "transparent",
        });

        if (index > 0) pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 20, 20, 800, 520);
      }

      pdf.save(`${data.user.login}-developer-passport.pdf`);
      toast.success("PDF saved successfully!", { id: loadToast });
      trackPassportExported("passport_pdf", data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.", { id: loadToast });
    }
  }

  async function handleScreenshot() {
    if (!data) return;

    const loadToast = toast.loading("Capturing screenshot...");
    try {
      const element = document.getElementById("passport-stage-container");
      if (!element) throw new Error("Passport container not found");

      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: "transparent",
      });

      const link = document.createElement("a");
      link.download = `${data.user.login}-passport-spread.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Screenshot saved!", { id: loadToast });
      trackPassportExported("passport_spread_png", data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to capture screenshot.", { id: loadToast });
    }
  }

  return {
    handleExportCard,
    handleExportPdf,
    handleScreenshot,
  };
}
