import { RedisService } from './redis';
import { validateSessionId } from '../utils/session';

export class SessionService {
  private redis: RedisService;
  private readonly DEFAULT_LIMIT = 3;
  private readonly PREMIUM_LIMIT = 50;
  private readonly FREE_TIER_TTL = 24 * 60 * 60; // 24 hours
  private readonly PREMIUM_TIER_TTL = 30 * 24 * 60 * 60; // 30 days
  
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
      await this.redis.redis.expire(`limit:${sessionId}`, this.FREE_TIER_TTL);
      await this.redis.redis.expire(`generations:${sessionId}`, this.FREE_TIER_TTL);
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

    const multi = this.redis.redis.multi();
    
    // Set new limit
    multi.set(`limit:${sessionId}`, this.PREMIUM_LIMIT);
    
    // Reset usage counter
    multi.set(`generations:${sessionId}`, 0);
    
    // Set premium flag
    multi.set(`premium:${sessionId}`, '1');
    
    // Set premium expiry
    multi.expire(`limit:${sessionId}`, this.PREMIUM_TIER_TTL);
    multi.expire(`generations:${sessionId}`, this.PREMIUM_TIER_TTL);
    multi.expire(`premium:${sessionId}`, this.PREMIUM_TIER_TTL);

    await multi.exec();
  }

  async getSessionStatus(sessionId: string): Promise<{
    remaining: number;
    isPremium: boolean;
    expiresIn: number;
    totalLimit: number;
  }> {
    if (!validateSessionId(sessionId)) {
      throw new Error('Invalid session ID');
    }

    const [remaining, isPremium, ttl] = await Promise.all([
      this.getRemainingGenerations(sessionId),
      this.redis.redis.get(`premium:${sessionId}`),
      this.redis.redis.ttl(`limit:${sessionId}`)
    ]);

    const premium = isPremium === '1';

    return {
      remaining,
      isPremium: premium,
      expiresIn: ttl,
      totalLimit: premium ? this.PREMIUM_LIMIT : this.DEFAULT_LIMIT
    };
  }
} 