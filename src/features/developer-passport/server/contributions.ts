import { DAY_NAMES } from "./constants";
import type { ContributionDay, ContributionSummary, GitHubEvent } from "./types";

export function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function startOfYear() {
  return `${new Date().getUTCFullYear()}-01-01`;
}

export function endOfYear() {
  return `${new Date().getUTCFullYear()}-12-31`;
}

export function analyzeContributionDays(
  days: ContributionDay[],
  source: ContributionSummary["source"],
  totals?: Partial<ContributionSummary>,
): ContributionSummary {
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const totalContributions =
    totals?.totalContributions ??
    sortedDays.reduce((sum, day) => sum + day.contributionCount, 0);
  const activeDaysThisYear = sortedDays.filter((day) => day.contributionCount > 0).length;
  const weekdayTotals = new Map<number, number>();

  let longestStreak = 0;
  let currentRun = 0;
  for (const day of sortedDays) {
    if (day.contributionCount > 0) {
      currentRun += 1;
      longestStreak = Math.max(longestStreak, currentRun);
      weekdayTotals.set(day.weekday, (weekdayTotals.get(day.weekday) ?? 0) + day.contributionCount);
    } else {
      currentRun = 0;
    }
  }

  let currentStreak = 0;
  for (let index = sortedDays.length - 1; index >= 0; index -= 1) {
    if (sortedDays[index].contributionCount <= 0) break;
    currentStreak += 1;
  }

  const mostActiveWeekday =
    [...weekdayTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    new Date().getUTCDay();

  return {
    source,
    totalContributions,
    commitContributions: totals?.commitContributions ?? null,
    pullRequestContributions: totals?.pullRequestContributions ?? null,
    issueContributions: totals?.issueContributions ?? null,
    pullRequestReviewContributions: totals?.pullRequestReviewContributions ?? null,
    repositoryContributions: totals?.repositoryContributions ?? null,
    activeDaysThisYear,
    longestStreak,
    currentStreak,
    mostActiveDay: DAY_NAMES[mostActiveWeekday],
    averageWeeklyContributions: Math.round(totalContributions / 52),
    contributionDays: sortedDays,
  };
}

export async function scrapePublicContributionCalendar(login: string) {
  const from = startOfYear();
  const to = endOfYear();
  const response = await fetch(
    `https://github.com/users/${login}/contributions?from=${from}&to=${to}`,
    {
      headers: {
        "User-Agent": "DeveloperPassport/1.0",
        Accept: "text/html",
      },
      next: { revalidate: 900 },
    },
  );

  if (!response.ok) return null;

  const html = await response.text();
  const daysByDate = new Map<string, ContributionDay>();
  const tooltipCounts = new Map<string, number>();
  const headingTotalMatch = html.match(
    /<h2[^>]*id="js-contribution-activity-description"[^>]*>[\s\S]*?([\d,]+)\s+contributions/i,
  );
  const headingTotal = headingTotalMatch
    ? Number(headingTotalMatch[1].replace(/,/g, ""))
    : null;
  const tooltipPattern =
    /<tool-tip[^>]*\sfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;

  for (const match of html.matchAll(tooltipPattern)) {
    const targetId = match[1];
    const label = match[2];
    const countMatch = label.match(/([\d,]+)\s+contributions?/i);
    const contributionCount = countMatch
      ? Number(countMatch[1].replace(/,/g, ""))
      : 0;

    tooltipCounts.set(targetId, contributionCount);
  }

  const tagPattern = /<(?:td|rect)[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g;

  for (const match of html.matchAll(tagPattern)) {
    const tag = match[0];
    const date = match[1];
    const countMatch =
      tag.match(/data-count="(\d+)"/) ??
      tag.match(/aria-label="(\d+)\s+contributions?/i);
    const id = tag.match(/\sid="([^"]+)"/)?.[1];
    const level = Number(tag.match(/data-level="(\d+)"/)?.[1] ?? "0");
    const contributionCount = countMatch
      ? Number(countMatch[1])
      : id && tooltipCounts.has(id)
        ? tooltipCounts.get(id) ?? 0
        : level > 0
          ? level
          : 0;

    daysByDate.set(date, {
      date,
      contributionCount,
      weekday: new Date(`${date}T00:00:00Z`).getUTCDay(),
    });
  }

  return daysByDate.size
    ? analyzeContributionDays([...daysByDate.values()], "github-calendar-scrape", {
        totalContributions: headingTotal ?? undefined,
      })
    : null;
}

export function contributionSummaryFromEvents(events: GitHubEvent[]) {
  const today = new Date();
  const dayMap = new Map<string, number>();

  for (const event of events) {
    const key = dateOnly(new Date(event.created_at));
    const weight = event.payload?.commits?.length ?? 1;
    dayMap.set(key, (dayMap.get(key) ?? 0) + weight);
  }

  const days: ContributionDay[] = [];
  const year = today.getUTCFullYear();
  const cursor = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  while (cursor <= end) {
    const date = dateOnly(cursor);
    days.push({
      date,
      contributionCount: dayMap.get(date) ?? 0,
      weekday: cursor.getUTCDay(),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return analyzeContributionDays(days, "rest-events-fallback");
}
