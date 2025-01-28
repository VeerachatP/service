import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/env';
import upgradeRoutes from './routes/upgrade';
import promoRoutes from './routes/promo';
import healthRoutes from './routes/health';
import { waitForRedis } from './utils/checkRedis';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/v1/upgrade', upgradeRoutes);
app.use('/api/v1/promo', promoRoutes);
app.use('/api/v1/health', healthRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// Start server
const port = config.PORT || 3001;

const startServer = async () => {
  try {
    // Wait for Redis to be available
    const redisAvailable = await waitForRedis(10, 3000);
    
    if (!redisAvailable) {
      console.error('Could not connect to Redis. Exiting...');
      process.exit(1);
    }

    const server = app.listen(port, () => {
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