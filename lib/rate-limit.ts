// Simple in-memory rate limiter
// For production with multiple instances, replace with Redis-backed solution

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10;            // max attempts per window

// Clean up expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export async function rateLimit(
  identifier: string,
  options?: { windowMs?: number; max?: number }
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const max = options?.max ?? MAX_REQUESTS;
  const now = Date.now();

  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // First request in this window
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
}
