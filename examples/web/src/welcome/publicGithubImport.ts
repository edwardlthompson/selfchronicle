import type { SeedBundle } from "../profile/seedBundle";
import {
  assembleGithubBundle,
  type GhRepo,
  type GhUser,
} from "./assembleGithubBundle";

async function ghJson<T>(url: string, fetchImpl: typeof fetch): Promise<T> {
  const res = await fetchImpl(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${url}`);
  return (await res.json()) as T;
}

async function collectTopLangs(
  login: string,
  repos: GhRepo[],
  fetchImpl: typeof fetch,
): Promise<string[]> {
  const langTotals = new Map<string, number>();
  for (const r of repos.slice(0, 8)) {
    try {
      const langs = await ghJson<Record<string, number>>(
        `https://api.github.com/repos/${login}/${r.name}/languages`,
        fetchImpl,
      );
      for (const [k, v] of Object.entries(langs)) {
        langTotals.set(k, (langTotals.get(k) ?? 0) + v);
      }
    } catch {
      /* skip */
    }
  }
  return [...langTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k]) => k);
}

/** Live public GitHub → SeedBundle. Requires network; no bundled personal fallback. */
export async function importPublicGithubProfile(
  username: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SeedBundle> {
  const login = username.trim().replace(/^@/, "");
  if (!login) throw new Error("username_required");
  const user = await ghJson<GhUser>(`https://api.github.com/users/${login}`, fetchImpl);
  const repos = await ghJson<GhRepo[]>(
    `https://api.github.com/users/${login}/repos?per_page=100&sort=updated`,
    fetchImpl,
  );
  const own = repos.filter((r) => !r.fork).slice(0, 12);
  const topLangs = await collectTopLangs(login, own, fetchImpl);
  return assembleGithubBundle(user, own, topLangs, new Date().toISOString().slice(0, 10));
}

export function previewSeedBundle(bundle: SeedBundle): {
  count: number;
  sampleTitles: string[];
  hasLinksLander: boolean;
} {
  const titles = [
    ...bundle.evidence.map((e) => e.title),
    ...bundle.chapters.map((c) => `bio: ${c.title}`),
    ...bundle.facts.map((f) => `fact: ${f.title}`),
  ];
  return {
    count: titles.length,
    sampleTitles: titles.slice(0, 8),
    hasLinksLander: bundle.evidence.some((e) => e.tags.includes("linkslander")),
  };
}
