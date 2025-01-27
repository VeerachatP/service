import { Request, Response } from 'express';
import { PromoCodeService } from 'src/services/promoCode';

export class PromoController {
  private promoService: PromoCodeService;

  constructor() {
    this.promoService = new PromoCodeService();
  }

  validatePromo = async (req: Request, res: Response) => {
    const { code } = req.params;

    try {
      const promoDetails = await this.promoService.validatePromoCode(code);

      if (!promoDetails) {
        return res.status(404).json({
          success: false,
          error: 'Invalid or expired promotional code'
        });
      }

      res.json({
        success: true,
        data: {
          discountPercentage: promoDetails.discountPercentage,
          type: promoDetails.type
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to validate promotional code'
      });
    }
  };

  createPromo = async (req: Request, res: Response) => {
    const { code, type, campaignSource } = req.body;

    try {
      if (!code || !type) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const promoDetails = await this.promoService.createPromoCode({
        code,
        type,
        discountPercentage: this.promoService.getDiscountPercentage(type),
        campaignSource
      });

      res.json({
        success: true,
        data: promoDetails
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create promotional code'
      });
    }
  };
} 