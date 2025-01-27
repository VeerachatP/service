export const PRICING = {
  PRO_PRICE: 3.99,
  CURRENCY: 'USD',
  DISCOUNTS: {
    GENERAL: 10,
    VIP: 25,
    INFLUENCER: 15
  }
};

export const LIMITS = {
  PRO_TIER: {
    DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    ANALYSES_LIMIT: 100
  },
  FREE_TIER: {
    ANALYSES_LIMIT: 3
  }
}; 