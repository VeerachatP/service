import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { config } from './config/env';
import { RedisService } from './services/redis';
import upgradeRoutes from './routes/upgrade';
import promoRoutes from './routes/promo';
import healthRoutes from './routes/health';
import nameRoutes from './routes/names';
import webhookRoutes from './routes/webhook';
import { waitForRedis } from './utils/checkRedis';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Origin', 
    'Accept',
    'omise-key',
    'omise-signature',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['omise-key', 'omise-signature']
}));
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check Redis connection
    const redis = new RedisService();
    await redis.redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: 'connected',
        api: 'running'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
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

// Routes
const apiRouter = express.Router();
apiRouter.use('/upgrade', upgradeRoutes);
apiRouter.use('/promo', promoRoutes);
apiRouter.use('/health', healthRoutes);
apiRouter.use('/names', nameRoutes);
apiRouter.use('/webhook', webhookRoutes);
app.use('/api/v1', apiRouter);

// Add debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log('404 for:', req.method, req.path);
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// Start server
const port = config.PORT || 3001;

let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    // Wait for Redis to be available
    const redisAvailable = await waitForRedis(10, 3000);
    
    if (!redisAvailable) {
      console.error('Could not connect to Redis. Exiting...');
      process.exit(1);
    }

    server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 