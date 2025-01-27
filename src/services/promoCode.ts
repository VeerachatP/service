import { RedisService } from 'src/services/redis';
import { PRICING } from 'src/config/constants';

interface PromoCodeDetails {
  code: string;
  type: 'GENERAL' | 'VIP' | 'INFLUENCER';
  discountPercentage: number;
  validUntil: number;
  campaignSource?: string;
}

export class PromoCodeService {
  private redis: RedisService;

  constructor() {
    this.redis = new RedisService();
  }

  async validatePromoCode(code: string): Promise<PromoCodeDetails | null> {
    const key = `promo:${code}`;
    const promoData = await this.redis.hgetall(key);

    if (!promoData || !promoData.type) {
      return null;
    }

    const validUntil = parseInt(promoData.validUntil);
    if (validUntil < Date.now()) {
      return null;
    }

    return {
      code,
      type: promoData.type as 'GENERAL' | 'VIP' | 'INFLUENCER',
      discountPercentage: parseInt(promoData.discountPercentage),
      validUntil,
      campaignSource: promoData.campaignSource
    };
  }

  async createPromoCode(details: Omit<PromoCodeDetails, 'validUntil'>): Promise<PromoCodeDetails> {
    const validUntil = Date.now() + (15 * 24 * 60 * 60 * 1000); // 15 days
    const key = `promo:${details.code}`;

    const promoData = {
      ...details,
      validUntil,
      discountPercentage: PRICING.DISCOUNTS[details.type]
    };

    await this.redis.hmset(key, promoData);
    await this.redis.expire(key, 15 * 24 * 60 * 60); // 15 days in seconds

    return promoData;
  }

  getDiscountPercentage(type: 'GENERAL' | 'VIP' | 'INFLUENCER'): number {
    return PRICING.DISCOUNTS[type];
  }
} 