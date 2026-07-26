import { beforeEach, describe, expect, it } from "vitest";
import { setLocale } from "../i18n";
import { IMPORT_SOURCES, importFormatKeys } from "./ImportSourcesCatalog";
import { renderImportSourcesGuide } from "./ImportSourcesGuide";
import { renderImportView } from "./ImportView";
import { registeredFormatKeys } from "./adapters/registry";
import { setImportSelectedFormat } from "./session";

describe("ImportSourcesGuide", () => {
  beforeEach(() => {
    setLocale("en");
    setImportSelectedFormat("manual_paste");
  });

  it("lists every catalog platform name and format key", () => {
    const html = renderImportSourcesGuide({ selectedFormat: "chatgpt_json" });
    expect(html).toContain('data-testid="import-sources-guide"');
    expect(html).toContain("ChatGPT");
    expect(html).toContain("Claude");
    expect(html).toContain("Grok / xAI");
    expect(html).toContain("Gemini");
    expect(html).toContain("Gmail");
    expect(html).toContain("WhatsApp");
    expect(html).toContain("Meta / Facebook");
    expect(html).toContain("Discord");
    expect(html).toContain("Slack");
    expect(html).toContain("GitHub");
    expect(html).toContain("Manual paste");
    for (const key of importFormatKeys()) {
      expect(html).toContain(`data-import-select-format="${key}"`);
      expect(html).toContain(key);
    }
  });

  it("includes at least 10 https tutorial links with safe target attrs", () => {
    const html = renderImportSourcesGuide();
    const links = html.match(/href="https:\/\/[^"]+"/g) ?? [];
    expect(links.length).toBeGreaterThanOrEqual(10);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Export from app settings → paste here");
  });

  it("marks selected format and exposes import icon controls", () => {
    const html = renderImportSourcesGuide({ selectedFormat: "whatsapp_txt" });
    expect(html).toContain('data-format="whatsapp_txt"');
    expect(html).toContain("is-selected");
    expect(html).toContain("sc-import-source-icon-btn");
    expect(IMPORT_SOURCES.every((s) => s.icon.length > 0)).toBe(true);
  });

  it("registry covers every catalog formatKey", () => {
    const registered = new Set(registeredFormatKeys());
    for (const key of importFormatKeys()) {
      expect(registered.has(key)).toBe(true);
    }
  });

  it("vault import view mounts the guide and selected format", () => {
    setImportSelectedFormat("claude_export");
    const html = renderImportView(null);
    expect(html).toContain('data-testid="import-sources-guide"');
    expect(html).toContain('data-testid="import-format-selected"');
    expect(html).toContain("claude_export");
    expect(html).toContain("data-import-parse-selected");
  });
});
