import type { Request, Response, NextFunction } from "express";

interface Entry {
  count: number;
  resetAt: number;
}

class InMemoryStore {
  private entries = new Map<string, Entry>();

  hit(key: string, windowMs: number) {
    const now = Date.now();
    const existing = this.entries.get(key);
    if (!existing || now > existing.resetAt) {
      this.entries.set(key, { count: 1, resetAt: now + windowMs });
      return { limit: 0, remaining: 0, resetTime: now + windowMs };
    }
    existing.count++;
    return { limit: 0, remaining: 0, resetTime: existing.resetAt };
  }

  count(key: string) {
    const existing = this.entries.get(key);
    if (!existing || Date.now() > existing.resetAt) return 0;
    return existing.count;
  }
}

const store = new InMemoryStore();

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: object;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyGenerator = (req) => req.ip || "unknown", message } = options;

  return (_req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(_req);
    const result = store.hit(key, windowMs);
    const current = store.count(key);

    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - current)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(result.resetTime / 1000)));

    if (current > max) {
      return res.status(429).json(message ?? { error: "Too many requests" });
    }
    next();
  };
}
