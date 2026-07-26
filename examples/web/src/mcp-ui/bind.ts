import {
  grantMcpSession,
  loadActivity,
  loadMcpSession,
  revokeMcpSession,
  type McpUiScope,
} from "./session";
import { renderMcpPanel } from "./McpPanel";

export function mcpPanelHtml(): string {
  return renderMcpPanel(loadMcpSession(), loadActivity());
}

export function bindMcpPanel(root: HTMLElement, redraw: () => void): void {
  root.querySelector("[data-mcp-allow]")?.addEventListener("click", () => {
    const client =
      root.querySelector<HTMLInputElement>("[data-mcp-client]")?.value.trim() || "Cursor";
    const scopes: McpUiScope[] = [];
    if (root.querySelector<HTMLInputElement>("[data-mcp-scope-read]")?.checked) {
      scopes.push("read");
    }
    if (root.querySelector<HTMLInputElement>("[data-mcp-scope-write]")?.checked) {
      scopes.push("write-evidence");
    }
    if (scopes.length === 0) scopes.push("read");
    grantMcpSession(client, scopes);
    redraw();
  });
  root.querySelector("[data-mcp-revoke]")?.addEventListener("click", () => {
    revokeMcpSession();
    redraw();
  });
}
