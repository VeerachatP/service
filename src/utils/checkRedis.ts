import { RedisService } from '../services/redis';

export const waitForRedis = async (maxRetries = 5, retryInterval = 5000): Promise<boolean> => {
  const redis = new RedisService();
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`Attempting Redis connection (${retries + 1}/${maxRetries})...`);
      await redis.redis.connect();
      await redis.redis.ping();
      console.log('Redis connection established');
      return true;
    } catch (error) {
      console.error(`Redis connection attempt ${retries + 1}/${maxRetries} failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: process.env.REDIS_URL ? 'Set' : 'Not set'
      });
      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
  }

  if (retries >= maxRetries) {
    console.error('Max Redis connection retries reached');
  }

  return false;
}; 