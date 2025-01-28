import express from 'express';
import { PaymentService } from '../services/payment';
import { SessionService } from '../services/session';
import { validateSessionId } from '../utils/session';

const router = express.Router();
const paymentService = new PaymentService();
const sessionService = new SessionService();

router.post('/', async (req, res) => {
  try {
    const { token, sessionId } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Payment token is required'
      });
    }

    if (!sessionId || !validateSessionId(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    // Process payment with Omise
    const charge = await paymentService.createCharge({
      token,
      amount: 999, // $9.99 in cents
      currency: 'usd',
      description: 'Baby Name Generator Pro Subscription',
      metadata: {
        sessionId,
        subscriptionType: 'pro'
      }
    });

    if (charge.paid) {
      // Upgrade session to premium
      await sessionService.upgradeToPremuim(sessionId);
      
      res.json({
        success: true,
        data: {
          charge: {
            id: charge.id,
            status: charge.status
          },
          subscription: {
            type: 'pro',
            expiresIn: 30 * 24 * 60 * 60 // 30 days in seconds
          }
        }
      });
    } else {
      res.status(402).json({
        success: false,
        error: 'Payment failed',
        data: {
          charge: {
            id: charge.id,
            status: charge.status,
            failureMessage: charge.failure_message
          }
        }
      });
    }
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process upgrade'
    });
  }
});

export default router; 