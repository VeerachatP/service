import { Router } from 'express';
import { PromoController } from 'src/controllers/promoController';

const router = Router();
const promoController = new PromoController();

router.get('/validate/:code', promoController.validatePromo);
router.post('/create', promoController.createPromo);

export default router; 