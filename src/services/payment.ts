import { PRICING } from 'src/config/constants';
import Omise from 'omise';
import { PromoCodeService } from 'src/services/promoCode';

class PaymentService {
  private promoService: PromoCodeService;

  constructor() {
    this.promoService = new PromoCodeService();
  }

  // ... rest of the code
}

export { PaymentService }; 