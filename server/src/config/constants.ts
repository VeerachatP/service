export const PRICING = {
  PRO_PRICE: 3.99,
  CURRENCY: 'USD',
  DISCOUNTS: {
    GENERAL: 10,
    VIP: 50,
    INFLUENCER: 100
  }
};

export const LIMITS = {
  FREE_TIER: {
    ANALYSES_PER_HOUR: 3,
    RESET_INTERVAL: 60 * 60 * 1000 // 1 hour in ms
  },
  PRO_TIER: {
    ANALYSES_LIMIT: 10,
    DURATION: 60 * 60 * 1000 // 1 hour in ms
  }
};

export const PROMO_CODE_VALIDITY = 15 * 24 * 60 * 60 * 1000; // 15 days in ms 