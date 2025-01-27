import { Request, Response } from 'express';
import PaymentService from '../services/payment';
import { RedisService } from '../services/redis';
import { LIMITS } from '../config/constants';

class UpgradeController {
  private paymentService: PaymentService;
  private redisService: RedisService;

  constructor() {
    this.paymentService = new PaymentService();
    this.redisService = new RedisService();
  }

  async upgradeUser = async (req: Request, res: Response) => {
    const { promoCode } = req.body;
    const ip = req.ip;

    try {
      // Process payment
      const paymentResult = await this.paymentService.processPayment({
        amount: 3.99,
        currency: 'USD',
        promoCode,
        ip
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          error: paymentResult.error
        });
      }

      // Update user session in Redis
      await this.redisService.upgradeToPro(ip);

      res.json({
        success: true,
        message: 'Successfully upgraded to Pro!',
        expiresIn: LIMITS.PRO_TIER.DURATION / 1000 // Convert to seconds
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Upgrade failed. Please try again.'
      });
    }
  };

  async checkProStatus = async (req: Request, res: Response) => {
    const ip = req.ip;

    try {
      const status = await this.redisService.getProStatus(ip);
      res.json(status);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check Pro status'
      });
    }
  };
}

export default UpgradeController; 