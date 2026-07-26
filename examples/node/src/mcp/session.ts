export type McpScope = "read" | "write-evidence";

export type McpSession = {
  token: string;
  client: string;
  scopes: McpScope[];
  expiresAt: number;
};

export type ActivityEntry = {
  at: string;
  kind: "grant" | "revoke" | "call" | "deny" | "confirm";
  detail: string;
};

export type SessionStore = {
  grant: (client: string, scopes: McpScope[]) => McpSession;
  revoke: (token: string) => boolean;
  get: (token: string) => McpSession | null;
  hasScope: (session: McpSession, scope: McpScope) => boolean;
  log: ActivityEntry[];
  record: (kind: ActivityEntry["kind"], detail: string) => void;
};

export function createSessionStore(ttlMs = 60 * 60_000): SessionStore {
  const sessions = new Map<string, McpSession>();
  const log: ActivityEntry[] = [];
  const record = (kind: ActivityEntry["kind"], detail: string) => {
    log.push({ at: new Date().toISOString(), kind, detail });
  };
  const get = (token: string): McpSession | null => {
    const s = sessions.get(token);
    if (!s) return null;
    if (Date.now() > s.expiresAt) {
      sessions.delete(token);
      record("revoke", `${token} expired`);
      return null;
    }
    return s;
  };
  return {
    log,
    record,
    get,
    hasScope(session, scope) {
      if (scope === "read") {
        return session.scopes.includes("read") || session.scopes.includes("write-evidence");
      }
      return session.scopes.includes(scope);
    },
    grant(client, scopes) {
      const token = `mcp_${Math.random().toString(36).slice(2, 12)}`;
      const session: McpSession = {
        token,
        client,
        scopes: [...new Set(scopes)],
        expiresAt: Date.now() + ttlMs,
      };
      sessions.set(token, session);
      record("grant", `${client} scopes=${session.scopes.join(",")}`);
      return session;
    },
    revoke(token) {
      const ok = sessions.delete(token);
      if (ok) record("revoke", token);
      return ok;
    },
  };
}
