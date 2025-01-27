import { PRICING } from '../config/constants';
import Omise from 'omise';
import PromoCodeService from './promoCode';

const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!
});

interface PaymentDetails {
  amount: number;
  currency: string;
  promoCode?: string;
  omiseToken: string;
  ip: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class PaymentService {
  private promoService: PromoCodeService;

  constructor() {
    this.promoService = new PromoCodeService();
  }

  private async calculateDiscount(promoCode?: string): Promise<number> {
    if (!promoCode) return 0;
    
    const promoDetails = await this.promoService.validatePromoCode(promoCode);
    return promoDetails?.discountPercentage || 0;
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      const discount = await this.calculateDiscount(details.promoCode);
      const finalAmount = PRICING.PRO_PRICE * (1 - discount / 100);

      const charge = await omise.charges.create({
        amount: Math.round(finalAmount * 100), // Convert to smallest currency unit
        currency: 'USD',
        card: details.omiseToken,
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

export default PaymentService; 