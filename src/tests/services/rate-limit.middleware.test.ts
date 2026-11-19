import { rateLimit, _rateLimitStore } from '../../app/routes/middleware/rate-limit.middleware';

describe('RateLimit middleware', () => {
  beforeEach(() => {
    _rateLimitStore.clear();
  });

  test('allows up to limit and then blocks', async () => {
    const middleware = rateLimit(10, 60 * 1000);
    const req: any = { ip: '1.2.3.4' };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn(),
    };

    const next = jest.fn();

    // first 10 requests should call next
    for (let i = 0; i < 10; i++) {
      await middleware(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(10);

    // 11th should be blocked
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
    expect(res.json).toHaveBeenCalledWith({ errors: { message: ['Too many requests'] } });
  });
});
