import type { SeedBundle } from "../profile/seedBundle";

export type GhUser = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  public_repos: number;
  html_url: string;
};

export type GhRepo = {
  name: string;
  description: string | null;
  language: string | null;
  fork: boolean;
  html_url: string;
  license: { spdx_id?: string } | null;
};

export function assembleGithubBundle(
  user: GhUser,
  own: GhRepo[],
  topLangs: string[],
  date: string,
): SeedBundle {
  const display = user.name ?? user.login;
  const links = own.find((r) => /linkslander/i.test(r.name) || /links/i.test(r.name));
  const siteHint = links?.description?.match(/https?:\/\/[^\s)]+/)?.[0];
  const repoLines = own
    .map((r) => `- ${r.name} — ${r.description ?? r.language ?? "public repo"}`)
    .join("\n");
  const evidence: SeedBundle["evidence"] = [
    {
      title: "GitHub public portfolio snapshot",
      body: [
        `Public GitHub snapshot for @${user.login} (${date}).`,
        `Profile: ${display} · ${user.location ?? "location n/a"} · bio “${user.bio ?? ""}”.`,
        `Account since ${user.created_at.slice(0, 10)} · ~${user.public_repos} public repos.`,
        "",
        "Highlighted public repos:",
        repoLines || "(none)",
        "",
        `Source: ${user.html_url} — official public API, not private data.`,
      ].join("\n"),
      tags: ["github", "import", "provisional"],
      source: "other_archive",
      channel: "other",
    },
    {
      title: "GitHub README & language deep dive",
      body: [
        `Public languages pack (${date}) for @${user.login}.`,
        `Top languages by bytes: ${topLangs.join(", ") || "n/a"}.`,
        "",
        "Repo licenses / primaries:",
        ...own.map(
          (r) =>
            `- ${r.name}: ${r.language ?? "?"} · ${r.license?.spdx_id ?? "license n/a"}`,
        ),
        "",
        "Source: public GitHub /languages API — not private data.",
      ].join("\n"),
      tags: ["github", "readme", "languages", "import", "provisional"],
      source: "other_archive",
      channel: "other",
    },
  ];
  if (links) {
    evidence.push({
      title: "LinksLander personal site (public)",
      body: [
        `Detected public links repo: ${links.name} (${date}).`,
        siteHint ? `Site hint: ${siteHint}` : `URL: ${links.html_url}`,
        links.description ?? "",
        "Source: public GitHub repo metadata — not private data.",
      ].join("\n"),
      tags: ["linkslander", "website", "import", "provisional"],
      source: "other_archive",
      channel: "other",
    });
  }
  return {
    evidence,
    chapters: [
      {
        title: `Maker profile — ${display}`,
        body: [
          `${display} (@${user.login}) — provisional chapter from public GitHub.`,
          user.bio ? `Bio: “${user.bio}”.` : "",
          user.location ? `Location: ${user.location}.` : "",
          topLangs.length ? `Active languages: ${topLangs.join(", ")}.` : "",
          "",
          "Edit freely. Soft layers not inferred.",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
    facts: [
      {
        title: "GitHub identity",
        body: `Uses ${user.login} on GitHub${user.location ? `; location ${user.location}` : ""}${user.bio ? `; bio “${user.bio}”` : ""}.`,
      },
      ...(topLangs.length
        ? [{ title: "Active stacks", body: `Public language signal: ${topLangs.join(", ")}.` }]
        : []),
      ...(siteHint || links
        ? [
            {
              title: "Personal site",
              body: siteHint ?? `Public links repo ${links!.name} at ${links!.html_url}.`,
            },
          ]
        : []),
    ],
  };
}
