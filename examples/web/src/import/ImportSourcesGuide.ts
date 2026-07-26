import { t } from "../i18n";
import { IMPORT_SOURCES, type ImportSourceEntry } from "./ImportSourcesCatalog";

export type ImportSourcesGuideOpts = {
  selectedFormat?: string;
  compact?: boolean;
};

function escapeAttr(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function tutorialCell(s: ImportSourceEntry): string {
  if (!s.tutorialUrl) {
    return `<span class="sc-import-source-nolink">${t("import.sources.paste_path")}</span>`;
  }
  const href = escapeAttr(s.tutorialUrl);
  return `<a class="sc-import-source-tutorial" href="${href}" target="_blank" rel="noopener noreferrer">${t("import.sources.tutorial")}</a>`;
}

function row(s: ImportSourceEntry, selected: string | undefined, compact: boolean): string {
  const active = selected === s.formatKey ? " is-selected" : "";
  const name = t(s.nameKey);
  const howto = compact ? "" : `<span class="sc-import-source-howto">${t(s.howtoKey)}</span>`;
  const fmt = escapeAttr(s.formatKey);
  const label = escapeAttr(`${t("import.sources.import_as")} ${name}`);
  return `<li class="sc-import-source${active}" data-format="${fmt}" data-source-key="${escapeAttr(s.sourceKey)}">
    <button type="button" class="sc-import-source-icon-btn" data-import-select-format="${fmt}" aria-label="${label}" title="${label}">
      <span class="sc-import-source-icon" aria-hidden="true">${s.icon}</span>
    </button>
    <div class="sc-import-source-body">
      <span class="sc-import-source-name">${name}</span>
      ${howto}
      <span class="sc-import-source-format" data-testid="import-format-${fmt}">${fmt}</span>
    </div>
    ${tutorialCell(s)}
    <button type="button" class="sc-btn sc-import-source-pick" data-import-select-format="${fmt}">${t("import.sources.import")}</button>
  </li>`;
}

/** Shared platform list with tutorial links + format-select Import controls. */
export function renderImportSourcesGuide(opts: ImportSourcesGuideOpts = {}): string {
  const compact = Boolean(opts.compact);
  const selected = opts.selectedFormat;
  const rows = IMPORT_SOURCES.map((s) => row(s, selected, compact)).join("");
  const title = compact ? t("import.sources.title_compact") : t("import.sources.title");
  const cls = compact ? "sc-import-sources is-compact" : "sc-import-sources";
  return `<div class="${cls}" data-testid="import-sources-guide">
    <h3 class="sc-section-title">${title}</h3>
    <p class="gp-body">${t("import.sources.intro")}</p>
    <ul class="sc-import-source-list">${rows}</ul>
  </div>`;
}
