import { Request, Response } from 'express';
import { PaymentService } from 'src/services/payment';
import { RedisService } from 'src/services/redis';
import { LIMITS } from 'src/config/constants';

export class UpgradeController {
  private paymentService: PaymentService;
  private redisService: RedisService;

  constructor() {
    this.paymentService = new PaymentService();
    this.redisService = new RedisService();
  }

  upgradeUser = async (req: Request, res: Response) => {
    const { promoCode } = req.body;
    const clientIp = req.ip;

    if (!clientIp) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required'
      });
    }

    try {
      const paymentResult = await this.paymentService.processPayment({
        amount: 3.99,
        currency: 'USD',
        promoCode,
        ip: clientIp
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          error: paymentResult.error
        });
      }

      await this.redisService.upgradeToPro(clientIp);

      res.json({
        success: true,
        message: 'Successfully upgraded to Pro!',
        expiresIn: LIMITS.PRO_TIER.DURATION / 1000
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Upgrade failed. Please try again.'
      });
    }
  };

  checkProStatus = async (req: Request, res: Response) => {
    const clientIp = req.ip;

    if (!clientIp) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required'
      });
    }

    try {
      const status = await this.redisService.getProStatus(clientIp);
      res.json(status);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check Pro status'
      });
    }
  };
} 