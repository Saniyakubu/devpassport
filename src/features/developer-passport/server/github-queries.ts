import { githubFetchOptional, githubPaginate } from "./github-client";
import type {
  GitHubOrg,
  GitHubSearchResponse,
  GitHubUser,
  SearchCount,
} from "./types";

function restSearchUrl(path: "commits" | "issues", query: string) {
  const params = new URLSearchParams({
    q: query,
    per_page: "1",
  });
  return `https://api.github.com/search/${path}?${params.toString()}`;
}

export async function githubSearchCount(
  path: "commits" | "issues",
  query: string,
): Promise<SearchCount> {
  const response = await githubFetchOptional<GitHubSearchResponse>(
    restSearchUrl(path, query),
  );

  return response
    ? { value: response.total_count, source: "rest-search" }
    : { value: null, source: "unavailable" };
}

export async function fetchVisibleOrganizations(login: string) {
  const publicOrgsPromise = githubPaginate<GitHubOrg>(
    `https://api.github.com/users/${login}/orgs?per_page=100`,
    5,
  ).catch(() => []);

  if (!process.env.GITHUB_TOKEN) {
    return {
      organizations: await publicOrgsPromise,
      source: "GET /users/{username}/orgs public memberships",
    };
  }

  const viewer = await githubFetchOptional<Pick<GitHubUser, "login">>(
    "https://api.github.com/user",
  );

  if (viewer?.login.toLowerCase() === login.toLowerCase()) {
    const viewerOrgs = await githubPaginate<GitHubOrg>(
      "https://api.github.com/user/orgs?per_page=100",
      5,
    ).catch(() => []);

    if (viewerOrgs.length) {
      return {
        organizations: viewerOrgs,
        source: "GET /user/orgs authenticated viewer memberships",
      };
    }
  }

  return {
    organizations: await publicOrgsPromise,
    source: "GET /users/{username}/orgs public memberships",
  };
}
