import { RedisService } from './redis';

export class SessionService {
  private redis: RedisService;
  
  constructor() {
    this.redis = new RedisService();
  }

  async getRemainingGenerations(sessionId: string): Promise<number> {
    const used = await this.redis.redis.get(`generations:${sessionId}`) || '0';
    const limit = await this.redis.redis.get(`limit:${sessionId}`) || '3';
    return Math.max(0, parseInt(limit) - parseInt(used));
  }

  async incrementGenerations(sessionId: string): Promise<boolean> {
    const remaining = await this.getRemainingGenerations(sessionId);
    if (remaining <= 0) return false;

    await this.redis.redis.incr(`generations:${sessionId}`);
    // Set expiry for 24 hours if not exists
    await this.redis.redis.expire(`generations:${sessionId}`, 24 * 60 * 60);
    return true;
  }

  async upgradeLimit(sessionId: string): Promise<void> {
    await this.redis.redis.set(`limit:${sessionId}`, '50');
    await this.redis.redis.expire(`limit:${sessionId}`, 30 * 24 * 60 * 60); // 30 days
  }
} 