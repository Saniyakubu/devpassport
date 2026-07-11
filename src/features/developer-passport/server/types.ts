export type GitHubUser = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
};

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  created_at: string;
  size: number;
};

export type GitHubOrg = {
  login: string;
  avatar_url: string;
  description: string | null;
};

export type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo?: { name: string; url: string };
  payload?: {
    action?: string;
    commits?: { sha: string; message: string }[];
    pull_request?: { html_url?: string };
    issue?: { html_url?: string };
  };
};

export type GitHubSearchResponse = {
  total_count: number;
  incomplete_results: boolean;
};

export type ContributionDay = {
  date: string;
  weekday: number;
  contributionCount: number;
  color?: string;
};

export type ContributionSummary = {
  source: "github-calendar-scrape" | "rest-events-fallback";
  totalContributions: number;
  commitContributions: number | null;
  pullRequestContributions: number | null;
  issueContributions: number | null;
  pullRequestReviewContributions: number | null;
  repositoryContributions: number | null;
  activeDaysThisYear: number;
  longestStreak: number;
  currentStreak: number;
  mostActiveDay: string;
  averageWeeklyContributions: number;
  contributionDays: ContributionDay[];
};

export type SearchCount = {
  value: number | null;
  source: "rest-search" | "unavailable";
};
