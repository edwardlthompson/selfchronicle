/** HO-04–07: MCP permission session + activity log (localStorage). */

export type McpUiScope = "read" | "write-evidence";

export type McpUiSession = {
  client: string;
  scopes: McpUiScope[];
  token: string;
  expiresAt: number;
  active: boolean;
};

export type McpActivity = {
  at: string;
  kind: string;
  detail: string;
};

const S_KEY = "sc.mcp.session";
const L_KEY = "sc.mcp.activity";

export function loadMcpSession(): McpUiSession | null {
  try {
    const raw = localStorage.getItem(S_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as McpUiSession;
    if (!s.active || Date.now() > s.expiresAt) return null;
    return s;
  } catch {
    return null;
  }
}

export function grantMcpSession(client: string, scopes: McpUiScope[]): McpUiSession {
  const session: McpUiSession = {
    client,
    scopes,
    token: `ui_${Math.random().toString(36).slice(2, 10)}`,
    expiresAt: Date.now() + 60 * 60_000,
    active: true,
  };
  localStorage.setItem(S_KEY, JSON.stringify(session));
  appendActivity("grant", `${client} ${scopes.join(",")}`);
  return session;
}

export function revokeMcpSession(): void {
  const prev = loadMcpSession();
  localStorage.removeItem(S_KEY);
  if (prev) appendActivity("revoke", prev.token);
}

export function loadActivity(): McpActivity[] {
  try {
    const raw = localStorage.getItem(L_KEY);
    return raw ? (JSON.parse(raw) as McpActivity[]) : [];
  } catch {
    return [];
  }
}

export function appendActivity(kind: string, detail: string): void {
  const next = [
    ...loadActivity(),
    { at: new Date().toISOString(), kind, detail },
  ].slice(-100);
  localStorage.setItem(L_KEY, JSON.stringify(next));
}
