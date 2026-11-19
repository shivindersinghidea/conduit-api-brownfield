import { Request, Response, NextFunction } from 'express';

type Entry = { count: number; windowStart: number };
const store = new Map<string, Entry>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `${ip}`;
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || now - entry.windowStart >= windowMs) {
        store.set(key, { count: 1, windowStart: now });
        return next();
      }

      if (entry.count < maxRequests) {
        entry.count += 1;
        store.set(key, entry);
        return next();
      }

      // exceeded
      const retryAfterMs = entry.windowStart + windowMs - now;
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);
      res.set('Retry-After', String(retryAfterSec));
      res.status(429).json({ errors: { message: ['Too many requests'] } });
    } catch (err) {
      next(err);
    }
  };
};

export const _rateLimitStore = store;
