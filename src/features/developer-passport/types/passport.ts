export type PassportData = {
  user: {
    login: string;
    id: number;
    avatarUrl: string;
    url: string;
    name: string;
    bio: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    publicRepos: number;
    publicGists: number;
    followers: number;
    following: number;
    createdAt: string;
    yearsCoding: number;
  };
  stats: {
    repositories: number;
    fetchedRepositories?: number;
    ownedRepositories?: number;
    sourceRepositories: number;
    followers: number;
    following: number;
    stars: number;
    forks: number;
    organizations: number;
    publicGists: number;
    commits?: number;
    commitsThisYear?: number;
    contributions: number;
    pullRequests: number;
    issues: number;
    activeDaysThisYear?: number;
    topRepoStars?: number;
  };
  scouting: {
    label: string;
    value: number;
    detail: string;
    score: number;
    source: string;
  }[];
  playstyles: string[];
  languages: { name: string; value: number; percent: number }[];
  stack: { name: string; strength: number; tools: string[] }[];
  level: { title: string; progress: number; next: string; xp: number };
  habits: {
    mostActiveDay: string;
    peakCodingTime: string;
    preferredTime: string;
    longestStreak: number;
    weeklyCommits: number;
    commitsThisYear: number;
    consistency: number;
    archetype: string;
  };
  dna: { name: string; value: number }[];
  achievements: { name: string; unlocked: boolean; progress: number }[];
  organizations: {
    login: string;
    avatarUrl: string;
    description: string | null;
  }[];
  repositories: {
    name: string;
    description: string | null;
    stars: number;
    forks: number;
    language: string | null;
    url: string;
  }[];
  timeline: { label: string; date: string; detail: string }[];
  interpretation: { headline: string; body: string };
  dataSources?: Record<string, string | string[]>;
  generatedAt: string;
};
