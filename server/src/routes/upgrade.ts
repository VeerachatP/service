import { Router } from 'express';
import UpgradeController from '../controllers/upgradeController';

const router = Router();
const upgradeController = new UpgradeController();

router.post('/upgrade', upgradeController.upgradeUser);
router.get('/status', upgradeController.checkProStatus);

export default router; 