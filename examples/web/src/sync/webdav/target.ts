/** User-owned WebDAV age-pack sync target (ciphertext only). */

export type WebDavTarget = {
  url: string;
  username: string;
  /** Never persist password in this stub; use session secret store later. */
  pathPrefix: string;
  ciphertext: true;
  enabled: boolean;
};

const KEY = "sc.sync.webdav.target";

export function defaultTarget(): WebDavTarget {
  return {
    url: "",
    username: "",
    pathPrefix: "/selfchronicle/age-packs",
    ciphertext: true,
    enabled: false,
  };
}

export function loadTarget(): WebDavTarget {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultTarget();
    const parsed = JSON.parse(raw) as Partial<WebDavTarget>;
    return {
      ...defaultTarget(),
      ...parsed,
      ciphertext: true,
      url: String(parsed.url ?? ""),
      username: String(parsed.username ?? ""),
      pathPrefix: String(parsed.pathPrefix ?? defaultTarget().pathPrefix),
      enabled: Boolean(parsed.enabled),
    };
  } catch {
    return defaultTarget();
  }
}

export function saveTarget(target: Omit<WebDavTarget, "ciphertext"> & { ciphertext?: boolean }): void {
  const next: WebDavTarget = {
    url: target.url.trim(),
    username: target.username.trim(),
    pathPrefix: target.pathPrefix.trim() || defaultTarget().pathPrefix,
    ciphertext: true,
    enabled: Boolean(target.enabled),
  };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function assertCiphertextTarget(t: WebDavTarget): void {
  if (t.ciphertext !== true) throw new Error("plaintext WebDAV sync forbidden");
}
