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
  return_uri?: string;
  capture?: boolean;
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
      if (!params.token) {
        throw new Error('Payment token is required');
      }

      const charge = await this.omise.charges.create({
        amount: params.amount,
        currency: params.currency,
        card: params.token,
        description: params.description,
        metadata: params.metadata,
        capture: false,
        return_uri: process.env.NODE_ENV === 'production'
          ? 'https://service-production-ddb7.up.railway.app/upgrade/complete'
          : 'http://localhost:3001/upgrade/complete'
      });

      console.log('Charge created:', charge);
      return charge;
    } catch (error) {
      console.error('Payment error:', error instanceof Error ? error.message : error);
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