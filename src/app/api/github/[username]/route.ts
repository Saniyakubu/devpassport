type GitHubUser = {
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

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
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

type GitHubOrg = {
  login: string;
  avatar_url: string;
  description: string | null;
};

type GitHubEvent = {
  type: string;
  created_at: string;
  repo?: { name: string };
  payload?: {
    commits?: { sha: string; message: string }[];
    action?: string;
    ref_type?: string;
  };
};

const languageGroups: Record<string, string> = {
  TypeScript: "Frontend",
  JavaScript: "Frontend",
  HTML: "Frontend",
  CSS: "Frontend",
  SCSS: "Frontend",
  Vue: "Frontend",
  Svelte: "Frontend",
  Python: "AI",
  R: "AI",
  Jupyter: "AI",
  Go: "Backend",
  Rust: "Backend",
  Java: "Backend",
  C: "Backend",
  "C++": "Backend",
  "C#": "Backend",
  PHP: "Backend",
  Ruby: "Backend",
  Kotlin: "Mobile",
  Swift: "Mobile",
  Dart: "Mobile",
  Shell: "DevOps",
  Dockerfile: "DevOps",
  HCL: "Cloud",
  SQL: "Database",
};

const topicGroups: Record<string, string> = {
  react: "Frontend",
  nextjs: "Frontend",
  vue: "Frontend",
  svelte: "Frontend",
  node: "Backend",
  express: "Backend",
  fastapi: "Backend",
  django: "Backend",
  postgres: "Database",
  mysql: "Database",
  mongodb: "Database",
  redis: "Database",
  aws: "Cloud",
  azure: "Cloud",
  gcp: "Cloud",
  docker: "DevOps",
  kubernetes: "DevOps",
  testing: "Testing",
  vitest: "Testing",
  jest: "Testing",
  playwright: "Testing",
  reactnative: "Mobile",
  flutter: "Mobile",
  ai: "AI",
  ml: "AI",
  llm: "AI",
};

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

async function githubFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`${response.status}:${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function yearsSince(date: string) {
  return Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
    ),
  );
}

function levelFor(score: number) {
  if (score > 3000) return { title: "Legend", progress: 94, next: "Hall of Fame" };
  if (score > 1600) return { title: "Innovator", progress: 76, next: "Legend" };
  if (score > 850) return { title: "Architect", progress: 61, next: "Innovator" };
  if (score > 350) return { title: "Maintainer", progress: 48, next: "Architect" };
  if (score > 120) return { title: "Builder", progress: 37, next: "Maintainer" };
  return { title: "Explorer", progress: 24, next: "Builder" };
}

function activeHourLabel(hour: number) {
  if (hour < 5) return "Deep night";
  if (hour < 11) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Late night";
}

function escapeName(input: string) {
  return input.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 39);
}

export async function GET(
  _request: Request,
  context: { params: Promise<unknown> },
) {
  const params = (await context.params) as { username?: string };
  const username = params.username ?? "";
  const login = escapeName(username);

  if (!login) {
    return Response.json({ message: "Invalid GitHub username." }, { status: 400 });
  }

  try {
    const [user, repos, orgs, events] = await Promise.all([
      githubFetch<GitHubUser>(`https://api.github.com/users/${login}`),
      githubFetch<GitHubRepo[]>(
        `https://api.github.com/users/${login}/repos?per_page=100&sort=updated&type=owner`,
      ),
      githubFetch<GitHubOrg[]>(`https://api.github.com/users/${login}/orgs?per_page=50`),
      githubFetch<GitHubEvent[]>(
        `https://api.github.com/users/${login}/events/public?per_page=100`,
      ).catch(() => []),
    ]);

    const languageMaps = await Promise.all(
      repos
        .filter((repo) => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 16)
        .map((repo) =>
          githubFetch<Record<string, number>>(
            `https://api.github.com/repos/${repo.full_name}/languages`,
          ).catch(() => ({})),
        ),
    );

    const languages = new Map<string, number>();
    for (const repo of repos) {
      if (repo.language) {
        languages.set(repo.language, (languages.get(repo.language) ?? 0) + repo.size);
      }
    }
    for (const map of languageMaps) {
      for (const [language, bytes] of Object.entries(map)) {
        languages.set(language, (languages.get(language) ?? 0) + bytes / 1024);
      }
    }

    const languageTotal = [...languages.values()].reduce((sum, value) => sum + value, 0) || 1;
    const languageBreakdown = [...languages.entries()]
      .map(([name, value]) => ({
        name,
        value,
        percent: Math.max(1, Math.round((value / languageTotal) * 100)),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const sourceRepos = repos.filter((repo) => !repo.fork);
    const stars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const forks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const issues = repos.reduce((sum, repo) => sum + repo.open_issues_count, 0);
    const eventCommits = events.reduce(
      (sum, event) => sum + (event.payload?.commits?.length ?? 0),
      0,
    );
    const pushEvents = events.filter((event) => event.type === "PushEvent");
    const prEvents = events.filter((event) => event.type === "PullRequestEvent");
    const issueEvents = events.filter((event) => event.type === "IssuesEvent");

    const groupScores = new Map<string, number>();
    for (const repo of repos) {
      if (repo.language && languageGroups[repo.language]) {
        groupScores.set(
          languageGroups[repo.language],
          (groupScores.get(languageGroups[repo.language]) ?? 0) + 2,
        );
      }
      for (const topic of repo.topics ?? []) {
        const normalized = topic.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (topicGroups[normalized]) {
          groupScores.set(
            topicGroups[normalized],
            (groupScores.get(topicGroups[normalized]) ?? 0) + 3,
          );
        }
      }
    }

    const stack = [
      "Frontend",
      "Backend",
      "Database",
      "Cloud",
      "DevOps",
      "Testing",
      "Mobile",
      "AI",
    ].map((name) => ({
      name,
      strength: Math.min(100, 24 + (groupScores.get(name) ?? 0) * 12),
      tools: repos
        .flatMap((repo) => [repo.language, ...(repo.topics ?? [])])
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index)
        .slice(0, 4),
    }));

    const score =
      user.public_repos * 12 +
      stars * 9 +
      forks * 7 +
      user.followers * 5 +
      eventCommits * 8 +
      orgs.length * 30 +
      yearsSince(user.created_at) * 35;
    const level = levelFor(score);

    const dayCounts = new Map<string, number>();
    const hourCounts = new Map<number, number>();
    for (const event of events) {
      const date = new Date(event.created_at);
      const day = date.toLocaleDateString("en", { weekday: "long", timeZone: "UTC" });
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
      hourCounts.set(date.getUTCHours(), (hourCounts.get(date.getUTCHours()) ?? 0) + 1);
    }
    const activeDay = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Tuesday";
    const peakHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 20;

    const dna = [
      { name: "Builder", value: Math.min(96, 35 + sourceRepos.length * 5) },
      { name: "Maintainer", value: Math.min(96, 30 + stars / 4 + forks / 3) },
      { name: "Collaborator", value: Math.min(96, 28 + orgs.length * 12 + prEvents.length * 5) },
      { name: "Explorer", value: Math.min(96, 32 + languageBreakdown.length * 8) },
      { name: "Debugger", value: Math.min(96, 34 + issueEvents.length * 6 + issues / 2) },
      { name: "Teacher", value: Math.min(96, 26 + user.followers / 5 + user.public_gists * 2) },
      { name: "Innovator", value: Math.min(96, 29 + stars / 5 + sourceRepos.length * 3) },
    ].map((item) => ({ ...item, value: Math.round(item.value) }));

    const achievements = [
      { name: "First Repository", unlocked: sourceRepos.length > 0, progress: 100 },
      { name: "100 Commits", unlocked: eventCommits >= 100, progress: Math.min(100, eventCommits) },
      { name: "100 Stars", unlocked: stars >= 100, progress: Math.min(100, stars) },
      { name: "Maintainer", unlocked: forks >= 20 || stars >= 50, progress: Math.min(100, forks * 5) },
      { name: "Open Source", unlocked: orgs.length > 0 || prEvents.length > 0, progress: Math.min(100, orgs.length * 34 + prEvents.length * 10) },
      { name: "Full Stack", unlocked: (groupScores.get("Frontend") ?? 0) > 0 && (groupScores.get("Backend") ?? 0) > 0, progress: Math.min(100, (groupScores.get("Frontend") ?? 0) * 18 + (groupScores.get("Backend") ?? 0) * 18) },
      { name: "AI Builder", unlocked: (groupScores.get("AI") ?? 0) > 0, progress: Math.min(100, (groupScores.get("AI") ?? 0) * 25) },
      { name: "Bug Hunter", unlocked: issueEvents.length > 3, progress: Math.min(100, issueEvents.length * 20) },
    ];

    const firstRepo = sourceRepos.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )[0];
    const topRepos = [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
      }));

    const consistency = Math.min(99, Math.max(18, events.length));
    const generatedAt = new Date().toISOString();

    return Response.json({
      user: {
        login: user.login,
        id: user.id,
        avatarUrl: user.avatar_url,
        url: user.html_url,
        name: user.name || user.login,
        bio: user.bio,
        company: user.company,
        blog: user.blog,
        location: user.location,
        publicRepos: user.public_repos,
        publicGists: user.public_gists,
        followers: user.followers,
        following: user.following,
        createdAt: user.created_at,
        yearsCoding: yearsSince(user.created_at),
      },
      stats: {
        repositories: user.public_repos,
        sourceRepositories: sourceRepos.length,
        followers: user.followers,
        following: user.following,
        stars,
        forks,
        organizations: orgs.length,
        publicGists: user.public_gists,
        contributions: eventCommits,
        pullRequests: prEvents.length,
        issues: issueEvents.length,
      },
      languages: languageBreakdown,
      stack,
      level: { ...level, xp: Math.round(score) },
      habits: {
        mostActiveDay: activeDay,
        peakCodingTime: `${String(peakHour).padStart(2, "0")}:00 UTC`,
        preferredTime: activeHourLabel(peakHour),
        longestStreak: Math.max(1, Math.min(21, Math.round(pushEvents.length / 2))),
        weeklyCommits: Math.round(eventCommits / 4),
        commitsThisYear: Math.max(eventCommits, Math.round(eventCommits * 5.2)),
        consistency,
        archetype: peakHour >= 20 || peakHour < 5 ? "Night Owl" : "Day Builder",
      },
      dna,
      achievements,
      organizations: orgs.slice(0, 6).map((org) => ({
        login: org.login,
        avatarUrl: org.avatar_url,
        description: org.description,
      })),
      repositories: topRepos,
      timeline: [
        { label: "Joined GitHub", date: user.created_at, detail: "Passport issued" },
        firstRepo
          ? { label: "First Repository", date: firstRepo.created_at, detail: firstRepo.name }
          : null,
        { label: "Latest Public Activity", date: events[0]?.created_at ?? generatedAt, detail: events[0]?.type ?? "Profile verified" },
        { label: "Passport Generated", date: generatedAt, detail: "Developer Passport v1" },
      ].filter(Boolean),
      interpretation: {
        headline:
          dna[0].value >= dna[1].value
            ? "Original-project energy with a strong shipping bias."
            : "Maintainer energy with a durable open-source footprint.",
        body:
          "This passport blends public repositories, languages, stars, organizations, and recent activity into a readable developer identity. It favors meaningful signals over vanity metrics, so every page explains what the numbers imply.",
      },
      generatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub request failed";
    const status = message.startsWith("404") ? 404 : 502;
    return Response.json(
      {
        message:
          status === 404
            ? "GitHub user not found."
            : "GitHub is unavailable or rate limited. Try again shortly.",
      },
      { status },
    );
  }
}
