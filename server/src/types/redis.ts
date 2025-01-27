interface UserSession {
  ip: string;
  tier: 'free' | 'pro';
  analysisCount: number;
  lastReset: number;
  proExpiryTime?: number;
}

interface PromoCode {
  code: string;
  type: 'GENERAL' | 'VIP' | 'INFLUENCER';
  discountPercentage: number;
  validUntil: number;
  campaignSource: string;
} 