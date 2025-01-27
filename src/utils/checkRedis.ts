import { RedisService } from 'src/services/redis';

export const waitForRedis = async (maxRetries = 5, retryInterval = 5000): Promise<boolean> => {
  const redis = new RedisService();
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await redis.redis.ping();
      console.log('Redis connection established');
      return true;
    } catch (error) {
      console.log(`Redis connection attempt ${retries + 1}/${maxRetries} failed`);
      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
  }

  return false;
}; 