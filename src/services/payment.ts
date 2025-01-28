import { PRICING } from '../config/constants';
import Omise from 'omise';
import { PromoCodeService } from './promoCode';
import { config } from '../config/env';

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

interface ChargeParams {
  token: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export class PaymentService {
  private promoService: PromoCodeService;
  private omise: any;

  constructor() {
    this.promoService = new PromoCodeService();

    if (!config.OMISE_SECRET_KEY || !config.OMISE_PUBLIC_KEY) {
      throw new Error('Omise API keys are required');
    }

    this.omise = Omise({
      publicKey: config.OMISE_PUBLIC_KEY,
      secretKey: config.OMISE_SECRET_KEY
    });
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      const discount = await this.promoService.validatePromoCode(details.promoCode || '');
      const finalAmount = PRICING.PRO_PRICE * (1 - (discount?.discountPercentage || 0) / 100);

      const charge = await this.omise.charges.create({
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

  async createCharge(params: ChargeParams) {
    try {
      const charge = await this.omise.charges.create({
        amount: params.amount,
        currency: params.currency,
        card: params.token,
        description: params.description,
        metadata: params.metadata,
        capture: true,
        return_uri: `${config.CLIENT_URL}/upgrade/complete`
      });

      return charge;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  async retrieveCharge(chargeId: string) {
    try {
      return await this.omise.charges.retrieve(chargeId);
    } catch (error) {
      console.error('Retrieve charge error:', error);
      throw error;
    }
  }
} 