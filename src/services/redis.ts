import Redis from 'ioredis';
import { LIMITS } from '../config/constants';
import { config } from '../config/env';

interface ProStatus {
  isPro: boolean;
  remainingTime?: number;
  analysesRemaining?: number;
}

export class RedisService {
  public redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    console.log('Attempting to connect to Redis at:', redisUrl);

    this.redis = new Redis(redisUrl, {
      retryStrategy(times) {
        const delay = Math.min(times * 500, 5000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      reconnectOnError(err) {
        console.error('Redis reconnect error:', err);
        return true;
      }
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', {
        message: error.message,
        code: error.code,
        hostname: error.hostname,
        syscall: error.syscall
      });
    });

    this.redis.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      console.log('Redis reconnecting...');
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