import { REST_API_VERSION } from "./constants";

export function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": REST_API_VERSION,
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

export async function githubFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`${response.status}:${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function githubFetchOptional<T>(url: string): Promise<T | null> {
  try {
    return await githubFetch<T>(url);
  } catch {
    return null;
  }
}

export async function githubPaginate<T>(url: string, maxPages = 10): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | null = url;
  let page = 0;

  while (nextUrl && page < maxPages) {
    const response = await fetch(nextUrl, {
      headers: githubHeaders(),
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`${response.status}:${response.statusText}`);
    }

    results.push(...((await response.json()) as T[]));
    nextUrl = parseNextLink(response.headers.get("link"));
    page += 1;
  }

  return results;
}

function parseNextLink(linkHeader: string | null) {
  if (!linkHeader) return null;

  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match?.[2] === "next") return match[1];
  }

  return null;
}
