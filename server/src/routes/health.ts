import { Router } from 'express';
import { RedisService } from '../services/redis';

const router = Router();
const redis = new RedisService();

router.get('/', async (req, res) => {
  try {
    // Check Redis connection
    await redis.redis.ping();
    
    res.json({
      status: 'healthy',
      redis: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      redis: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 