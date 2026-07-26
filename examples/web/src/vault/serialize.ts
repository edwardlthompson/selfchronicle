import type { VaultFrontmatter } from "./types";

function yamlValue(v: unknown): string {
  if (Array.isArray(v)) {
    return `[${v.map((x) => String(x)).join(", ")}]`;
  }
  if (typeof v === "string") {
    if (v === "" || /[:#\[\]{}\n]/.test(v) || v.includes(" ")) {
      return JSON.stringify(v);
    }
    return v;
  }
  return String(v);
}

export function serializeDocument(fm: VaultFrontmatter, body: string): string {
  const lines = [
    "---",
    `id: ${fm.id}`,
    `type: ${fm.type}`,
    `title: ${yamlValue(fm.title)}`,
    `created_at: ${fm.created_at}`,
    `updated_at: ${fm.updated_at}`,
    `ingested_at: ${fm.ingested_at}`,
    `tags: [${fm.tags.join(", ")}]`,
    `status: ${fm.status}`,
    `user_edited: ${fm.user_edited}`,
    "provenance:",
    `  source: ${fm.provenance.source}`,
  ];
  if (fm.provenance.source_id) {
    lines.push(`  source_id: ${yamlValue(fm.provenance.source_id)}`);
  }
  if (fm.provenance.import_job_id) {
    lines.push(`  import_job_id: ${fm.provenance.import_job_id}`);
  }
  if (fm.provenance.transformer) {
    lines.push(`  transformer: ${fm.provenance.transformer}`);
  }
  if (fm.provenance.confidence != null) {
    lines.push(`  confidence: ${fm.provenance.confidence}`);
  }
  lines.push(
    "links:",
    `  evidence: [${fm.links.evidence.join(", ")}]`,
    `  facts: [${fm.links.facts.join(", ")}]`,
    `  attachments: [${fm.links.attachments.join(", ")}]`,
    "---",
    "",
    body.replace(/^\n+/, ""),
  );
  return lines.join("\n");
}
