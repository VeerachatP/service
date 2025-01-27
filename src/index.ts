import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from 'src/config/env';
import upgradeRoutes from 'src/routes/upgrade';
import promoRoutes from 'src/routes/promo';
import healthRoutes from 'src/routes/health';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/upgrade', upgradeRoutes);
app.use('/api/promo', promoRoutes);
app.use('/health', healthRoutes);

const port = config.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app; 