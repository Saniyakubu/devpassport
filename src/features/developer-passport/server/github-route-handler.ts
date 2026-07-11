import { REST_API_VERSION, languageGroups, topicGroups } from "./constants";
import {
  contributionSummaryFromEvents,
  scrapePublicContributionCalendar,
  startOfYear,
} from "./contributions";
import { githubFetch, githubPaginate } from "./github-client";
import { fetchVisibleOrganizations, githubSearchCount } from "./github-queries";
import type {
  GitHubEvent,
  GitHubRepo,
  GitHubUser,
} from "./types";

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
  if (score > 350) return { title: "Builder", progress: 48, next: "Architect" };
  if (score > 120) return { title: "Explorer", progress: 37, next: "Builder" };
  return { title: "Newcomer", progress: 24, next: "Explorer" };
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

function scoreMetric(value: number, excellentAt: number) {
  if (excellentAt <= 0) return 0;
  return Math.min(99, Math.max(1, Math.round((value / excellentAt) * 100)));
}

function buildAchievements(input: {
  sourceRepos: number;
  commits: number;
  stars: number;
  pullRequests: number;
  issues: number;
  languageCount: number;
  activeDaysThisYear: number;
  organizations: number;
  topRepoStars: number;
  topics: string[];
}) {
  const hasDocsTopic = input.topics.includes("documentation") || input.topics.includes("docs");
  const hasAiTopic = input.topics.some((topic) => ["ai", "ml", "llm"].includes(topic));

  return [
    {
      name: "First Repository",
      unlocked: input.sourceRepos > 0,
      progress: input.sourceRepos > 0 ? 100 : 0,
      evidence: `${input.sourceRepos} source repositories found`,
      source: "rest-repositories",
    },
    {
      name: "First Pull Request",
      unlocked: input.pullRequests > 0,
      progress: input.pullRequests > 0 ? 100 : 0,
      evidence: `${input.pullRequests} authored pull requests found`,
      source: "rest-search",
    },
    {
      name: "100 Commits",
      unlocked: input.commits >= 100,
      progress: Math.min(100, input.commits),
      evidence: `${input.commits} authored commits found`,
      source: "rest-search",
    },
    {
      name: "1000 Commits",
      unlocked: input.commits >= 1000,
      progress: Math.min(100, Math.round(input.commits / 10)),
      evidence: `${input.commits} authored commits found`,
      source: "rest-search",
    },
    {
      name: "100 Stars",
      unlocked: input.stars >= 100,
      progress: Math.min(100, input.stars),
      evidence: `${input.stars} stars earned across owned repos`,
      source: "rest-repositories",
    },
    {
      name: "1000 Stars",
      unlocked: input.stars >= 1000,
      progress: Math.min(100, Math.round(input.stars / 10)),
      evidence: `${input.stars} stars earned across owned repos`,
      source: "rest-repositories",
    },
    {
      name: "Top Repo 100 Stars",
      unlocked: input.topRepoStars >= 100,
      progress: Math.min(100, input.topRepoStars),
      evidence: `${input.topRepoStars} stars on top owned repository`,
      source: "rest-repositories",
    },
    {
      name: "Organization Member",
      unlocked: input.organizations > 0,
      progress: input.organizations > 0 ? 100 : 0,
      evidence: `${input.organizations} visible organizations found`,
      source: "rest-organizations",
    },
    {
      name: "Polyglot",
      unlocked: input.languageCount >= 5,
      progress: Math.min(100, input.languageCount * 20),
      evidence: `${input.languageCount} repository languages detected`,
      source: "rest-languages",
    },
    {
      name: "100 Active Days",
      unlocked: input.activeDaysThisYear >= 100,
      progress: Math.min(100, input.activeDaysThisYear),
      evidence: `${input.activeDaysThisYear} active days this year`,
      source: "github-calendar-scrape",
    },
    {
      name: "Issue Tracker",
      unlocked: input.issues > 0,
      progress: input.issues > 0 ? 100 : 0,
      evidence: `${input.issues} authored issues found`,
      source: "rest-search",
    },
    {
      name: "Documentation",
      unlocked: hasDocsTopic,
      progress: hasDocsTopic ? 100 : 0,
      evidence: hasDocsTopic ? "Documentation topic detected" : "No documentation topic detected",
      source: "rest-repositories",
    },
    {
      name: "AI Builder",
      unlocked: hasAiTopic,
      progress: hasAiTopic ? 100 : 0,
      evidence: hasAiTopic ? "AI/ML topic detected" : "No AI/ML topic detected",
      source: "rest-repositories",
    },
  ];
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ username?: string }> },
) {
  const { username = "" } = await context.params;
  const login = escapeName(username);

  if (!login) {
    return Response.json({ message: "Invalid GitHub username." }, { status: 400 });
  }

  try {
    const currentYear = new Date().getUTCFullYear();
    const [user, repos, orgResult, events, commitSearch, commitSearchThisYear, prSearch, issueSearch] =
      await Promise.all([
        githubFetch<GitHubUser>(`https://api.github.com/users/${login}`),
        githubPaginate<GitHubRepo>(
          `https://api.github.com/users/${login}/repos?per_page=100&sort=updated&type=owner`,
          process.env.GITHUB_TOKEN ? 20 : 4,
        ),
        fetchVisibleOrganizations(login),
        githubPaginate<GitHubEvent>(
          `https://api.github.com/users/${login}/events/public?per_page=100`,
          3,
        ).catch(() => []),
        githubSearchCount("commits", `author:${login}`),
        githubSearchCount("commits", `author:${login} committer-date:${currentYear}-01-01..${currentYear}-12-31`),
        githubSearchCount("issues", `author:${login} type:pr`),
        githubSearchCount("issues", `author:${login} type:issue`),
      ]);

    const scrapedContributionSummary = await scrapePublicContributionCalendar(login).catch(() => null);
    const contributionSummary =
      scrapedContributionSummary ?? contributionSummaryFromEvents(events);

    const ownedRepos = repos.filter(
      (repo) => repo.owner.login.toLowerCase() === login.toLowerCase(),
    );
    const sourceRepos = ownedRepos.filter((repo) => !repo.fork);
    const languageRepoLimit = process.env.GITHUB_TOKEN
      ? sourceRepos.length
      : Math.min(30, sourceRepos.length);
    const languageMaps = await Promise.all(
      sourceRepos.slice(0, languageRepoLimit).map((repo) =>
        githubFetch<Record<string, number>>(
          `https://api.github.com/repos/${repo.full_name}/languages`,
        )
          .then((languages) => ({ repoId: repo.id, languages }))
          .catch(() => ({ repoId: repo.id, languages: null })),
      ),
    );

    const languages = new Map<string, number>();
    const reposWithLanguageMaps = new Set<number>();
    for (const { repoId, languages: map } of languageMaps) {
      if (!map) continue;
      reposWithLanguageMaps.add(repoId);
      for (const [language, bytes] of Object.entries(map)) {
        languages.set(language, (languages.get(language) ?? 0) + bytes);
      }
    }

    for (const repo of sourceRepos) {
      if (!reposWithLanguageMaps.has(repo.id) && repo.language) {
        languages.set(repo.language, (languages.get(repo.language) ?? 0) + Math.max(1, repo.size * 1024));
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
      .slice(0, 10);

    const stars = ownedRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const forks = ownedRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const topRepoStars = ownedRepos.reduce((max, repo) => Math.max(max, repo.stargazers_count), 0);
    const eventCommits = events.reduce(
      (sum, event) => sum + (event.payload?.commits?.length ?? 0),
      0,
    );
    const prEvents = events.filter((event) => event.type === "PullRequestEvent");
    const issueEvents = events.filter((event) => event.type === "IssuesEvent");
    const commits = commitSearch.value ?? eventCommits;
    const commitsThisYear = commitSearchThisYear.value ?? eventCommits;
    const pullRequests = prSearch.value ?? prEvents.length;
    const issues = issueSearch.value ?? issueEvents.length;
    const allTopics = sourceRepos
      .flatMap((repo) => repo.topics ?? [])
      .map((topic) => topic.toLowerCase().replace(/[^a-z0-9]/g, ""));

    const groupScores = new Map<string, number>();
    for (const repo of sourceRepos) {
      if (repo.language && languageGroups[repo.language]) {
        for (const group of languageGroups[repo.language]) {
          groupScores.set(group, (groupScores.get(group) ?? 0) + 2);
        }
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
    ].map((categoryName) => {
      // Collect tools (languages + topics) that belong to THIS category
      const categoryTools = new Set<string>();

      for (const repo of sourceRepos) {
        // Check if the repo's primary language belongs to this category
        if (repo.language && languageGroups[repo.language]?.includes(categoryName)) {
          categoryTools.add(repo.language);
        }
        // Check each topic
        for (const topic of repo.topics ?? []) {
          const normalized = topic.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (topicGroups[normalized] === categoryName) {
            // Use the readable topic name (capitalize first letter)
            const readable = topic.charAt(0).toUpperCase() + topic.slice(1);
            categoryTools.add(readable);
          }
        }
      }

      // Also add well-known frameworks from languages in this category
      // e.g. if someone uses TypeScript + has "react" topic, React goes to Frontend
      const knownTools: Record<string, string[]> = {
        Frontend: ["React", "Next.js", "Vue", "Svelte", "Angular", "Tailwind CSS", "HTML", "CSS"],
        Backend: ["Node.js", "Express", "Django", "FastAPI", "Go", "Rust", "Java", "PHP", "Ruby", "C", "C++", "C#"],
        Database: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQL", "Firebase", "Convex"],
        Cloud: ["AWS", "Azure", "GCP", "Cloudflare", "HCL"],
        DevOps: ["Docker", "Kubernetes", "Shell", "Dockerfile"],
        Testing: ["Vitest", "Jest", "Playwright"],
        Mobile: ["Kotlin", "Swift", "Dart", "Flutter", "React Native"],
        AI: ["Python", "R", "Jupyter"],
      };

      return {
        name: categoryName,
        strength: Math.min(100, 24 + (groupScores.get(categoryName) ?? 0) * 12),
        tools: [...categoryTools]
          .filter((tool) => {
            // Filter out category names themselves (e.g. "frontend" is not a tool)
            const lower = tool.toLowerCase();
            return !["frontend", "backend", "database", "cloud", "devops", "testing", "mobile", "ai", "ml", "llm"].includes(lower);
          })
          .slice(0, 6),
      };
    }).filter((cat) => cat.tools.length > 0);

    const organizations = orgResult.organizations;
    const score =
      user.public_repos * 12 +
      stars * 9 +
      forks * 7 +
      user.followers * 5 +
      commits * 4 +
      contributionSummary.activeDaysThisYear * 6 +
      organizations.length * 30 +
      yearsSince(user.created_at) * 35;
    const level = levelFor(score);

    const hourCounts = new Map<number, number>();
    for (const event of events) {
      const date = new Date(event.created_at);
      hourCounts.set(date.getUTCHours(), (hourCounts.get(date.getUTCHours()) ?? 0) + 1);
    }
    const peakHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 20;

    const dna = [
      { name: "Builder", value: Math.min(96, 35 + sourceRepos.length * 5) },
      { name: "Sustainer", value: Math.min(96, 30 + stars / 4 + forks / 3) },
      { name: "Collaborator", value: Math.min(96, 28 + organizations.length * 12 + pullRequests * 3) },
      { name: "Explorer", value: Math.min(96, 32 + languageBreakdown.length * 8) },
      { name: "Debugger", value: Math.min(96, 34 + issues * 2) },
      { name: "Teacher", value: Math.min(96, 26 + user.followers / 5 + user.public_gists * 2) },
      { name: "Innovator", value: Math.min(96, 29 + stars / 5 + sourceRepos.length * 3) },
    ].map((item) => ({ ...item, value: Math.round(item.value) }));

    const achievements = buildAchievements({
      sourceRepos: sourceRepos.length,
      commits,
      stars,
      pullRequests,
      issues,
      languageCount: languageBreakdown.length,
      activeDaysThisYear: contributionSummary.activeDaysThisYear,
      organizations: organizations.length,
      topRepoStars,
      topics: allTopics,
    });

    const firstRepo = [...sourceRepos].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )[0];
    const topRepos = [...ownedRepos]
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
        fetchedRepositories: repos.length,
        ownedRepositories: ownedRepos.length,
        sourceRepositories: sourceRepos.length,
        followers: user.followers,
        following: user.following,
        stars,
        forks,
        organizations: organizations.length,
        publicGists: user.public_gists,
        commits,
        commitsThisYear,
        contributions: contributionSummary.totalContributions,
        pullRequests,
        issues,
        activeDaysThisYear: contributionSummary.activeDaysThisYear,
        topRepoStars,
        pullRequestReviews: 0,
        repositoryContributions: null,
      },
      scouting: [
        { label: "Commits", value: commits, detail: `${commits.toLocaleString()} commits`, score: scoreMetric(commits, 1100), source: commitSearch.source },
        { label: "Stars earned", value: stars, detail: `${stars.toLocaleString()} stars`, score: scoreMetric(stars, 25), source: "rest-repositories" },
        { label: "Top repo reach", value: topRepoStars, detail: `${topRepoStars.toLocaleString()} stars`, score: scoreMetric(topRepoStars, 20), source: "rest-repositories" },
        { label: "Pull requests", value: pullRequests, detail: `${pullRequests.toLocaleString()} PRs`, score: scoreMetric(pullRequests, 150), source: prSearch.source },
        { label: "Followers", value: user.followers, detail: `${user.followers.toLocaleString()} followers`, score: scoreMetric(user.followers, 40), source: "rest-user" },
        { label: "Languages", value: languageBreakdown.length, detail: `${languageBreakdown.length} languages`, score: scoreMetric(languageBreakdown.length, 10), source: "rest-languages" },
        { label: "Contributions", value: contributionSummary.totalContributions, detail: `${contributionSummary.totalContributions.toLocaleString()} contributions`, score: scoreMetric(contributionSummary.totalContributions, 2500), source: contributionSummary.source },
        { label: "Account age", value: yearsSince(user.created_at), detail: `${yearsSince(user.created_at)} yrs`, score: scoreMetric(yearsSince(user.created_at), 8), source: "rest-user" },
      ],
      playstyles: [
        `${contributionSummary.activeDaysThisYear} active days this year.`,
        contributionSummary.averageWeeklyContributions >= 20 ? "Workhorse" : "Steady Builder",
        languageBreakdown.length >= 5 ? "Polyglot" : "Focused Stack",
      ],
      contributionCalendar: contributionSummary,
      languages: languageBreakdown,
      stack,
      level: { ...level, xp: Math.round(score), derived: true },
      habits: {
        mostActiveDay: contributionSummary.mostActiveDay,
        peakCodingTime: `${String(peakHour).padStart(2, "0")}:00 UTC`,
        preferredTime: activeHourLabel(peakHour),
        longestStreak: contributionSummary.longestStreak,
        weeklyCommits: contributionSummary.averageWeeklyContributions,
        commitsThisYear,
        contributionsThisYear: contributionSummary.totalContributions,
        activeDaysThisYear: contributionSummary.activeDaysThisYear,
        consistency: Math.min(99, Math.round((contributionSummary.activeDaysThisYear / 365) * 100)),
        archetype: peakHour >= 20 || peakHour < 5 ? "Night Owl" : "Day Builder",
      },
      dna,
      achievements,
      organizations: organizations.slice(0, 12).map((org) => ({
        login: org.login,
        avatarUrl: org.avatar_url,
        description: org.description,
      })),
      repositories: topRepos,
      pinnedRepositories: [],
      timeline: [
        { label: "Joined GitHub", date: user.created_at, detail: "Passport issued" },
        firstRepo
          ? { label: "First Repository", date: firstRepo.created_at, detail: firstRepo.name }
          : null,
        { label: "Contribution Year", date: `${startOfYear()}T00:00:00Z`, detail: `${contributionSummary.totalContributions.toLocaleString()} contributions recorded` },
        { label: "Passport Generated", date: generatedAt, detail: "Developer Passport v2" },
      ].filter(Boolean),
      interpretation: {
        headline:
          contributionSummary.activeDaysThisYear >= 100
            ? "Consistent contribution rhythm across the year."
            : "Focused bursts of public GitHub activity.",
        body:
          `This REST-first passport found ${commits.toLocaleString()} commits, ${pullRequests.toLocaleString()} pull requests, ${stars.toLocaleString()} stars, and ${contributionSummary.activeDaysThisYear} active days. Passport levels and DNA labels are derived from GitHub data and are not native GitHub fields.`,
      },
      dataSources: {
        restApiVersion: REST_API_VERSION,
        profile: "GET /users/{username}",
        repositories: "GET /users/{username}/repos?type=owner with pagination",
        organizations: orgResult.source,
        events: "GET /users/{username}/events/public with pagination",
        commitCount: commitSearch.source === "rest-search" ? "GET /search/commits?q=author:{username}" : "recent public events fallback",
        pullRequests: prSearch.source === "rest-search" ? "GET /search/issues?q=author:{username}+type:pr" : "recent public events fallback",
        issues: issueSearch.source === "rest-search" ? "GET /search/issues?q=author:{username}+type:issue" : "recent public events fallback",
        languages: "GET /repos/{owner}/{repo}/languages for owned source repositories",
        contributionCalendar: contributionSummary.source,
        pinnedRepositories: "unavailable-in-github-rest",
        unavailableInRest: ["pinned repositories", "private contribution detail for other users"],
        derivedFields: ["level", "dna", "achievements", "scouting.score", "playstyles"],
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
