import { t } from "../i18n";
import type { McpActivity, McpUiSession } from "./session";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderMcpPanel(session: McpUiSession | null, log: McpActivity[]): string {
  const active = session
    ? `<div data-testid="mcp-active">
        <p>${t("mcp.active")}: <strong>${escape(session.client)}</strong></p>
        <p>${t("mcp.scopes")}: ${escape(session.scopes.join(", "))}</p>
        <button type="button" data-mcp-revoke>${t("mcp.revoke")}</button>
      </div>`
    : `<div data-testid="mcp-grant" class="sc-stack">
        <p class="gp-body">${t("mcp.intro")}</p>
        <label class="sc-field sc-field-row">
          <span>${t("mcp.client")}</span>
          <input data-mcp-client value="Cursor"/>
        </label>
        <label class="sc-field">
          <input type="checkbox" data-mcp-scope-read checked/>
          <span>read</span>
        </label>
        <label class="sc-field">
          <input type="checkbox" data-mcp-scope-write/>
          <span>write-evidence</span>
        </label>
        <button type="button" class="sc-btn" data-mcp-allow>${t("mcp.allow")}</button>
      </div>`;

  const rows = log
    .slice()
    .reverse()
    .slice(0, 20)
    .map((e) => `<li><code>${escape(e.kind)}</code> ${escape(e.detail)}</li>`)
    .join("");

  return `<section data-testid="mcp-panel">
    <h2>${t("mcp.title")}</h2>
    ${active}
    <h3>${t("mcp.activity")}</h3>
    <ul data-testid="mcp-activity">${rows || `<li>${t("mcp.activity_empty")}</li>`}</ul>
  </section>`;
}
