import { PRICING } from 'src/config/constants';
import Omise from 'omise';
import { PromoCodeService } from 'src/services/promoCode';
import { config } from 'src/config/env';

interface PaymentDetails {
  amount: number;
  currency: string;
  promoCode?: string;
  ip: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

const omise = Omise({
  publicKey: config.OMISE_PUBLIC_KEY,
  secretKey: config.OMISE_SECRET_KEY
});

export class PaymentService {
  private promoService: PromoCodeService;

  constructor() {
    this.promoService = new PromoCodeService();
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      const discount = await this.promoService.validatePromoCode(details.promoCode || '');
      const finalAmount = PRICING.PRO_PRICE * (1 - (discount?.discountPercentage || 0) / 100);

      const charge = await omise.charges.create({
        amount: Math.round(finalAmount * 100), // Convert to smallest currency unit
        currency: 'USD',
        capture: true,
        metadata: {
          ip: details.ip,
          promoCode: details.promoCode
        }
      });

      return {
        success: charge.status === 'successful',
        transactionId: charge.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }
} 