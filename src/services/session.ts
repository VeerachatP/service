import { RedisService } from './redis';
import { validateSessionId } from '../utils/session';

export class SessionService {
  private redis: RedisService;
  private readonly DEFAULT_LIMIT = 3;
  private readonly PREMIUM_LIMIT = 50;
  
  constructor() {
    this.redis = new RedisService();
  }

  async initSession(sessionId: string): Promise<void> {
    if (!validateSessionId(sessionId)) {
      throw new Error('Invalid session ID');
    }

    const exists = await this.redis.redis.exists(`limit:${sessionId}`);
    if (!exists) {
      await this.redis.redis.set(`limit:${sessionId}`, this.DEFAULT_LIMIT);
      await this.redis.redis.set(`generations:${sessionId}`, 0);
      // Set 24-hour expiry for free tier
      await this.redis.redis.expire(`limit:${sessionId}`, 24 * 60 * 60);
      await this.redis.redis.expire(`generations:${sessionId}`, 24 * 60 * 60);
    }
  }

  async getRemainingGenerations(sessionId: string): Promise<number> {
    if (!validateSessionId(sessionId)) {
      throw new Error('Invalid session ID');
    }

    const [used, limit] = await Promise.all([
      this.redis.redis.get(`generations:${sessionId}`),
      this.redis.redis.get(`limit:${sessionId}`)
    ]);

    return Math.max(0, parseInt(limit || String(this.DEFAULT_LIMIT)) - parseInt(used || '0'));
  }

  async incrementGenerations(sessionId: string): Promise<boolean> {
    if (!validateSessionId(sessionId)) {
      throw new Error('Invalid session ID');
    }

    const remaining = await this.getRemainingGenerations(sessionId);
    if (remaining <= 0) return false;

    await this.redis.redis.incr(`generations:${sessionId}`);
    return true;
  }

  async upgradeToPremuim(sessionId: string): Promise<void> {
    if (!validateSessionId(sessionId)) {
      throw new Error('Invalid session ID');
    }

    await this.redis.redis.set(`limit:${sessionId}`, this.PREMIUM_LIMIT);
    // Set 30-day expiry for premium tier
    await this.redis.redis.expire(`limit:${sessionId}`, 30 * 24 * 60 * 60);
  }

  async getSessionStatus(sessionId: string): Promise<{
    remaining: number;
    isPremium: boolean;
    expiresIn: number;
  }> {
    if (!validateSessionId(sessionId)) {
      throw new Error('Invalid session ID');
    }

    const [remaining, limit, ttl] = await Promise.all([
      this.getRemainingGenerations(sessionId),
      this.redis.redis.get(`limit:${sessionId}`),
      this.redis.redis.ttl(`limit:${sessionId}`)
    ]);

    return {
      remaining,
      isPremium: parseInt(limit || '0') > this.DEFAULT_LIMIT,
      expiresIn: ttl
    };
  }
} 