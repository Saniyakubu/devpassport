"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { toast } from "sonner";

import { fetchPassportData } from "../services/passport-api";
import type { PassportData } from "../types/passport";
import {
  trackPassportGenerateFailed,
  trackPassportGenerated,
  trackPassportGenerateStarted,
} from "../utils/analytics";

function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ["#b9922c", "#f0d98c", "#1e3a8a", "#0f172a"],
  });
}

export function usePassportGenerator() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [data, setData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generatePassport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, "");
    if (!cleanUsername) return;

    setLoading(true);
    setError("");
    const loadToast = toast.loading(`Analyzing GitHub profile for @${cleanUsername}...`);
    trackPassportGenerateStarted();

    try {
      const payload = await queryClient.fetchQuery({
        queryKey: ["github-passport", cleanUsername.toLowerCase()],
        queryFn: () => fetchPassportData(cleanUsername),
      });

      setData(payload);
      toast.success("Passport data loaded successfully!", { id: loadToast });
      trackPassportGenerated(payload);
      triggerConfetti();
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Could not generate passport.";

      setError(message);
      toast.error(message || "GitHub fetch failed", { id: loadToast });
      trackPassportGenerateFailed(message);
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    error,
    generatePassport,
    loading,
    setUsername,
    username,
  };
}
