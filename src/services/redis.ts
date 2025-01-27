import Redis from 'ioredis';
import { LIMITS } from 'src/config/constants';

interface ProStatus {
  isPro: boolean;
  remainingTime?: number;
  analysesRemaining?: number;
}

class RedisService {
  public redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  // ... rest of the code
}

export { RedisService }; 