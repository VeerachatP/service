import { RedisService } from 'src/services/redis';
import { PRICING } from 'src/config/constants';

class PromoCodeService {
  private redis: RedisService;

  constructor() {
    this.redis = new RedisService();
  }

  // ... rest of the code
}

export { PromoCodeService }; 