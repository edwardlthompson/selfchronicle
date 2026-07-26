import type { VaultDocument } from "../vault/types";
import type { IdentityPatch } from "./identityPatch";
import { trimBioBlurb } from "./bioCompact";
import { extractOccupationTitles } from "./occupationTitles";

function parseGithubEvidenceBody(body: string): IdentityPatch {
  const patch: IdentityPatch = {};
  const profileLine = body.match(/Profile:\s*([^·]+)(?:\s*·\s*([^·]+))?(?:\s*·\s*bio\s*[“"]([^”"]+)[”"])?/i);
  if (profileLine?.[1]) {
    const name = profileLine[1].trim();
    if (name && !/^@/.test(name)) patch.displayName = name;
  }
  if (profileLine?.[2]) {
    const loc = profileLine[2].trim();
    if (loc && !/^location\s+n\/a$/i.test(loc)) patch.homeAddress = loc;
  }
  if (profileLine?.[3]) {
    patch.bioBlurb = trimBioBlurb(profileLine[3].trim());
  }
  const handle = body.match(/@([A-Za-z0-9_-]+)/);
  if (handle?.[1]) {
    patch.links = [`https://github.com/${handle[1]}`];
  }
  return patch;
}

function parseLinksLanderEvidence(body: string): IdentityPatch {
  const patch: IdentityPatch = {};
  const display = body.match(/Display name:\s*\*?\*?([^*\n]+)\*?\*?/i);
  if (display?.[1]) patch.displayName = display[1].trim();
  const siteHint = body.match(/Site hint:\s*(https?:\/\/\S+)/i);
  const urlLine = body.match(/URL:\s*(https?:\/\/\S+)/i);
  const site = siteHint?.[1] ?? urlLine?.[1];
  if (site) patch.links = [site.replace(/[.,;]+$/, "")];
  const signalsBlock = body.match(/## Distilled biography signals[^\n]*/i)?.[0];
  let signals = body;
  if (signalsBlock) {
    const start = body.indexOf(signalsBlock) + signalsBlock.length;
    signals = body.slice(start);
    const nextH2 = signals.search(/\n## [^#]/);
    if (nextH2 >= 0) signals = signals.slice(0, nextH2);
  }
  const roles = extractOccupationTitles(signals);
  if (roles.length) patch.occupations = roles;
  return patch;
}

function parseSiteUrlEvidence(body: string): IdentityPatch {
  const patch: IdentityPatch = {};
  const url = body.match(/URL:\s*(https?:\/\/\S+)/i);
  if (url?.[1]) patch.links = [url[1].replace(/[.,;]+$/, "")];
  return patch;
}

/** Infer identity from structured evidence fields only (GitHub pack, LinksLander, site URL). */
export function extractFromEvidence(evidence: VaultDocument[]): IdentityPatch {
  const patch: IdentityPatch = {};
  for (const ev of evidence) {
    const title = ev.frontmatter.title.trim();
    const body = ev.body.trim();
    const tags = ev.frontmatter.tags ?? [];
    if (!body) continue;

    if (/github\s*public\s*portfolio/i.test(title) || tags.includes("github")) {
      Object.assign(patch, parseGithubEvidenceBody(body));
    }
    if (/linkslander|personal\s*site/i.test(title) || tags.includes("linkslander")) {
      const ll = parseLinksLanderEvidence(body);
      if (ll.displayName && !patch.displayName) patch.displayName = ll.displayName;
      if (ll.links?.length) patch.links = [...(patch.links ?? []), ...ll.links];
      if (ll.occupations?.length) {
        patch.occupations = [...(patch.occupations ?? []), ...ll.occupations];
      }
    }
    if (/personal\s*site\s*url/i.test(title) || (tags.includes("website") && /URL:/i.test(body))) {
      patch.links = [...(patch.links ?? []), ...(parseSiteUrlEvidence(body).links ?? [])];
    }

    const loc = body.match(/Location \(public\):\s*([^\n.]+)/i);
    if (loc?.[1] && !patch.homeAddress) patch.homeAddress = loc[1].trim();

    const nameVariants = body.match(/Name variants \(public\):\s*([^;\n]+)/i);
    if (nameVariants?.[1] && !patch.displayName) {
      patch.displayName = nameVariants[1].split(/;/)[0]!.trim();
    }
  }

  if (patch.links) patch.links = [...new Set(patch.links)];
  return patch;
}
