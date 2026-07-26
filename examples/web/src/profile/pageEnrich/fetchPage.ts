import type { PageFetchResult } from "./types";

const DEFAULT_TIMEOUT_MS = 8_000;

/** Fetch a public page the user explicitly asked to enrich. Fails gracefully on CORS/network errors. */
export async function fetchPublicPage(
  url: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<PageFetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      headers: { Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    });
    if (!res.ok) {
      return { ok: false, url, error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    if (!html.trim()) return { ok: false, url, error: "empty_response" };
    return { ok: true, url, html };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const friendly = /abort|timeout/i.test(msg) ? "timeout" : /cors|failed to fetch|network/i.test(msg) ? "fetch_blocked" : msg;
    return { ok: false, url, error: friendly };
  } finally {
    clearTimeout(timer);
  }
}
