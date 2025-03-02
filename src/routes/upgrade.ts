import { Router } from 'express';
import { UpgradeController } from '../controllers/upgradeController';
import { ipCheckMiddleware } from '../middleware/ipCheck';

const router = Router();
const upgradeController = new UpgradeController();

router.post('/upgrade', ipCheckMiddleware, upgradeController.upgradeUser);
router.get('/status', ipCheckMiddleware, upgradeController.checkProStatus);

export default router; 