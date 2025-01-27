import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from 'src/config/env';
import upgradeRoutes from 'src/routes/upgrade';
import promoRoutes from 'src/routes/promo';
import healthRoutes from 'src/routes/health';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/upgrade', upgradeRoutes);
app.use('/api/promo', promoRoutes);
app.use('/health', healthRoutes);

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

export default app; 