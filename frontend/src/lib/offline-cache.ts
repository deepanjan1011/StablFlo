const PREFIX = "stablflo_cache_";

export function cacheSet(key: string, data: unknown): void {
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function cacheGet<T>(key: string): { data: T; ts: number } | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
