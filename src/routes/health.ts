import { Router } from 'express';
import { RedisService } from '../services/redis';

const router = Router();
const redis = new RedisService();

router.get('/', async (req, res) => {
  try {
    // Check Redis connection
    const pingResult = await Promise.race([
      redis.redis.ping(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis ping timeout')), 10000)
      )
    ]);
    
    console.log('Health check ping result:', pingResult);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: pingResult === 'PONG' ? 'connected' : 'degraded',
        api: 'running'
      }
    });
  } catch (error) {
    console.error('Health check failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: error instanceof Error ? error.message : 'disconnected',
        api: 'running'
      }
    });
  }
});

export default router; 