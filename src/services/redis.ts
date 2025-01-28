import Redis from 'ioredis';
import { LIMITS } from '../config/constants';

interface ProStatus {
  isPro: boolean;
  remainingTime?: number;
  analysesRemaining?: number;
}

export class RedisService {
  public redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 5,
      enableReadyCheck: true,
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  async hmset(key: string, data: Record<string, any>): Promise<void> {
    await this.redis.hmset(key, data);
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    const data = await this.redis.hgetall(key);
    return Object.keys(data).length > 0 ? data : null;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async upgradeToPro(ip: string): Promise<void> {
    const key = `user:${ip}`;
    const proExpiry = Date.now() + LIMITS.PRO_TIER.DURATION;

    await this.redis.hset(key, {
      tier: 'pro',
      proExpiryTime: proExpiry,
      analysisCount: 0
    });

    await this.redis.expire(key, LIMITS.PRO_TIER.DURATION / 1000);
  }

  async getProStatus(ip: string): Promise<ProStatus> {
    const key = `user:${ip}`;
    const userData = await this.redis.hgetall(key);

    if (!userData || userData.tier !== 'pro') {
      return { isPro: false };
    }

    const now = Date.now();
    const expiryTime = parseInt(userData.proExpiryTime);
    const remainingTime = Math.max(0, expiryTime - now);
    const analysesRemaining = LIMITS.PRO_TIER.ANALYSES_LIMIT - 
      parseInt(userData.analysisCount || '0');

    return {
      isPro: remainingTime > 0,
      remainingTime,
      analysesRemaining
    };
  }
} 