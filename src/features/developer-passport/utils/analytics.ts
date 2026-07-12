"use client";

import posthog from "posthog-js";

import type { PassportData } from "../types/passport";

type AnalyticsProperties = Record<
  string,
  boolean | number | string | null | undefined
>;

const hasPostHogConfig = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
);

function capture(eventName: string, properties?: AnalyticsProperties) {
  if (!hasPostHogConfig) return;

  posthog.capture(eventName, {
    app_area: "developer_passport",
    ...properties,
  });
}

function getPassportMetrics(data: PassportData): AnalyticsProperties {
  const primaryLanguage = data.languages[0]?.name ?? null;
  const unlockedAchievements = data.achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;

  return {
    account_age_years: data.user.yearsCoding,
    active_days_this_year: data.stats.activeDaysThisYear ?? null,
    commits_this_year: data.stats.commitsThisYear ?? null,
    contributions: data.stats.contributions,
    developer_level: data.level.title,
    followers: data.stats.followers,
    forks: data.stats.forks,
    languages_count: data.languages.length,
    organizations_count: data.organizations.length,
    primary_language: primaryLanguage,
    pull_requests: data.stats.pullRequests,
    repositories: data.stats.repositories,
    stars: data.stats.stars,
    unlocked_achievements: unlockedAchievements,
  };
}

export function trackPassportGenerateStarted() {
  capture("passport_generate_started");
}

export function trackPassportGenerated(data: PassportData) {
  capture("passport_generated", getPassportMetrics(data));
}

export function trackPassportGenerateFailed(message: string) {
  capture("passport_generate_failed", {
    error_message: message,
  });
}

export function trackPassportExported(
  exportType: "card_png" | "passport_pdf" | "passport_spread_png",
  data: PassportData,
  detail?: string,
) {
  capture("passport_exported", {
    ...getPassportMetrics(data),
    export_detail: detail,
    export_type: exportType,
  });
}
