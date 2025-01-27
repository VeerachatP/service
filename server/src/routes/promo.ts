import { Router } from 'express';
import PromoController from '../controllers/promoController';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { validatePromoCode } from '../middleware/validatePromo';

const router = Router();
const promoController = new PromoController();

router.get('/validate/:code', promoController.validatePromo);
router.post(
  '/create',
  authMiddleware,
  adminOnly,
  validatePromoCode,
  promoController.createPromo
);

export default router; 