import { PaymentService } from './payment';
import { SessionService } from './session';
import { config } from '../config/env';
import crypto from 'crypto';

interface WebhookEvent {
  id: string;
  key: string;
  data: {
    object: {
      id: string;
      status: string;
      metadata: {
        sessionId: string;
      };
    };
  };
}

export class WebhookService {
  private paymentService: PaymentService;
  private sessionService: SessionService;

  constructor() {
    this.paymentService = new PaymentService();
    this.sessionService = new SessionService();
  }

  verifySignature(payload: string, signature: string): boolean {
    const signatureHash = crypto
      .createHmac('sha256', config.OMISE_SECRET_KEY)
      .update(payload)
      .digest('hex');

    return signature === signatureHash;
  }

  async handleEvent(event: WebhookEvent): Promise<void> {
    const { data } = event;
    const { object } = data;

    switch (event.key) {
      case 'charge.complete':
        await this.handleChargeComplete(object);
        break;
      case 'charge.failed':
        await this.handleChargeFailed(object);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.key}`);
    }
  }

  private async handleChargeComplete(charge: any): Promise<void> {
    try {
      if (charge.status === 'successful' && charge.paid) {
        const { sessionId } = charge.metadata;
        await this.sessionService.upgradeToPremuim(sessionId);
        
        console.log(`Successfully upgraded session ${sessionId} to premium`);
      }
    } catch (error) {
      console.error('Error handling charge.complete:', error);
      throw error;
    }
  }

  private async handleChargeFailed(charge: any): Promise<void> {
    try {
      const { sessionId } = charge.metadata;
      console.error(`Payment failed for session ${sessionId}:`, charge.failure_message);
      
      // You could implement failure notifications here
    } catch (error) {
      console.error('Error handling charge.failed:', error);
      throw error;
    }
  }
} 